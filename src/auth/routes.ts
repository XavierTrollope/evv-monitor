import { Router, Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../lib/db";
import { env } from "../lib/config";
import { logger } from "../lib/logger";
import { requireAuth, JwtPayload } from "./middleware";

export const authRouter = Router();

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_SHORT = "24h";
const REFRESH_LONG = "30d";

function setTokenCookies(res: Response, user: { id: number; email: string; role: string }, rememberMe: boolean): void {
  const payload: JwtPayload = { userId: user.id, email: user.email, role: user.role };

  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshExpiry = rememberMe ? REFRESH_LONG : REFRESH_SHORT;
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: refreshExpiry });

  const cookieBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
  };

  const accessMaxAge = 15 * 60 * 1000;
  const refreshMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;

  res.cookie("access_token", accessToken, { ...cookieBase, maxAge: accessMaxAge });
  res.cookie("refresh_token", refreshToken, { ...cookieBase, maxAge: refreshMaxAge, path: "/api/auth" });

  prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: bcrypt.hashSync(refreshToken, 10) },
  }).catch((err) => logger.error({ err }, "Failed to store refresh token"));
}

// POST /auth/login
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
});

authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    setTokenCookies(res, user, body.rememberMe);

    res.json({
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", issues: err.issues });
      return;
    }
    logger.error({ err }, "Login failed");
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /auth/refresh — exchange refresh token for new access token
authRouter.post("/refresh", async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) {
      res.status(401).json({ error: "No refresh token" });
      return;
    }

    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
    } catch {
      res.status(401).json({ error: "Invalid refresh token" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || !user.refreshToken) {
      res.status(401).json({ error: "User not found or session revoked" });
      return;
    }

    const tokenValid = await bcrypt.compare(token, user.refreshToken);
    if (!tokenValid) {
      res.status(401).json({ error: "Refresh token revoked" });
      return;
    }

    const rememberMe = (() => {
      try {
        const decoded = jwt.decode(token) as { exp?: number };
        if (!decoded?.exp) return false;
        const remaining = decoded.exp * 1000 - Date.now();
        return remaining > 2 * 24 * 60 * 60 * 1000;
      } catch { return false; }
    })();

    setTokenCookies(res, user, rememberMe);

    res.json({
      user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role },
    });
  } catch (err) {
    logger.error({ err }, "Token refresh failed");
    res.status(500).json({ error: "Refresh failed" });
  }
});

// POST /auth/logout
authRouter.post("/logout", async (req: Request, res: Response) => {
  const token = req.cookies?.access_token;
  if (token) {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      await prisma.user.update({
        where: { id: payload.userId },
        data: { refreshToken: null },
      });
    } catch { /* token already invalid */ }
  }

  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/api/auth" });
  res.json({ success: true });
});

// GET /auth/me — return current user (used by frontend to check session)
authRouter.get("/me", requireAuth, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

// POST /auth/forgot-password
const forgotSchema = z.object({
  email: z.string().email(),
});

authRouter.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const body = forgotSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({ message: "If that email exists, a reset link has been generated." });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });

    const resetUrl = `${req.protocol}://${req.get("host")}/reset-password?token=${resetToken}`;

    logger.info({ email: user.email, resetUrl }, "Password reset requested — use the URL to reset");

    res.json({ message: "If that email exists, a reset link has been generated.", resetUrl });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", issues: err.issues });
      return;
    }
    logger.error({ err }, "Forgot password failed");
    res.status(500).json({ error: "Request failed" });
  }
});

// POST /auth/reset-password
const resetSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

authRouter.post("/reset-password", async (req: Request, res: Response) => {
  try {
    const body = resetSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        resetToken: body.token,
        resetTokenExp: { gte: new Date() },
      },
    });

    if (!user) {
      res.status(400).json({ error: "Invalid or expired reset token" });
      return;
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExp: null,
        refreshToken: null,
      },
    });

    logger.info({ email: user.email }, "Password reset successful");
    res.json({ message: "Password has been reset. You can now log in." });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", issues: err.issues });
      return;
    }
    logger.error({ err }, "Reset password failed");
    res.status(500).json({ error: "Reset failed" });
  }
});

// POST /auth/change-password (authenticated)
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

authRouter.post("/change-password", requireAuth, async (req: Request, res: Response) => {
  try {
    const body = changePasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Current password is incorrect" });
      return;
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "Validation failed", issues: err.issues });
      return;
    }
    logger.error({ err }, "Change password failed");
    res.status(500).json({ error: "Change password failed" });
  }
});
