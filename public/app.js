/* ==========================================================================
   EVV Monitor — Dashboard SPA
   ========================================================================== */

const API = "/api";

// ---- State ----
let watchlistData = [];
let changesData = [];
let keywordsData = [];
let keywordsMode = "require_match";
let keywordsDirty = false;

// ---- DOM helpers ----
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

function show(id) {
  $$(".view").forEach((v) => v.classList.remove("active"));
  $(`#view-${id}`).classList.add("active");
  $$(".nav-item").forEach((n) => n.classList.remove("active"));
  const navItem = $(`.nav-item[data-view="${id}"]`);
  if (navItem) navItem.classList.add("active");
}

function toast(msg, type = "success") {
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  $("#toastContainer").appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

function relTime(iso) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

function tagsHtml(tags) {
  if (!tags || typeof tags !== "object") return "";
  return Object.entries(tags)
    .filter(([, v]) => v)
    .map(([k, v]) => `<span class="tag">${k}: ${v}</span>`)
    .join(" ");
}

const US_STATES = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",
  CO:"Colorado",CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",
  HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",
  KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",
  MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",
  MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",
  NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",
  OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",
  SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",
  VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
  DC:"Washington DC",Federal:"Federal"
};

function stateLabel(tags) {
  if (!tags || !tags.state) return '<span style="color:var(--text-dim)">—</span>';
  const code = tags.state;
  const name = US_STATES[code] || code;
  return `<span class="state-badge" title="${name}">${code}</span>`;
}

function scoreColor(score) {
  if (score >= 30) return "var(--red)";
  if (score >= 10) return "var(--yellow)";
  return "var(--green)";
}

function truncateUrl(url, max = 60) {
  return url.length > max ? url.slice(0, max - 3) + "..." : url;
}

async function api(path, opts = {}) {
  const resp = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (opts.method === "DELETE" && resp.status === 204) return null;
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || `HTTP ${resp.status}`);
  return data;
}

// ---- Health check ----
async function checkHealth() {
  try {
    await api("/health");
    $("#healthDot").className = "health-dot ok";
    $("#healthText").textContent = "Service healthy";
  } catch {
    $("#healthDot").className = "health-dot fail";
    $("#healthText").textContent = "Service down";
  }
}

// ---- Dashboard ----
async function loadDashboard() {
  try {
    const stats = await api("/stats");
    $("#statTotal").textContent = stats.totalUrls;
    $("#statActive").textContent = stats.activeUrls;
    $("#statPending").textContent = stats.pendingUrls;
    $("#statError").textContent = stats.errorPaused;
    $("#statChanges").textContent = stats.totalChanges;
    $("#statRecent").textContent = stats.recentChanges;
  } catch {
    /* stats endpoint may not exist yet */
  }

  try {
    const changes = await api("/changes?limit=10");
    renderDashRecentChanges(changes);
  } catch {
    $("#dashRecentChanges").innerHTML = '<p class="empty-state">No change events yet.</p>';
  }
}

