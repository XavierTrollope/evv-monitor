/* ==========================================================================
   EVV Monitor — Dashboard SPA
   ========================================================================== */

const API = "/api";

// ---- State ----
let watchlistData = [];
let changesData = [];

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
  const parts = [];
  const url = c.url.toLowerCase();
  const diff = (c.diffPreview || "").toLowerCase();
  const added = parseInt((c.summary.match(/(\d+) added/) || [])[1]) || 0;
  const removed = parseInt((c.summary.match(/(\d+) removed/) || [])[1]) || 0;

  // Determine the site context
  let site = "page";
  if (url.includes("hhaexchange")) site = "HHAeXchange portal";
  else if (url.includes("sandata")) site = "Sandata portal";
  else if (url.includes("ntst") || url.includes("netsmart")) site = "Netsmart portal";
  else if (url.includes("tellus")) site = "Tellus portal";
  else if (url.includes(".gov")) site = "state portal";
  else if (url.includes("medicaid")) site = "Medicaid page";

  // Characterize the change type from diff content
  const keywords = {
    "deadline": "compliance deadline updates",
    "effective date": "effective date changes",
    "policy": "policy updates",
    "requirement": "requirement changes",
    "provider": "provider information updates",
    "billing": "billing or claims updates",
    "training": "training material updates",
    "schedule": "schedule or timeline changes",
    "contact": "contact information changes",
    "form": "form or document updates",
    "evv": "EVV process changes",
    "compliance": "compliance guidance updates",
    "rate": "rate or payment changes",
    "enrollment": "enrollment process updates",
    "certification": "certification updates",
  };

  let changeType = null;
  for (const [kw, desc] of Object.entries(keywords)) {
    if (diff.includes(kw)) { changeType = desc; break; }
  }

  // Build the summary
  if (c.changeScore >= 30) {
    parts.push(`Major update to ${site}`);
  } else if (c.changeScore >= 10) {
    parts.push(`Moderate update to ${site}`);
  } else {
    parts.push(`Minor update to ${site}`);
  }

  if (changeType) {
    parts[0] += ` — ${changeType}`;
  }

  if (added > 0 && removed > 0) {
    parts.push(`Content revised (${added} lines added, ${removed} removed)`);
  } else if (added > 0) {
    parts.push(`New content added (${added} lines)`);
  } else if (removed > 0) {
    parts.push(`Content removed (${removed} lines)`);
  }

  return parts.join(". ") + ".";
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
        <span>${c.summary}</span>
        <span>·</span>
        <span>${tagsHtml(c.tags)}</span>
        <span>·</span>
        <span title="${fmtDate(c.createdAt)}">${relTime(c.createdAt)}</span>
      </div>
      <div class="change-card-preview">${formatDiffPreview(c.diffPreview)}</div>
    </div>`
    )
    .join("");

  el.querySelectorAll(".change-card").forEach((card) =>
    card.addEventListener("click", () => openDiff(card.dataset.changeId))
  );
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

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ---- Diff Viewer ----
async function openDiff(changeId) {
  show("diff");
  $("#diffContent").innerHTML = '<p class="empty-state">Loading diff...</p>';
  $("#diffMeta").innerHTML = "";
  $("#diffTitle").textContent = "Diff Viewer";

  try {
    const d = await api(`/changes/${changeId}/diff`);
    $("#diffTitle").textContent = `Diff — ${truncateUrl(d.url, 60)}`;

    $("#diffMeta").innerHTML = `
      <div><strong>URL:</strong> <a href="${d.url}" target="_blank" style="color:var(--accent)">${truncateUrl(d.url)}</a></div>
      <div><strong>Score:</strong> <span style="color:${scoreColor(d.changeScore)}">${d.changeScore}%</span></div>
      <div><strong>Summary:</strong> ${d.summary}</div>
      <div><strong>Old snapshot:</strong> ${fmtDate(d.oldSnapshotDate)}</div>
      <div><strong>New snapshot:</strong> ${fmtDate(d.newSnapshotDate)}</div>
      <div>${tagsHtml(d.tags)}</div>
    `;

    const diffLines = d.diff.diffPreview || "(no diff lines)";
    $("#diffContent").innerHTML = formatDiffPreview(diffLines);
  } catch (err) {
    $("#diffContent").innerHTML = `<p class="empty-state">Error: ${err.message}</p>`;
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

  // Modal
  $("#btnAddUrl").addEventListener("click", openModal);
  $("#modalClose").addEventListener("click", closeModal);
  $("#modalCancel").addEventListener("click", closeModal);
  $("#modalBackdrop").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  $("#addUrlForm").addEventListener("submit", handleAddUrl);

  // Initial loads
  checkHealth();
  loadDashboard();
  loadWatchlist();

  // Periodic health check
  setInterval(checkHealth, 30000);
}

document.addEventListener("DOMContentLoaded", init);
