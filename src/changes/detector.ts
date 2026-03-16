import * as Diff from "diff";
import * as fs from "fs";
import * as path from "path";

export interface DiffResult {
  linesAdded: number;
  linesRemoved: number;
  totalLinesOld: number;
  totalLinesNew: number;
  changeScore: number;
  diffPreview: string;
  summary: string;
  sections: SectionSummary[];
}

export interface SectionSummary {
  label: string;
  linesAdded: number;
  linesRemoved: number;
}

interface NoiseFilter {
  name: string;
  regex: string;
  flags?: string;
  description?: string;
}

interface NoiseFiltersConfig {
  patterns: NoiseFilter[];
}

let compiledFilters: RegExp[] | null = null;

function loadNoiseFilters(): RegExp[] {
  if (compiledFilters) return compiledFilters;

  const configPath = path.resolve(
    __dirname,
    "../../config/noise-filters.json"
  );
  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const config: NoiseFiltersConfig = JSON.parse(raw);
    compiledFilters = config.patterns.map(
      (p) => new RegExp(p.regex, p.flags ?? "")
    );
  } catch {
    compiledFilters = [];
  }
  return compiledFilters;
}

function applyNoiseFilters(text: string): string {
  const filters = loadNoiseFilters();
  return text
    .split("\n")
    .filter((line) => !filters.some((rx) => rx.test(line)))
    .join("\n");
}

function applyIgnoreRules(text: string, ignorePatterns: RegExp[]): string {
  if (ignorePatterns.length === 0) return text;
  return text
    .split("\n")
    .filter((line) => !ignorePatterns.some((rx) => rx.test(line)))
    .join("\n");
}

export function compileIgnorePatterns(patterns: string[]): RegExp[] {
  return patterns
    .map((p) => {
      try {
        return new RegExp(p, "i");
      } catch {
        return null;
      }
    })
    .filter((rx): rx is RegExp => rx !== null);
}