function generateChangeSummary(c) {
  if (!c.diffPreview) return c.summary || "Change detected";

  const lines = c.diffPreview.split("\n");
  const added = lines
    .filter((l) => l.startsWith("+ "))
    .map((l) => l.slice(2).trim())
    .filter((l) => l.length > 5);
  const removed = lines
    .filter((l) => l.startsWith("- "))
    .map((l) => l.slice(2).trim())
    .filter((l) => l.length > 5);

  const snippets = [];

  if (removed.length > 0 && added.length > 0) {
    snippets.push(
      `<span class="diff-inline-rm">${escapeHtml(truncate(removed[0], 90))}</span>` +
      ` → <span class="diff-inline-add">${escapeHtml(truncate(added[0], 90))}</span>`
    );
    for (const line of added.slice(1, 3)) {
      snippets.push(`<span class="diff-inline-add">+ ${escapeHtml(truncate(line, 100))}</span>`);
    }
  } else if (added.length > 0) {
    for (const line of added.slice(0, 3)) {
      snippets.push(`<span class="diff-inline-add">+ ${escapeHtml(truncate(line, 100))}</span>`);
    }
  } else if (removed.length > 0) {
    for (const line of removed.slice(0, 3)) {
      snippets.push(`<span class="diff-inline-rm">− ${escapeHtml(truncate(line, 100))}</span>`);
    }
  }

  const addCount = added.length;
  const rmCount = removed.length;
  let countLabel = "";
  if (addCount > 0 && rmCount > 0) countLabel = `${addCount} added, ${rmCount} removed`;
  else if (addCount > 0) countLabel = `${addCount} line${addCount > 1 ? "s" : ""} added`;
  else if (rmCount > 0) countLabel = `${rmCount} line${rmCount > 1 ? "s" : ""} removed`;

  return (
    snippets.join("<br>") +
    (countLabel ? `<span class="change-count">${countLabel}</span>` : "")
  );
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

function renderDashRecentChanges(changes) {
  const el = $("#dashRecentChanges");
  if (!changes.length) {
    el.innerHTML = '<p class="empty-state">No changes detected yet. The watchlist engine will create events when monitored pages change.</p>';
    return;
  }
  el.innerHTML = `<table>
    <thead><tr>
      <th>URL</th><th>State</th><th>Score</th><th>Change Summary</th><th>When</th>
    </tr></thead>
    <tbody>${changes
      .map(
        (c) => `<tr class="clickable-row" data-change-id="${c.id}">
        <td class="url-cell"><a href="${c.url}" target="_blank" title="${c.url}">${truncateUrl(c.url)}</a></td>
        <td>${stateLabel(c.tags)}</td>
        <td><strong style="color:${scoreColor(c.changeScore)}">${c.changeScore}%</strong></td>
        <td class="change-summary-cell">${generateChangeSummary(c)}</td>
        <td title="${fmtDate(c.createdAt)}">${relTime(c.createdAt)}</td>
      </tr>`
      )
      .join("")}</tbody></table>`;

  el.querySelectorAll(".clickable-row").forEach((row) =>
    row.addEventListener("click", () => openDiff(row.dataset.changeId))
  );
}

// ---- Watchlist ----
async function loadWatchlist() {
  try {
    watchlistData = await api("/watchlist");
    renderWatchlist();
  } catch (err) {
    $("#watchlistTable").innerHTML = `<p class="empty-state">Failed to load: ${err.message}</p>`;
  }
}

function populateStateFilter() {
  const select = $("#filterState");
  const current = select.value;
  const states = new Set();
  for (const u of watchlistData) {
    const s = u.tags?.state;
    if (s) states.add(s);
  }
  const sorted = [...states].sort((a, b) => {
    const nameA = US_STATES[a] || a;
    const nameB = US_STATES[b] || b;
    return nameA.localeCompare(nameB);
  });
  select.innerHTML = '<option value="">All states</option>' +
    sorted.map((s) => `<option value="${s}"${s === current ? " selected" : ""}>${s} — ${US_STATES[s] || s}</option>`).join("");
}

function renderWatchlist() {
  populateStateFilter();

  const stateFilter = $("#filterState").value;
  const status = $("#filterStatus").value;
  const source = $("#filterSource").value;
  const search = $("#filterSearch").value.toLowerCase();

  let filtered = watchlistData;
  if (stateFilter) filtered = filtered.filter((u) => u.tags?.state === stateFilter);
  if (status) filtered = filtered.filter((u) => u.status === status);
  if (source) filtered = filtered.filter((u) => u.source === source);
  if (search) filtered = filtered.filter((u) => u.url.toLowerCase().includes(search));

  const el = $("#watchlistTable");
  if (!filtered.length) {
    el.innerHTML = '<p class="empty-state">No URLs match the current filters.</p>';
    return;
  }

  el.innerHTML = `<table>
    <thead><tr>
      <th>URL</th><th>State</th><th>Status</th><th>Source</th><th>Tags</th><th>Interval</th><th>Last Checked</th><th>Actions</th>
    </tr></thead>
    <tbody>${filtered
      .map(
        (u) => `<tr data-id="${u.id}">
        <td class="url-cell"><a href="${u.url}" target="_blank" title="${u.url}">${truncateUrl(u.url, 50)}</a></td>
        <td>${stateLabel(u.tags)}</td>
        <td><span class="badge badge-${u.status}">${u.status.replace("_", " ")}</span></td>
        <td><span class="badge badge-${u.source}">${u.source}</span></td>
        <td>${tagsHtml(u.tags)}</td>
        <td>${u.intervalMinutes}m</td>
        <td title="${fmtDate(u.lastCheckedAt)}">${relTime(u.lastCheckedAt)}</td>
        <td class="action-cell">${actionButtons(u)}</td>
      </tr>`
      )
      .join("")}</tbody></table>`;

  bindWatchlistActions();
}

function actionButtons(u) {
  const btns = [];
  if (u.status === "pending_review") {
    btns.push(`<button class="btn btn-sm btn-approve" data-action="approve" data-id="${u.id}">Approve</button>`);
  }
  if (u.status === "active") {
    btns.push(`<button class="btn btn-sm btn-pause" data-action="pause" data-id="${u.id}">Pause</button>`);
  }
  if (u.status === "paused" || u.status === "error_paused") {
    btns.push(`<button class="btn btn-sm btn-resume" data-action="resume" data-id="${u.id}">Resume</button>`);
  }
  btns.push(`<button class="btn btn-sm btn-danger" data-action="delete" data-id="${u.id}">Del</button>`);
  return btns.join("");
}

function bindWatchlistActions() {
  $$("#watchlistTable button[data-action]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const id = btn.dataset.id;
      btn.disabled = true;

      try {
        if (action === "approve") {
          await api(`/watchlist/${id}/approve`, { method: "POST" });
          toast("URL approved and now actively monitored");
        } else if (action === "pause") {
          await api(`/watchlist/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: "paused" }),
          });
          toast("URL paused");
        } else if (action === "resume") {
          await api(`/watchlist/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: "active" }),
          });
          toast("URL resumed");
        } else if (action === "delete") {
          if (!confirm("Remove this URL from the watchlist?")) {
            btn.disabled = false;
            return;
          }
          await api(`/watchlist/${id}`, { method: "DELETE" });
          toast("URL removed");
        }
        await loadWatchlist();
      } catch (err) {
        toast(err.message, "error");
        btn.disabled = false;
      }
    });
  });
}

