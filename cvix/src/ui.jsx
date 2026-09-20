// ============================================================
// CIVIX — UI primitives
// Icon renderer, badges, cards, empty/loading/error states, hooks.
// ============================================================

const { useState, useEffect, useMemo, useRef, useCallback, createContext, useContext } = React;

// ------------------- Icon -------------------
// Uses lucide.icons which is a map of { name: [tag, attrs, children[]] }
function iconArrayToSvg([tag, attrs, kids], size, extraProps) {
  const attrStr = Object.entries(attrs || {})
    .map(([k, v]) => `${k}="${v}"`).join(' ');
  const inner = (kids || []).map(([t, a]) => {
    const s = Object.entries(a || {}).map(([k, v]) => `${k}="${v}"`).join(' ');
    return `<${t} ${s}/>`;
  }).join('');
  return { __html: `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ${attrStr}>${inner}</svg>` };
}
function Icon({ name, size = 16, className = '', style = {} }) {
  const raw = (window.lucide && window.lucide.icons && window.lucide.icons[name]) || null;
  if (!raw) return <span className={className} style={{ display: 'inline-block', width: size, height: size, ...style }} />;
  return <span className={className} style={{ display: 'inline-flex', ...style }} dangerouslySetInnerHTML={iconArrayToSvg(raw, size)} />;
}

// ------------------- Badges -------------------
const SEV_STYLE = {
  Critical: 'bg-red-50   text-red-700    ring-red-200',
  High:     'bg-orange-50 text-orange-700 ring-orange-200',
  Medium:   'bg-amber-50  text-amber-800  ring-amber-200',
  Low:      'bg-emerald-50 text-emerald-700 ring-emerald-200',
};
function SeverityBadge({ value, size = 'sm' }) {
  const c = SEV_STYLE[value] || 'bg-gray-100 text-gray-700 ring-gray-200';
  const pad = size === 'lg' ? 'px-2.5 py-1 text-[12px]' : 'px-2 py-0.5 text-[11px]';
  return <span className={`inline-flex items-center gap-1 rounded-full ring-1 font-semibold uppercase tracking-wide ${c} ${pad}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${value==='Critical'?'bg-red-500':value==='High'?'bg-orange-500':value==='Medium'?'bg-amber-500':'bg-emerald-500'}`}></span>
    {value}
  </span>;
}

const STATUS_STYLE = {
  'Reported':     'bg-slate-100 text-slate-700 ring-slate-200',
  'Under Review': 'bg-blue-50 text-blue-700 ring-blue-200',
  'Assigned':     'bg-indigo-50 text-indigo-700 ring-indigo-200',
  'In Progress':  'bg-amber-50 text-amber-800 ring-amber-200',
  'Resolved':     'bg-emerald-50 text-emerald-700 ring-emerald-200',
};
function StatusBadge({ value }) {
  const c = STATUS_STYLE[value] || 'bg-gray-100 text-gray-700 ring-gray-200';
  return <span className={`inline-flex items-center gap-1 rounded-full ring-1 font-medium text-[11px] px-2 py-0.5 ${c}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${value==='Resolved'?'bg-emerald-500':value==='In Progress'?'bg-amber-500':value==='Assigned'?'bg-indigo-500':value==='Under Review'?'bg-blue-500':'bg-slate-400'}`}></span>
    {value}
  </span>;
}

function CategoryBadge({ value }) {
  return <span className="inline-flex items-center gap-1 rounded-md bg-ink-100 text-ink-700 text-[11px] font-medium px-2 py-0.5 ring-1 ring-ink-200">
    {value}
  </span>;
}

// ------------------- Cards -------------------
function Card({ children, className = '', padded = true, as: As = 'div', ...rest }) {
  return <As className={`bg-white rounded-xl ring-1 ring-surface-border shadow-card ${padded ? 'p-5' : ''} ${className}`} {...rest}>{children}</As>;
}