function detectSections(changes: Diff.Change[]): SectionSummary[] {
  const sectionMap = new Map<string, { added: number; removed: number }>();
  let currentSection = "General content";

  for (const part of changes) {
    const lines = part.value.split("\n");

    for (const line of lines) {
      const heading = line.match(/^#{1,3}\s+(.+)|^([A-Z][A-Za-z\s]{2,40}):?\s*$/);
      if (heading && !part.added && !part.removed) {
        currentSection = (heading[1] || heading[2]).trim();
      }
    }

    if (part.added || part.removed) {
      const entry = sectionMap.get(currentSection) ?? { added: 0, removed: 0 };
      const lineCount = part.count ?? lines.length;
      if (part.added) entry.added += lineCount;
      else entry.removed += lineCount;
      sectionMap.set(currentSection, entry);
    }
  }

  return [...sectionMap.entries()]
    .map(([label, counts]) => ({
      label,
      linesAdded: counts.added,
      linesRemoved: counts.removed,
    }))
    .sort((a, b) => (b.linesAdded + b.linesRemoved) - (a.linesAdded + a.linesRemoved));
}

function buildDetailedSummary(
  linesAdded: number,
  linesRemoved: number,
  changeScore: number,
  sections: SectionSummary[],
  changedLines: string[]
): string {
  const parts: string[] = [];

  const magnitude =
    changeScore >= 30 ? "Major" : changeScore >= 10 ? "Moderate" : "Minor";

  parts.push(
    `${magnitude} change: ${linesAdded + linesRemoved} lines affected (${linesAdded} added, ${linesRemoved} removed)`
  );

  if (sections.length > 0 && sections[0].label !== "General content") {
    const topSections = sections
      .slice(0, 3)
      .map((s) => s.label)
      .join(", ");
    parts.push(`Sections affected: ${topSections}`);
  }

  const keywords: Record<string, string> = {
    "deadline": "deadline/date references",
    "effective": "effective date references",
    "policy": "policy language",
    "requirement": "requirement details",
    "billing": "billing/claims info",
    "provider": "provider information",
    "rate": "rate/payment info",
    "contact": "contact details",
    "phone": "contact details",
    "email": "contact details",
    "evv": "EVV-specific content",
    "compliance": "compliance guidance",
    "enrollment": "enrollment info",
    "training": "training materials",
    "form": "forms/documents",
    "schedule": "schedule/timeline",
    "certification": "certification details",
    "waiver": "waiver program info",
    "medicaid": "Medicaid references",
    "eligibility": "eligibility criteria",
  };

  const detectedTopics = new Set<string>();
  const lowerLines = changedLines.join("\n").toLowerCase();
  for (const [kw, topic] of Object.entries(keywords)) {
    if (lowerLines.includes(kw)) detectedTopics.add(topic);
  }

  if (detectedTopics.size > 0) {
    const topicList = [...detectedTopics].slice(0, 4).join(", ");
    parts.push(`Topics: ${topicList}`);
  }

  return parts.join(". ") + ".";
}

export function computeDiff(
  oldText: string,
  newText: string,
  urlIgnorePatterns: string[] = []
): DiffResult {
  const filteredOld = applyIgnoreRules(
    applyNoiseFilters(oldText),
    compileIgnorePatterns(urlIgnorePatterns)
  );
  const filteredNew = applyIgnoreRules(
    applyNoiseFilters(newText),
    compileIgnorePatterns(urlIgnorePatterns)
  );

  const changes = Diff.diffLines(filteredOld, filteredNew);

  let linesAdded = 0;
  let linesRemoved = 0;
  const changedLines: string[] = [];

  for (const part of changes) {
    const lineCount = part.count ?? part.value.split("\n").length;
    if (part.added) {
      linesAdded += lineCount;
      for (const l of part.value.split("\n").slice(0, 20 - changedLines.length)) {
        if (changedLines.length < 20) changedLines.push(`+ ${l}`);
      }
    } else if (part.removed) {
      linesRemoved += lineCount;
      for (const l of part.value.split("\n").slice(0, 20 - changedLines.length)) {
        if (changedLines.length < 20) changedLines.push(`- ${l}`);
      }
    }
  }

  const totalLinesOld = filteredOld.split("\n").length;
  const totalLinesNew = filteredNew.split("\n").length;
  const totalChanged = linesAdded + linesRemoved;
  const baseline = Math.max(totalLinesOld, totalLinesNew, 1);
  const changeScore = (totalChanged / baseline) * 100;
  const roundedScore = Math.round(changeScore * 100) / 100;

  const sections = detectSections(changes);

  const summary = buildDetailedSummary(
    linesAdded,
    linesRemoved,
    roundedScore,
    sections,
    changedLines
  );

  const diffPreview = changedLines.join("\n");

  return {
    linesAdded,
    linesRemoved,
    totalLinesOld,
    totalLinesNew,
    changeScore: roundedScore,
    diffPreview,
    summary,
    sections,
  };
}

/**
 * Takes a diff line and produces a generalized regex pattern that will
 * match structurally similar lines regardless of the specific IDs, numbers,
 * dates, or UUIDs they contain.
 */
export function generalizeDiffLine(line: string): {
  pattern: string;
  description: string;
} {
  let cleaned = line.replace(/^[+-]\s*/, "");

  const uuid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  const hexId = /\b[0-9a-f]{16,}\b/gi;
  const longNum = /\b\d{4,}\b/g;
  const date = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g;
  const isoDate = /\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?/g;
  const shortNum = /\b\d{1,3}\b/g;

  let pattern = escapeRegex(cleaned);

  pattern = pattern.replace(escapeRegex4Regex(uuid, cleaned), "[0-9a-f\\-]{36}");
  pattern = pattern.replace(escapeRegex4Regex(hexId, cleaned), "[0-9a-f]{16,}");
  pattern = pattern.replace(escapeRegex4Regex(isoDate, cleaned), "\\d{4}-\\d{2}-\\d{2}[T\\d:]*");
  pattern = pattern.replace(escapeRegex4Regex(date, cleaned), "\\d{1,2}[\\/-]\\d{1,2}[\\/-]\\d{2,4}");
  pattern = pattern.replace(escapeRegex4Regex(longNum, cleaned), "\\d+");
  pattern = pattern.replace(escapeRegex4Regex(shortNum, cleaned), "\\d+");

  const label = cleaned.replace(uuid, "<ID>")
    .replace(hexId, "<ID>")
    .replace(isoDate, "<DATE>")
    .replace(date, "<DATE>")
    .replace(longNum, "<NUM>")
    .trim();

  const description = label.length > 80 ? label.slice(0, 77) + "..." : label;

  return { pattern, description };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeRegex4Regex(rx: RegExp, source: string): RegExp {
  const matches = source.match(rx);
  if (!matches) return /(?!)/;
  const escaped = matches.map((m) => escapeRegex(m)).join("|");
  return new RegExp(escaped, "g");
}

export function resetNoiseFilters(): void {
  compiledFilters = null;
}