// ---- Changes Feed ----
async function loadChanges(params = "") {
  try {
    changesData = await api(`/changes?limit=100${params}`);
    renderChanges();
  } catch (err) {
    $("#changesList").innerHTML = `<p class="empty-state">Failed to load: ${err.message}</p>`;
  }
}

function renderChanges() {
  const el = $("#changesList");
  if (!changesData.length) {
    el.innerHTML = '<p class="empty-state">No change events yet. Changes appear here when monitored pages are updated.</p>';
    return;
  }

  el.innerHTML = changesData
    .map(
      (c) => `<div class="change-card" data-change-id="${c.id}">
      <div class="change-card-header">
        <div class="change-card-url" title="${c.url}">${truncateUrl(c.url, 70)}</div>
        <div class="change-card-score" style="color:${scoreColor(c.changeScore)}">${c.changeScore}%</div>
      </div>
      <div class="change-card-meta">
        <span>${generateChangeSummary(c)}</span>
        <span>·</span>
        <span>${tagsHtml(c.tags)}</span>
        <span>·</span>
        <span title="${fmtDate(c.createdAt)}">${relTime(c.createdAt)}</span>
      </div>
      <div class="change-card-preview">${formatDiffPreviewWithIgnore(c.diffPreview, c.urlId)}</div>
      <div class="change-card-actions">
        <button class="btn btn-sm btn-ignore-card" data-url-id="${c.urlId}" data-change-id="${c.id}" title="Ignore recurring changes from this diff">Ignore change in future</button>
      </div>
    </div>`
    )
    .join("");

  el.querySelectorAll(".change-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".btn-ignore-card") || e.target.closest(".btn-ignore-line")) return;
      openDiff(card.dataset.changeId);
    });
  });

  el.querySelectorAll(".btn-ignore-card").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      openIgnoreModal(btn.dataset.urlId, btn.dataset.changeId);
    });
  });
}

function formatDiffPreview(preview) {
  if (!preview) return "<em>No preview available</em>";
  return preview
    .split("\n")
    .map((line) => {
      const escaped = escapeHtml(line);
      if (line.startsWith("+ ")) return `<span class="diff-line-add">${escaped}</span>`;
      if (line.startsWith("- ")) return `<span class="diff-line-rm">${escaped}</span>`;
      return escaped;
    })
    .join("\n");
}

