// ============================================================
// CIVIX — Seed data, categories, departments, locations
// All records are DEMO DATA.
// ============================================================

const CATEGORIES = [
  { key: 'Potholes',      label: 'Potholes',      dept: 'Road Maintenance' },
  { key: 'Garbage',       label: 'Garbage / Waste', dept: 'Waste Management' },
  { key: 'Waterlogging',  label: 'Waterlogging',  dept: 'Water & Drainage' },
  { key: 'Streetlights',  label: 'Streetlights',  dept: 'Electrical Department' },
  { key: 'Road Damage',   label: 'Road Damage',   dept: 'Road Maintenance' },
  { key: 'Drainage',      label: 'Drainage',      dept: 'Water & Drainage' },
  { key: 'Other',         label: 'Other',         dept: 'Municipal Corporation' },
];

const DEPARTMENTS = [
  { id: 1, name: 'Road Maintenance',       description: 'Roads, potholes, footpaths and pavement repairs.', color: '#2563EB' },
  { id: 2, name: 'Waste Management',       description: 'Garbage collection, black spots and public cleanliness.', color: '#059669' },
  { id: 3, name: 'Water & Drainage',       description: 'Drainage clearance, waterlogging and water leaks.', color: '#0284C7' },
  { id: 4, name: 'Electrical Department',  description: 'Streetlights, transformers and public lighting.', color: '#D97706' },
  { id: 5, name: 'Municipal Corporation',  description: 'General civic issues and municipal coordination.', color: '#7C3AED' },
];

const STATUSES = ['Reported', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];
const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'];

// Bengaluru-ish neighborhoods with rough coordinates. DEMO DATA.
const LOCATIONS = [
  { name: 'Whitefield',    lat: 12.9698, lng: 77.7500 },
  { name: 'Koramangala',   lat: 12.9352, lng: 77.6245 },
  { name: 'Indiranagar',   lat: 12.9784, lng: 77.6408 },
  { name: 'HSR Layout',    lat: 12.9116, lng: 77.6474 },
  { name: 'Marathahalli',  lat: 12.9591, lng: 77.6974 },
  { name: 'Jayanagar',     lat: 12.9250, lng: 77.5938 },
  { name: 'BTM Layout',    lat: 12.9166, lng: 77.6101 },
  { name: 'Malleshwaram',  lat: 13.0035, lng: 77.5709 },
  { name: 'MG Road',       lat: 12.9756, lng: 77.6050 },
  { name: 'Electronic City', lat: 12.8452, lng: 77.6602 },
  { name: 'Yeshwanthpur',  lat: 13.0280, lng: 77.5540 },
  { name: 'Bannerghatta',  lat: 12.8000, lng: 77.5770 },
  { name: 'Hebbal',        lat: 13.0358, lng: 77.5970 },
];

const CATEGORY_TEMPLATES = {
  'Potholes': {
    titles: ['Large road pothole', 'Deep pothole near junction', 'Cluster of potholes on main road', 'Pothole causing traffic slowdown'],
    dept: 'Road Maintenance',
    action: 'Immediate inspection and repair of damaged road surface.',
    reasoning: ['Large damaged road surface detected', 'Irregular road depression', 'Located in active traffic area'],
    summary: 'This report appears to show a large road pothole that may create a safety hazard for vehicles and pedestrians.'
  },
  'Garbage': {
    titles: ['Overflowing garbage bin', 'Uncollected waste pile', 'Garbage dumped on roadside', 'Public litter black spot'],
    dept: 'Waste Management',
    action: 'Dispatch waste collection team and schedule regular pickup.',
    reasoning: ['Solid waste accumulation detected', 'Bin capacity exceeded', 'Adjacent to pedestrian pathway'],
    summary: 'This report appears to show accumulated waste that may attract pests and pose sanitation concerns.'
  },
  'Waterlogging': {
    titles: ['Waterlogged street after rain', 'Standing water blocking road', 'Flooded underpass', 'Waterlogged intersection'],
    dept: 'Water & Drainage',
    action: 'Deploy dewatering pumps and inspect nearby drainage.',
    reasoning: ['Standing water covers road surface', 'Located in low-lying area', 'Blocks vehicular movement'],
    summary: 'This report appears to show significant waterlogging that may disrupt traffic and pose safety risks.'
  },
  'Streetlights': {
    titles: ['Streetlight not working', 'Dark stretch on main road', 'Broken lamp post', 'Flickering streetlight'],
    dept: 'Electrical Department',
    action: 'Inspect and replace faulty streetlight fixture.',
    reasoning: ['Non-functional public lighting', 'Reduced night-time visibility', 'Located along pedestrian route'],
    summary: 'This report appears to show a non-functional streetlight that may reduce safety at night.'
  },
  'Road Damage': {
    titles: ['Cracked road surface', 'Broken road divider', 'Damaged speed breaker', 'Sunken road section'],
    dept: 'Road Maintenance',
    action: 'Schedule road resurfacing and structural assessment.',
    reasoning: ['Structural damage to road detected', 'Surface irregularity', 'Impact on traffic flow'],
    summary: 'This report appears to show damage to the road surface that may worsen over time if left unattended.'
  },
  'Drainage': {
    titles: ['Clogged drainage line', 'Overflowing storm drain', 'Broken drainage cover', 'Sewage overflow'],
    dept: 'Water & Drainage',
    action: 'Clear drainage line and inspect connected network.',
    reasoning: ['Blocked drainage flow', 'Overflow onto public road', 'Risk of contamination'],
    summary: 'This report appears to show a drainage issue that could cause waterlogging and hygiene concerns.'
  },
  'Other': {
    titles: ['Miscellaneous civic issue', 'Public property damage', 'Encroachment on footpath'],
    dept: 'Municipal Corporation',
    action: 'Assign field officer for on-site assessment.',
    reasoning: ['Civic anomaly detected', 'Requires municipal coordination'],
    summary: 'This report requires review by a municipal officer for further categorization.'
  },
};