function StatCard({ icon, label, value, trend, tone = 'brand', help }) {
  const toneMap = {
    brand:   'bg-brand-50   text-brand-700',
    danger:  'bg-red-50     text-red-700',
    warning: 'bg-amber-50   text-amber-700',
    success: 'bg-emerald-50 text-emerald-700',
  };
  const trendPos = trend != null ? trend >= 0 : null;
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${toneMap[tone]}`}><Icon name={icon} size={20} /></div>
        <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">{label}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-bold text-ink-900 tabular-nums">{value}</div>
        {trend != null && (
          <div className={`text-xs font-medium inline-flex items-center gap-0.5 ${trendPos ? 'text-emerald-600' : 'text-red-600'}`}>
            <Icon name={trendPos ? 'TrendingUp' : 'TrendingDown'} size={12} />
            {trendPos ? '+' : ''}{trend}%
          </div>
        )}
      </div>
      {help && <div className="text-[12px] text-ink-500">{help}</div>}
    </Card>
  );
}

// ------------------- Empty / Loading / Error -------------------
function EmptyState({ icon = 'Inbox', title = 'Nothing here yet', body = '', action = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-14 h-14 rounded-full bg-ink-100 text-ink-500 flex items-center justify-center mb-4"><Icon name={icon} size={22} /></div>
      <div className="text-sm font-semibold text-ink-800">{title}</div>
      {body && <div className="text-xs text-ink-500 mt-1 max-w-sm">{body}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-14 text-ink-500 text-sm">
      <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="3"/>
        <path d="M22 12a10 10 0 0 1-10 10" stroke="#2563EB" strokeWidth="3" strokeLinecap="round"/>
      </svg>
      {label}
    </div>
  );
}
function ErrorState({ title = 'Something went wrong', body = 'Please try again.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4"><Icon name="TriangleAlert" size={22} /></div>
      <div className="text-sm font-semibold text-ink-800">{title}</div>
      <div className="text-xs text-ink-500 mt-1 max-w-sm">{body}</div>
      {onRetry && <button onClick={onRetry} className="mt-4 px-3 py-1.5 text-xs font-medium bg-ink-900 text-white rounded-lg">Try again</button>}
    </div>
  );
}
function Skeleton({ className = '' }) { return <div className={`skeleton ${className}`} />; }

// ------------------- Buttons -------------------
function Button({ children, variant = 'primary', size = 'md', className = '', icon, ...rest }) {
  const sizes = { sm: 'text-xs px-2.5 py-1.5', md: 'text-sm px-3.5 py-2', lg: 'text-sm px-4 py-2.5 font-semibold' };
  const variants = {
    primary:   'bg-brand-600 hover:bg-brand-700 text-white shadow-card',
    dark:      'bg-ink-900 hover:bg-ink-800 text-white',
    secondary: 'bg-white text-ink-800 ring-1 ring-surface-border hover:bg-ink-50',
    ghost:     'text-ink-700 hover:bg-ink-100',
    danger:    'bg-red-600 hover:bg-red-700 text-white',
    subtle:    'bg-brand-50 text-brand-700 hover:bg-brand-100',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 15} />}
      {children}
    </button>
  );
}

// ------------------- Input primitives -------------------
function TextInput({ icon, className = '', ...rest }) {
  return (
    <div className={`relative ${className}`}>
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"><Icon name={icon} size={16} /></span>}
      <input
        className={`w-full ${icon ? 'pl-9' : 'pl-3'} pr-3 py-2 text-sm bg-white rounded-lg ring-1 ring-surface-border focus:ring-brand-400 focus:outline-none placeholder-ink-400`}
        {...rest}
      />
    </div>
  );
}
function Select({ options = [], className = '', ...rest }) {
  return (
    <div className={`relative ${className}`}>
      <select className="appearance-none w-full pl-3 pr-8 py-2 text-sm bg-white rounded-lg ring-1 ring-surface-border focus:ring-brand-400 focus:outline-none" {...rest}>
        {options.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400"><Icon name="ChevronDown" size={14} /></span>
    </div>
  );
}

// ------------------- Router (hash-based) -------------------
const RouterCtx = createContext(null);
function useRoute() { return useContext(RouterCtx); }

function parseHash(h) {
  const raw = (h || '').replace(/^#/, '') || '/';
  const [pathQ] = raw.split('?');
  return pathQ || '/';
}
function match(pattern, path) {
  const p = pattern.split('/').filter(Boolean);
  const q = path.split('/').filter(Boolean);
  if (p.length !== q.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i++) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(q[i]);
    else if (p[i] !== q[i]) return null;
  }
  return params;
}

function Router({ routes, layout }) {
  const [path, setPath] = useState(parseHash(location.hash));
  useEffect(() => {
    const onHash = () => setPath(parseHash(location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const navigate = useCallback((to) => {
    location.hash = to.startsWith('#') ? to : ('#' + to);
    window.scrollTo({ top: 0 });
  }, []);
  let matched = null, params = null, Component = null;
  for (const r of routes) {
    const m = match(r.path, path);
    if (m) { matched = r; params = m; Component = r.component; break; }
  }
  const value = { path, params, navigate, matched };
  const Page = Component ? <Component {...params} /> : <NotFound />;
  return (
    <RouterCtx.Provider value={value}>
      {layout ? layout({ children: Page, path, matched }) : Page}
    </RouterCtx.Provider>
  );
}
function Link({ to, children, className = '', ...rest }) {
  const { navigate } = useRoute();
  return <a href={'#' + to} onClick={(e)=>{ e.preventDefault(); navigate(to); }} className={className} {...rest}>{children}</a>;
}
function NotFound() {
  return (
    <div className="max-w-xl mx-auto py-24 text-center">
      <div className="text-6xl font-bold text-ink-200">404</div>
      <div className="mt-2 text-lg font-semibold">Page not found</div>
      <div className="mt-1 text-sm text-ink-500">The route you followed doesn't exist in this demo.</div>
      <Link to="/" className="inline-block mt-6 px-4 py-2 bg-ink-900 text-white text-sm rounded-lg">Back to Home</Link>
    </div>
  );
}

// ------------------- Time helpers -------------------
function timeAgo(iso) {
  const d = new Date(iso);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60); if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const dd = Math.floor(h / 24); if (dd < 30) return `${dd}d ago`;
  return d.toLocaleDateString();
}
function formatDT(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

// ------------------- Demo Data pill -------------------
function DemoPill({ className = '' }) {
  return <span className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-100 ring-1 ring-amber-200 rounded-full px-2 py-0.5 ${className}`}>
    <Icon name="Sparkles" size={10} />
    Demo data
  </span>;
}

// ------------------- Modal -------------------
function Modal({ open, onClose, children, title, size = 'md' }) {
  if (!open) return null;
  const w = size === 'lg' ? 'max-w-2xl' : size === 'sm' ? 'max-w-sm' : 'max-w-lg';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40" onClick={onClose}>
      <div className={`w-full ${w} bg-white rounded-2xl shadow-pop`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-surface-border">
          <div className="font-semibold text-ink-900">{title}</div>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700"><Icon name="X" size={18}/></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// -------- Register --------
Object.assign(window, {
  useState, useEffect, useMemo, useRef, useCallback, createContext, useContext,
  Icon, SeverityBadge, StatusBadge, CategoryBadge, Card, StatCard,
  EmptyState, LoadingSpinner, ErrorState, Skeleton, Button, TextInput, Select,
  Router, Link, useRoute, NotFound,
  timeAgo, formatDT, DemoPill, Modal,
});