function formatDiffPreviewWithIgnore(preview, urlId) {
  if (!preview) return "<em>No preview available</em>";
  return preview
    .split("\n")
    .map((line, idx) => {
      const escaped = escapeHtml(line);
      const isChanged = line.startsWith("+ ") || line.startsWith("- ");
      const cls = line.startsWith("+ ") ? "diff-line-add" : line.startsWith("- ") ? "diff-line-rm" : "";
      if (isChanged) {
        return `<span class="${cls} diff-line-interactive" data-line="${escapeHtml(line)}" data-url-id="${urlId}">${escaped} <button class="btn-ignore-line" title="Ignore this type of change in future">ignore</button></span>`;
      }
      return escaped;
    })
    .join("\n");
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ---- Ignore Change Modal ----
async function openIgnoreModal(urlId, changeId) {
  const change = changesData.find((c) => String(c.id) === String(changeId));
  if (!change || !change.diffPreview) {
    toast("No diff lines available to create ignore rules", "error");
    return;
  }

  const lines = change.diffPreview
    .split("\n")
    .filter((l) => l.startsWith("+ ") || l.startsWith("- "));

  if (lines.length === 0) {
    toast("No changed lines to ignore", "error");
    return;
  }

  const patterns = await Promise.all(
    lines.slice(0, 10).map(async (line) => {
      try {
        const result = await api("/ignore-rules/generate", {
          method: "POST",
          body: JSON.stringify({ line }),
        });
        return { line, ...result };
      } catch {
        return { line, pattern: null, description: line };
      }
    })
  );

  const validPatterns = patterns.filter((p) => p.pattern);

  const modal = $("#ignoreModal");
  const list = $("#ignorePatternList");

  list.innerHTML = validPatterns
    .map(
      (p, i) => `<label class="ignore-pattern-item">
      <input type="checkbox" value="${i}" checked>
      <div class="ignore-pattern-info">
        <span class="ignore-pattern-desc">${escapeHtml(p.description)}</span>
        <code class="ignore-pattern-regex">${escapeHtml(p.pattern)}</code>
        <span class="ignore-pattern-sample">${escapeHtml(p.line)}</span>
      </div>
    </label>`
    )
    .join("");

  modal._urlId = urlId;
  modal._changeId = changeId;
  modal._patterns = validPatterns;
  modal.hidden = false;
}

async function confirmIgnoreRules() {
  const modal = $("#ignoreModal");
  const checked = [...modal.querySelectorAll('input[type="checkbox"]:checked')];
  const patterns = modal._patterns;
  const urlId = modal._urlId;

  let created = 0;
  for (const cb of checked) {
    const idx = parseInt(cb.value, 10);
    const p = patterns[idx];
    if (!p || !p.pattern) continue;

    try {
      await api(`/watchlist/${urlId}/ignore-rules`, {
        method: "POST",
        body: JSON.stringify({
          pattern: p.pattern,
          description: p.description,
          sampleLine: p.line,
        }),
      });
      created++;
    } catch (err) {
      toast(`Failed to create rule: ${err.message}`, "error");
    }
  }

  modal.hidden = true;
  if (created > 0) {
    toast(`${created} ignore rule${created > 1 ? "s" : ""} created — these changes will no longer be reported`);
    removeChangeCard(modal._changeId);
  }
}

async function ignoreLineDirectly(line, urlId, changeId) {
  try {
    const result = await api("/ignore-rules/generate", {
      method: "POST",
      body: JSON.stringify({ line }),
    });

    if (!result.pattern) {
      toast("Could not generate pattern for this line", "error");
      return;
    }

    await api(`/watchlist/${urlId}/ignore-rules`, {
      method: "POST",
      body: JSON.stringify({
        pattern: result.pattern,
        description: result.description,
        sampleLine: line,
      }),
    });

    toast("Ignore rule created — this type of change will no longer be reported");
    if (changeId) removeChangeCard(changeId);
  } catch (err) {
    toast(`Failed: ${err.message}`, "error");
  }
}

function removeChangeCard(changeId) {
  changesData = changesData.filter((c) => String(c.id) !== String(changeId));
  const card = document.querySelector(`.change-card[data-change-id="${changeId}"]`);
  if (card) {
    card.style.transition = "opacity .3s, transform .3s";
    card.style.opacity = "0";
    card.style.transform = "translateX(30px)";
    setTimeout(() => {
      card.remove();
      if (!changesData.length) {
        $("#changesList").innerHTML = '<p class="empty-state">No change events remaining.</p>';
      }
    }, 300);
  }
}

// ---- Diff Viewer ----
async function openDiff(changeId) {
  show("diff");
  $("#diffContent").innerHTML = '<p class="empty-state">Loading diff...</p>';
  $("#diffMeta").innerHTML = "";
  $("#diffTitle").textContent = "Diff Viewer";
  $("#diffIgnoreRules").innerHTML = "";

  try {
    const d = await api(`/changes/${changeId}/diff`);
    $("#diffTitle").textContent = `Diff — ${truncateUrl(d.url, 60)}`;

    const sectionHtml = d.diff.sections && d.diff.sections.length > 0
      ? `<div class="diff-sections"><strong>Sections affected:</strong> ${d.diff.sections.slice(0, 5).map((s) =>
          `<span class="tag">${escapeHtml(s.label)} (+${s.linesAdded}/-${s.linesRemoved})</span>`
        ).join(" ")}</div>`
      : "";

    $("#diffMeta").innerHTML = `
      <div class="diff-meta-grid">
        <div><strong>URL:</strong> <a href="${d.url}" target="_blank" style="color:var(--accent)">${truncateUrl(d.url)}</a></div>
        <div><strong>Score:</strong> <span style="color:${scoreColor(d.changeScore)}">${d.changeScore}%</span></div>
        <div><strong>Summary:</strong> ${escapeHtml(d.summary)}</div>
        <div><strong>Old snapshot:</strong> ${fmtDate(d.oldSnapshotDate)}</div>
        <div><strong>New snapshot:</strong> ${fmtDate(d.newSnapshotDate)}</div>
        <div>${tagsHtml(d.tags)}</div>
      </div>
      ${sectionHtml}
    `;

    const diffLines = d.diff.diffPreview || "(no diff lines)";
    $("#diffContent").innerHTML = renderDiffWithIgnoreButtons(diffLines, d.urlId);

    bindDiffIgnoreButtons(d.urlId);
    loadIgnoreRulesPanel(d.urlId);
  } catch (err) {
    $("#diffContent").innerHTML = `<p class="empty-state">Error: ${err.message}</p>`;
  }
}

function renderDiffWithIgnoreButtons(preview, urlId) {
  if (!preview) return "(no diff lines)";
  return preview
    .split("\n")
    .map((line) => {
      const escaped = escapeHtml(line);
      const isChanged = line.startsWith("+ ") || line.startsWith("- ");
      const cls = line.startsWith("+ ") ? "diff-line-add" : line.startsWith("- ") ? "diff-line-rm" : "";
      if (isChanged) {
        return `<div class="diff-line ${cls}"><span class="diff-line-text">${escaped}</span><button class="btn btn-sm btn-ignore-diff" data-line="${escapeHtml(line)}" data-url-id="${urlId}" title="Ignore this type of change in future">ignore</button></div>`;
      }
      return `<div class="diff-line">${escaped}</div>`;
    })
    .join("");
}

function bindDiffIgnoreButtons(urlId) {
  $$("#diffContent .btn-ignore-diff").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const line = btn.dataset.line
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"');
      btn.disabled = true;
      btn.textContent = "...";
      await ignoreLineDirectly(line, urlId);
      btn.textContent = "ignored";
      btn.classList.add("btn-ignored");
    });
  });
}

