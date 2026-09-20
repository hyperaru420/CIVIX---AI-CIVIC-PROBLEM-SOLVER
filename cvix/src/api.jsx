// ============================================================
// CIVIX — Mock API layer
// LocalStorage-backed. Mirrors the FastAPI spec described in the brief.
// All endpoints are Promise-based so swapping to axios/fetch is trivial.
// ============================================================

(function () {
  const LS_KEY = 'civix.state.v1';
  const { buildSeedReports, DEPARTMENTS, STATUSES, SEVERITIES, CATEGORIES, CATEGORY_TEMPLATES, CATEGORY_HUES, catImage, LOCATIONS, pick } = window.CIVIX;

  function loadState() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    const seed = buildSeedReports();
    const state = {
      issues: seed,
      nextId: seed.length + 1,
      settings: { aiMode: 'mock', hasApiKey: false, demo: true },
      notifications: [
        { id: 1, kind: 'high',   text: '3 high priority reports received today.',        at: nowMinusMin(6) },
        { id: 2, kind: 'assign', text: 'Complaint CVX-1024 assigned to Road Maintenance.', at: nowMinusMin(35) },
        { id: 3, kind: 'ok',     text: '5 reports resolved today.',                       at: nowMinusMin(96) },
      ],
    };
    saveState(state);
    return state;
  }
  function saveState(s) { localStorage.setItem(LS_KEY, JSON.stringify(s)); }
  function nowMinusMin(m) { return new Date(Date.now() - m * 60 * 1000).toISOString(); }

  let state = loadState();

  function persist() { saveState(state); window.dispatchEvent(new CustomEvent('civix:changed')); }

  // Simulated latency for realism
  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  // -------------------- AI SERVICE (mock) --------------------
  function guessCategoryFromText(text = '') {
    const t = text.toLowerCase();
    if (/pothole|hole|crater/.test(t)) return 'Potholes';
    if (/garbage|trash|waste|litter|dump/.test(t)) return 'Garbage';
    if (/water\s?log|flood|standing water|puddle/.test(t)) return 'Waterlogging';
    if (/street\s?light|lamp|bulb|dark/.test(t)) return 'Streetlights';
    if (/drain|sewage|gutter/.test(t)) return 'Drainage';
    if (/crack|broken road|sunken|damage/.test(t)) return 'Road Damage';
    return null;
  }

  async function aiAnalyze({ description = '', locationName = '', hintedCategory = null, imageDataUrl = null }) {
    await delay(1400); // pretend an inference happened
    const cat = hintedCategory && hintedCategory !== 'Auto Detect'
      ? hintedCategory
      : (guessCategoryFromText(description) || window.CIVIX.pick(['Potholes','Garbage','Waterlogging','Streetlights','Road Damage','Drainage']));
    const tpl = CATEGORY_TEMPLATES[cat];
    const sevRoll = Math.random();
    const sev = sevRoll > 0.85 ? 'Critical' : sevRoll > 0.55 ? 'High' : sevRoll > 0.25 ? 'Medium' : 'Low';
    const conf = +(0.82 + Math.random() * 0.15).toFixed(2);
    return {
      title: tpl.titles[Math.floor(Math.random() * tpl.titles.length)],
      category: cat,
      description: (description && description.length > 6 ? description : tpl.summary),
      severity: sev,
      confidence: conf,
      department: tpl.dept,
      recommended_action: tpl.action,
      reasoning: tpl.reasoning,
      summary: tpl.summary,
      _source: state.settings.aiMode === 'gemini' && state.settings.hasApiKey ? 'gemini' : 'mock',
    };
  }

  // -------------------- CRUD --------------------
  async function listIssues(query = {}) {
    await delay(120);
    let items = [...state.issues];
    if (query.status)    items = items.filter(i => i.status === query.status);
    if (query.severity)  items = items.filter(i => i.severity === query.severity);
    if (query.category)  items = items.filter(i => i.category === query.category);
    if (query.department)items = items.filter(i => i.department === query.department);
    if (query.q) {
      const q = query.q.toLowerCase();
      items = items.filter(i =>
        i.ticket_id.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        (i.location_name || '').toLowerCase().includes(q) ||
        (i.department || '').toLowerCase().includes(q)
      );
    }
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return items;
  }
  async function getIssue(idOrTicket) {
    await delay(80);
    return state.issues.find(i => String(i.id) === String(idOrTicket) || i.ticket_id === idOrTicket) || null;
  }
  async function createIssue(payload) {
    await delay(400);
    const id = state.nextId++;
    const ticket = 'CVX-2026-' + String(id).padStart(6, '0');
    const loc = payload.location_name ? (LOCATIONS.find(l => l.name === payload.location_name) || pick(LOCATIONS)) : pick(LOCATIONS);
    const item = {
      id,
      ticket_id: ticket,
      title: payload.title || 'Civic issue',
      category: payload.category || 'Other',
      description: payload.description || '',
      severity: payload.severity || 'Medium',
      confidence: payload.confidence || 0.9,
      department: payload.department || 'Municipal Corporation',
      recommended_action: payload.recommended_action || 'Assign field officer.',
      reasoning: payload.reasoning || [],
      location_name: payload.location_name || loc.name,
      latitude: payload.latitude || (loc.lat + (Math.random() - 0.5) * 0.01),
      longitude: payload.longitude || (loc.lng + (Math.random() - 0.5) * 0.01),
      image: payload.image || catImage(payload.category || 'Other'),
      status: 'Reported',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      source: payload.source || 'citizen',
    };
    state.issues.unshift(item);
    state.notifications.unshift({
      id: Date.now(),
      kind: 'high',
      text: `New ${item.severity.toLowerCase()}-priority ${item.category.toLowerCase()} report received (${item.ticket_id}).`,
      at: new Date().toISOString(),
    });
    persist();
    return item;
  }
  async function updateIssueStatus(id, status) {
    await delay(120);
    const it = state.issues.find(i => i.id === id || i.ticket_id === id);
    if (!it) return null;
    it.status = status;
    it.updated_at = new Date().toISOString();
    state.notifications.unshift({
      id: Date.now(),
      kind: status === 'Resolved' ? 'ok' : 'assign',
      text: `Complaint ${it.ticket_id} marked ${status}.`,
      at: new Date().toISOString(),
    });
    persist();
    return it;
  }

  // -------------------- DASHBOARD --------------------
  async function dashboardStats() {
    await delay(60);
    const total = state.issues.length;
    const active = state.issues.filter(i => i.status !== 'Resolved').length;
    const high = state.issues.filter(i => i.severity === 'High' || i.severity === 'Critical').length;
    const resolved = state.issues.filter(i => i.status === 'Resolved').length;
    return {
      total, active, high, resolved,
      trends: { total: +3.2, active: -1.4, high: +2.1, resolved: +5.6 },
    };
  }
  async function dashboardTrends(range = 7) {
    await delay(40);
    // Bucket per day for the last `range` days
    const days = [];
    const now = new Date();
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ key, label: d.toLocaleDateString(undefined, { weekday: range <= 7 ? 'short' : undefined, month: range > 7 ? 'short' : undefined, day: 'numeric' }), reports: 0, resolved: 0 });
    }
    state.issues.forEach(i => {
      const day = i.created_at.slice(0, 10);
      const b = days.find(d => d.key === day);
      if (b) b.reports++;
      if (i.status === 'Resolved') {
        const day2 = i.updated_at.slice(0, 10);
        const b2 = days.find(d => d.key === day2);
        if (b2) b2.resolved++;
      }
    });
    // Add gentle synthetic baseline so charts feel populated
    days.forEach((d, idx) => { d.reports += 2 + Math.round(Math.abs(Math.sin(idx * 1.1)) * 6); d.resolved += 1 + Math.round(Math.abs(Math.cos(idx * 0.9)) * 4); });
    return days;
  }
  async function dashboardCategories() {
    await delay(30);
    const counts = {};
    CATEGORIES.forEach(c => counts[c.key] = 0);
    state.issues.forEach(i => { counts[i.category] = (counts[i.category] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }
  async function dashboardSeverity() {
    await delay(30);
    const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    state.issues.forEach(i => counts[i.severity] = (counts[i.severity] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }
  async function dashboardStatus() {
    await delay(30);
    const counts = {}; STATUSES.forEach(s => counts[s] = 0);
    state.issues.forEach(i => counts[i.status] = (counts[i.status] || 0) + 1);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }
  async function dashboardDepartments() {
    await delay(30);
    const out = DEPARTMENTS.map(d => {
      const rel = state.issues.filter(i => i.department === d.name);
      return {
        id: d.id, name: d.name, color: d.color,
        open: rel.filter(i => i.status !== 'Resolved').length,
        in_progress: rel.filter(i => i.status === 'In Progress').length,
        resolved: rel.filter(i => i.status === 'Resolved').length,
        avg_resolution_hours: 12 + Math.round(Math.random() * 60),
      };
    });
    return out;
  }
  async function dashboardRecent(limit = 8) {
    await delay(30);
    return [...state.issues].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, limit);
  }
  async function analyticsInsights() {
    await delay(50);
    const cats = await dashboardCategories();
    const depts = await dashboardDepartments();
    const topCat = [...cats].sort((a, b) => b.value - a.value)[0];
    const topDept = [...depts].sort((a, b) => b.open - a.open)[0];
    const locCount = {};
    state.issues.forEach(i => { locCount[i.location_name] = (locCount[i.location_name] || 0) + 1; });
    const topLoc = Object.entries(locCount).sort((a, b) => b[1] - a[1])[0];
    return [
      { kind: 'trend',  title: `${topCat.name} complaints lead this week`,     body: `${topCat.name} has the highest volume across recent reports (${topCat.value} entries).` },
      { kind: 'load',   title: `${topDept.name} carries the highest workload`, body: `${topDept.name} currently has ${topDept.open} open issues in the queue.` },
      { kind: 'geo',    title: `Cluster forming near ${topLoc ? topLoc[0] : 'downtown'}`, body: `${topLoc ? topLoc[1] : 0} reports appear geographically clustered around ${topLoc ? topLoc[0] : 'the area'}.` },
      { kind: 'weather',title: 'Waterlogging reports lean toward low-lying areas', body: 'Recent drainage and waterlogging reports concentrate in known low-elevation pockets.' },
    ];
  }

  async function listDepartments() {
    await delay(30);
    const stats = await dashboardDepartments();
    return DEPARTMENTS.map(d => Object.assign({}, d, stats.find(s => s.id === d.id)));
  }
  async function getDepartment(id) {
    await delay(30);
    const all = await listDepartments();
    const dept = all.find(d => String(d.id) === String(id));
    if (!dept) return null;
    const issues = state.issues.filter(i => i.department === dept.name);
    return { ...dept, issues };
  }

  async function listNotifications() { await delay(20); return state.notifications.slice(0, 8); }
  async function getSettings()       { await delay(10); return { ...state.settings }; }
  async function updateSettings(patch){
    await delay(80);
    state.settings = { ...state.settings, ...patch };
    persist();
    return state.settings;
  }
  async function resetDemoData() {
    await delay(200);
    localStorage.removeItem(LS_KEY);
    state = loadState();
    persist();
    return true;
  }

  window.CIVIX.api = {
    aiAnalyze,
    listIssues, getIssue, createIssue, updateIssueStatus,
    dashboardStats, dashboardTrends, dashboardCategories, dashboardSeverity, dashboardStatus, dashboardDepartments, dashboardRecent,
    analyticsInsights,
    listDepartments, getDepartment,
    listNotifications, getSettings, updateSettings,
    resetDemoData,
  };
})();