// -- Deterministic pseudo-random helpers
function seedRand(seed) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const rng = seedRand(42);
function pick(arr) { return arr[Math.floor(rng() * arr.length)]; }
function jitter(base, amp) { return +(base + (rng() - 0.5) * amp).toFixed(5); }

// SVG data URLs used as placeholder "photo" evidence for each seeded issue.
// Simple diagonal-stripe placeholders with a label. Zero external dependency.
function makePlaceholderImage(label, hue) {
  const bg = `hsl(${hue}, 12%, 92%)`;
  const fg = `hsl(${hue}, 12%, 78%)`;
  const ink = '#111827';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 400'>
    <defs>
      <pattern id='p' width='16' height='16' patternUnits='userSpaceOnUse' patternTransform='rotate(45)'>
        <rect width='16' height='16' fill='${bg}'/>
        <rect width='8' height='16' fill='${fg}'/>
      </pattern>
    </defs>
    <rect width='640' height='400' fill='url(#p)'/>
    <rect x='24' y='24' width='240' height='40' rx='8' fill='white' opacity='0.9'/>
    <text x='40' y='51' font-family='ui-monospace, monospace' font-size='16' fill='${ink}'>${label}</text>
    <text x='320' y='210' text-anchor='middle' font-family='Inter, sans-serif' font-size='22' font-weight='700' fill='${ink}' opacity='0.7'>photo evidence</text>
    <text x='320' y='240' text-anchor='middle' font-family='ui-monospace, monospace' font-size='13' fill='${ink}' opacity='0.5'>DEMO PLACEHOLDER</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

const CATEGORY_HUES = {
  'Potholes': 20, 'Garbage': 90, 'Waterlogging': 210, 'Streetlights': 45,
  'Road Damage': 10, 'Drainage': 190, 'Other': 260,
};

function catImage(cat) { return makePlaceholderImage(cat.toUpperCase(), CATEGORY_HUES[cat] || 220); }

// Build 28 seeded reports covering all categories, statuses, severities.
function buildSeedReports() {
  const now = Date.now();
  const items = [];
  const cats = Object.keys(CATEGORY_TEMPLATES);
  for (let i = 0; i < 28; i++) {
    const cat = pick(cats);
    const tpl = CATEGORY_TEMPLATES[cat];
    const loc = pick(LOCATIONS);
    const sev = pick(SEVERITIES);
    // Status distribution: bias toward active/pipeline
    const statusDist = ['Reported', 'Under Review', 'Assigned', 'In Progress', 'In Progress', 'Resolved', 'Resolved'];
    const status = pick(statusDist);
    const dept = tpl.dept;
    const ageMin = Math.floor(rng() * 60 * 24 * 30); // up to 30 days
    const createdAt = new Date(now - ageMin * 60 * 1000).toISOString();
    const updatedAt = new Date(now - Math.floor(ageMin * rng()) * 60 * 1000).toISOString();
    const conf = +(0.72 + rng() * 0.27).toFixed(2);
    const ticket = 'CVX-' + String(1000 + i).padStart(4, '0');
    items.push({
      id: i + 1,
      ticket_id: ticket,
      title: pick(tpl.titles),
      category: cat,
      description: `Reported near ${loc.name}. ${tpl.summary}`,
      severity: sev,
      confidence: conf,
      department: dept,
      recommended_action: tpl.action,
      reasoning: tpl.reasoning,
      location_name: loc.name,
      latitude: jitter(loc.lat, 0.010),
      longitude: jitter(loc.lng, 0.012),
      image: catImage(cat),
      status,
      created_at: createdAt,
      updated_at: updatedAt,
      source: 'seed',
    });
  }
  return items;
}

// Registry
window.CIVIX = window.CIVIX || {};
Object.assign(window.CIVIX, {
  CATEGORIES,
  DEPARTMENTS,
  STATUSES,
  SEVERITIES,
  LOCATIONS,
  CATEGORY_TEMPLATES,
  CATEGORY_HUES,
  catImage,
  makePlaceholderImage,
  buildSeedReports,
  pick,
});