async function loadIgnoreRulesPanel(urlId) {
  const container = $("#diffIgnoreRules");
  try {
    const rules = await api(`/watchlist/${urlId}/ignore-rules`);
    if (rules.length === 0) {
      container.innerHTML = "";
      return;
    }

    container.innerHTML = `
      <div class="panel ignore-rules-panel">
        <h2>Active Ignore Rules (${rules.length})</h2>
        <div class="ignore-rules-list">
          ${rules.map((r) => `<div class="ignore-rule-item">
            <div class="ignore-rule-desc">${escapeHtml(r.description)}</div>
            <code class="ignore-rule-pattern">${escapeHtml(r.pattern)}</code>
            <button class="btn btn-sm btn-danger btn-delete-rule" data-rule-id="${r.id}" title="Remove this ignore rule">Remove</button>
          </div>`).join("")}
        </div>
      </div>
    `;

    container.querySelectorAll(".btn-delete-rule").forEach((btn) => {
      btn.addEventListener("click", async () => {
        btn.disabled = true;
        try {
          await api(`/ignore-rules/${btn.dataset.ruleId}`, { method: "DELETE" });
          toast("Ignore rule removed");
          loadIgnoreRulesPanel(urlId);
        } catch (err) {
          toast(`Failed: ${err.message}`, "error");
          btn.disabled = false;
        }
      });
    });
  } catch {
    container.innerHTML = "";
  }
}

// ---- Discovery Log ----
async function loadDiscovery() {
  try {
    const runs = await api("/discovery-runs");
    renderDiscovery(runs);
  } catch (err) {
    $("#discoveryTable").innerHTML = `<p class="empty-state">Failed to load: ${err.message}</p>`;
  }
}

function renderDiscovery(runs) {
  const el = $("#discoveryTable");
  if (!runs.length) {
    el.innerHTML = '<p class="empty-state">No discovery runs yet. The discovery engine runs on the configured cron schedule and searches for new EVV-related URLs.</p>';
    return;
  }

  el.innerHTML = `<table>
    <thead><tr>
      <th>Run Time</th><th>Query</th><th>Results Found</th><th>New URLs</th>
    </tr></thead>
    <tbody>${runs
      .map(
        (r) => `<tr>
        <td title="${fmtDate(r.ranAt)}">${relTime(r.ranAt)}</td>
        <td class="run-query" title="${escapeHtml(r.query)}">${escapeHtml(r.query)}</td>
        <td>${r.resultsFound}</td>
        <td><strong style="color:${r.newUrlsCount > 0 ? "var(--green)" : "var(--text-muted)"}">${r.newUrlsCount}</strong></td>
      </tr>`
      )
      .join("")}</tbody></table>`;
}

// ---- Trigger Discovery ----
async function triggerDiscovery() {
  const btn = $("#btnRunDiscovery");
  btn.disabled = true;
  btn.textContent = "Running…";
  try {
    const resp = await fetch(`${API}/discovery-runs/trigger`, { method: "POST" });
    const data = await resp.json();
    if (resp.ok) {
      toast("Discovery cycle triggered — results will appear shortly");
      setTimeout(loadDiscovery, 8000);
    } else {
      toast(data.error || "Failed to trigger discovery", "error");
    }
  } catch (err) {
    toast("Network error: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.textContent = "Run Discovery Now";
  }
}

// ---- Add URL Modal ----
function openModal() {
  $("#modalBackdrop").hidden = false;
  $("#addUrlForm").reset();
}

function closeModal() {
  $("#modalBackdrop").hidden = true;
}

async function handleAddUrl(e) {
  e.preventDefault();
  const form = e.target;
  const url = form.url.value.trim();
  const tags = {};
  if (form.state.value.trim()) tags.state = form.state.value.trim().toUpperCase();
  if (form.aggregator_name.value.trim()) tags.aggregator_name = form.aggregator_name.value.trim();
  if (form.url_type.value) tags.url_type = form.url_type.value;
  const interval_minutes = parseInt(form.interval_minutes.value, 10) || 60;

  const submitBtn = form.querySelector('[type="submit"]');
  submitBtn.disabled = true;

  try {
    await api("/watchlist", {
      method: "POST",
      body: JSON.stringify({ url, tags, interval_minutes }),
    });
    toast("URL added to watchlist");
    closeModal();
    await loadWatchlist();
    await loadDashboard();
  } catch (err) {
    toast(err.message, "error");
  } finally {
    submitBtn.disabled = false;
  }
}

// ---- Relevance Keywords ----
async function loadKeywords() {
  try {
    const data = await api("/relevance-keywords");
    keywordsData = data.keywords || [];
    keywordsMode = data.mode || "require_match";
    keywordsDirty = false;
    renderKeywords();
  } catch (err) {
    $("#keywordsList").innerHTML = `<p class="empty-state">Failed to load keywords: ${err.message}</p>`;
  }
}

function renderKeywords() {
  const el = $("#keywordsList");
  const modeEl = $("#keywordsMode");
  const countEl = $("#keywordsCount");

  if (modeEl) modeEl.value = keywordsMode;
  if (countEl) countEl.textContent = `${keywordsData.length} keyword${keywordsData.length !== 1 ? "s" : ""}`;

  if (!keywordsData.length) {
    el.innerHTML = '<p class="empty-state">No keywords configured. All changes will be reported.</p>';
    return;
  }

  const sorted = [...keywordsData].sort((a, b) => a.localeCompare(b));
  el.innerHTML = sorted
    .map(
      (kw) => `<span class="keyword-tag" data-keyword="${escapeHtml(kw)}">${escapeHtml(kw)}<button class="keyword-remove" title="Remove">&times;</button></span>`
    )
    .join("");

  el.querySelectorAll(".keyword-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tag = btn.closest(".keyword-tag");
      const keyword = tag.dataset.keyword
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
      keywordsData = keywordsData.filter((k) => k !== keyword);
      keywordsDirty = true;
      renderKeywords();
    });
  });
}

function addKeyword() {
  const input = $("#keywordInput");
  const value = input.value.trim().toLowerCase();
  if (!value) return;
  if (keywordsData.includes(value)) {
    toast("Keyword already exists", "error");
    return;
  }
  keywordsData.push(value);
  keywordsDirty = true;
  input.value = "";
  renderKeywords();
}

async function saveKeywords() {
  try {
    const result = await api("/relevance-keywords", {
      method: "PUT",
      body: JSON.stringify({ mode: keywordsMode, keywords: keywordsData }),
    });
    keywordsData = result.keywords;
    keywordsMode = result.mode;
    keywordsDirty = false;
    toast(`Saved ${keywordsData.length} keyword${keywordsData.length !== 1 ? "s" : ""}`);
    renderKeywords();
  } catch (err) {
    toast(`Failed to save: ${err.message}`, "error");
  }
}

// ---- Navigation ----
function initNavigation() {
  $$(".nav-item[data-view]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const view = link.dataset.view;
      show(view);
      onViewEnter(view);
    });
  });

  $("#btnBackChanges").addEventListener("click", () => {
    show("changes");
    loadChanges();
  });
}

function onViewEnter(view) {
  switch (view) {
    case "dashboard":
      loadDashboard();
      break;
    case "watchlist":
      loadWatchlist();
      break;
    case "changes":
      loadChanges();
      break;
    case "discovery":
      loadDiscovery();
      break;
    case "keywords":
      loadKeywords();
      break;
  }
}

// ---- Init ----
function init() {
  initNavigation();

  // Filters
  $("#filterState").addEventListener("change", renderWatchlist);
  $("#filterStatus").addEventListener("change", renderWatchlist);
  $("#filterSource").addEventListener("change", renderWatchlist);
  $("#filterSearch").addEventListener("input", renderWatchlist);

  // Changes filters
  $("#btnFilterChanges").addEventListener("click", () => {
    const state = $("#changeFilterState").value.trim();
    const from = $("#changeFrom").value;
    const to = $("#changeTo").value;
    let params = "";
    if (state) params += `&state=${encodeURIComponent(state)}`;
    if (from) params += `&from=${from}`;
    if (to) params += `&to=${to}`;
    loadChanges(params);
  });

  // Inline ignore buttons in changes feed
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-ignore-line");
    if (!btn) return;
    e.stopPropagation();
    const lineEl = btn.closest("[data-line]");
    if (!lineEl) return;
    const line = lineEl.dataset.line
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"');
    const urlId = lineEl.dataset.urlId;
    const changeCard = btn.closest(".change-card");
    const changeId = changeCard ? changeCard.dataset.changeId : null;
    btn.disabled = true;
    btn.textContent = "...";
    ignoreLineDirectly(line, urlId, changeId).then(() => {
      btn.textContent = "ignored";
      btn.classList.add("ignored");
    });
  });

  // Modal
  $("#btnAddUrl").addEventListener("click", openModal);
  $("#modalClose").addEventListener("click", closeModal);
  $("#modalCancel").addEventListener("click", closeModal);
  $("#modalBackdrop").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  $("#addUrlForm").addEventListener("submit", handleAddUrl);

  // Ignore modal
  $("#ignoreModalClose").addEventListener("click", () => {
    $("#ignoreModal").hidden = true;
  });
  $("#ignoreModalCancel").addEventListener("click", () => {
    $("#ignoreModal").hidden = true;
  });
  $("#ignoreModalConfirm").addEventListener("click", confirmIgnoreRules);

  // Keywords
  $("#btnAddKeyword").addEventListener("click", addKeyword);
  $("#keywordInput").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); addKeyword(); }
  });
  $("#btnSaveKeywords").addEventListener("click", saveKeywords);
  $("#keywordsMode").addEventListener("change", (e) => {
    keywordsMode = e.target.value;
    keywordsDirty = true;
  });

  // Initial loads
  checkHealth();
  loadDashboard();
  loadWatchlist();

  // Periodic health check
  setInterval(checkHealth, 30000);
}

document.addEventListener("DOMContentLoaded", init);
