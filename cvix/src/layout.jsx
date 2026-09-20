// ============================================================
// CIVIX — Layout: PublicLayout (top nav) + AdminLayout (sidebar) + shared bits
// ============================================================

function Logo({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-2 font-bold text-ink-900">
      <div className="w-8 h-8 rounded-lg bg-ink-900 text-white flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2 L21 6 L21 12 C21 17 17 21 12 22 C7 21 3 17 3 12 L3 6 Z" fill="white"/>
          <path d="M8 12 L11 15 L16 10" stroke="#0B1220" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      </div>
      {!compact && <span className="tracking-tight text-[15px]">CIVIX</span>}
    </Link>
  );
}

const PUB_NAV = [
  { to: '/',              label: 'Home' },
  { to: '/admin',         label: 'Dashboard' },
  { to: '/reports',       label: 'Reports' },
  { to: '/map',           label: 'Map' },
  { to: '/analytics',     label: 'Analytics' },
  { to: '/departments',   label: 'Departments' },
  { to: '/about',         label: 'About' },
];

const ADMIN_NAV = [
  { to: '/admin',       label: 'Overview',    icon: 'LayoutDashboard' },
  { to: '/reports',     label: 'Reports',     icon: 'FileText' },
  { to: '/map',         label: 'Live Map',    icon: 'Map' },
  { to: '/analytics',   label: 'Analytics',   icon: 'BarChart3' },
  { to: '/departments', label: 'Departments', icon: 'Building2' },
  { to: '/insights',    label: 'AI Insights', icon: 'Brain' },
  { to: '/settings',    label: 'Settings',    icon: 'Settings' },
];

function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  useEffect(() => {
    let alive = true;
    const load = () => window.CIVIX.api.listNotifications().then(n => alive && setItems(n));
    load();
    window.addEventListener('civix:changed', load);
    return () => { alive = false; window.removeEventListener('civix:changed', load); };
  }, []);
  return (
    <div className="relative">
      <button className="w-9 h-9 rounded-lg hover:bg-ink-100 text-ink-700 flex items-center justify-center relative" onClick={() => setOpen(o => !o)}>
        <Icon name="Bell" size={18}/>
        {items.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-pop ring-1 ring-surface-border z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
              <div className="font-semibold text-sm">Notifications</div>
              <DemoPill/>
            </div>
            <div className="max-h-96 overflow-auto">
              {items.length === 0 && <div className="p-6 text-center text-sm text-ink-500">No notifications</div>}
              {items.map(n => (
                <div key={n.id} className="px-4 py-3 border-b border-surface-border last:border-0 flex gap-3">
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center ${n.kind==='ok'?'bg-emerald-50 text-emerald-600':n.kind==='high'?'bg-red-50 text-red-600':'bg-blue-50 text-blue-600'}`}>
                    <Icon name={n.kind==='ok'?'CircleCheck':n.kind==='high'?'AlertTriangle':'ArrowRight'} size={14}/>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-ink-800">{n.text}</div>
                    <div className="text-[11px] text-ink-500 mt-0.5">{timeAgo(n.at)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ------------------- Public Top Nav -------------------
function PublicNav() {
  const { path } = useRoute();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
        <Logo/>
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {PUB_NAV.map(n => {
            const active = n.to === path || (n.to !== '/' && path.startsWith(n.to));
            return (
              <Link key={n.to} to={n.to} className={`px-3 py-1.5 rounded-md text-sm ${active ? 'bg-ink-100 text-ink-900 font-medium' : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50'}`}>{n.label}</Link>
            );
          })}
        </nav>
        <div className="flex-1"></div>
        <div className="hidden sm:flex items-center gap-2">
          <DemoPill/>
          <Link to="/report" className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm px-3.5 py-2 rounded-lg font-medium shadow-card">
            <Icon name="Camera" size={14}/> Report Issue
          </Link>
        </div>
        <button className="md:hidden w-9 h-9 rounded-lg hover:bg-ink-100 flex items-center justify-center" onClick={() => setMobileOpen(o=>!o)}>
          <Icon name={mobileOpen ? 'X' : 'Menu'} size={20}/>
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-border bg-white">
          <div className="px-4 py-3 flex flex-col gap-1">
            {PUB_NAV.map(n => (
              <Link key={n.to} to={n.to} onClick={()=>setMobileOpen(false)} className="px-3 py-2 rounded-md text-sm text-ink-700 hover:bg-ink-50">{n.label}</Link>
            ))}
            <Link to="/report" onClick={()=>setMobileOpen(false)} className="mt-2 px-3 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium text-center">Report Issue</Link>
          </div>
        </div>
      )}
    </header>
  );
}

// ------------------- Admin Sidebar Layout -------------------
function AdminLayout({ children }) {
  const { path } = useRoute();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen flex bg-surface-base">
      {/* Sidebar - desktop */}
      <aside className={`hidden lg:flex flex-col ${collapsed ? 'w-[68px]' : 'w-[240px]'} shrink-0 bg-white border-r border-surface-border transition-all`}>
        <div className={`h-16 flex items-center ${collapsed ? 'justify-center' : 'px-5'} border-b border-surface-border`}>
          <Logo compact={collapsed}/>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {ADMIN_NAV.map(n => {
            const active = n.to === path || (n.to !== '/admin' && path.startsWith(n.to));
            const isOverview = n.to === '/admin' && path === '/admin';
            const isActive = active || isOverview;
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-3'} py-2 rounded-lg text-sm ${isActive ? 'bg-brand-50 text-brand-700 font-medium' : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'}`}>
                <Icon name={n.icon} size={16}/>
                {!collapsed && <span>{n.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className={`m-3 p-3 rounded-lg bg-ink-50 ring-1 ring-surface-border ${collapsed ? 'text-center' : ''}`}>
          {!collapsed && <div className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold mb-2">System Status</div>}
          <div className={`flex items-center gap-2 ${collapsed ? 'justify-center' : ''}`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]"></span>
            {!collapsed && <span className="text-xs text-ink-800 font-medium">AI Engine Online</span>}
          </div>
          {!collapsed && <div className="text-[10px] text-ink-500 mt-1">Mock analysis · Ready</div>}
        </div>
        <button onClick={() => setCollapsed(c => !c)} className="mb-3 mx-auto w-8 h-8 rounded-md text-ink-400 hover:text-ink-800 hover:bg-ink-100 flex items-center justify-center">
          <Icon name={collapsed ? 'ChevronsRight' : 'ChevronsLeft'} size={16}/>
        </button>
      </aside>

      {/* Sidebar - mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-64 bg-white h-full flex flex-col">
            <div className="h-16 flex items-center px-5 border-b border-surface-border"><Logo/></div>
            <nav className="flex-1 px-2 py-3 space-y-0.5">
              {ADMIN_NAV.map(n => (
                <Link key={n.to} to={n.to} onClick={()=>setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-ink-700 hover:bg-ink-50"><Icon name={n.icon} size={16}/>{n.label}</Link>
              ))}
            </nav>
          </div>
          <div className="flex-1 bg-ink-900/40" onClick={()=>setMobileOpen(false)}></div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-surface-border flex items-center gap-3 px-4 sm:px-6 sticky top-0 z-20">
          <button className="lg:hidden w-9 h-9 rounded-lg hover:bg-ink-100 flex items-center justify-center" onClick={()=>setMobileOpen(true)}><Icon name="Menu" size={20}/></button>
          <div className="flex-1 max-w-md hidden sm:block">
            <TextInput icon="Search" placeholder="Search reports, tickets, locations…"/>
          </div>
          <div className="flex-1 sm:hidden"></div>
          <DemoPill/>
          <NotificationsBell/>
          <Link to="/report" className="hidden sm:inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm px-3 py-2 rounded-lg font-medium">
            <Icon name="Plus" size={14}/> New Report
          </Link>
          <div className="w-9 h-9 rounded-full bg-ink-900 text-white flex items-center justify-center text-sm font-semibold">A</div>
        </header>
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="px-6 py-4 text-[11px] text-ink-400 border-t border-surface-border bg-white">
          CIVIX · AI Civic Resolver · Demo build v1.0 — all data shown is illustrative
        </footer>
      </div>
    </div>
  );
}

// ------------------- Public Layout -------------------
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNav/>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-surface-border bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between text-sm text-ink-500">
          <div className="flex items-center gap-3">
            <Logo/>
            <span className="text-[12px]">© 2026 CIVIX · Demo build</span>
          </div>
          <div className="flex items-center gap-4 text-[12px]">
            <Link to="/about" className="hover:text-ink-800">About</Link>
            <Link to="/reports" className="hover:text-ink-800">Reports</Link>
            <Link to="/map" className="hover:text-ink-800">Map</Link>
            <Link to="/analytics" className="hover:text-ink-800">Analytics</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Which layout to use per route
function RootLayout({ children, path }) {
  // Admin surface routes get sidebar. Everything else public.
  const ADMIN_PATHS = ['/admin', '/reports', '/map', '/analytics', '/departments', '/insights', '/settings'];
  const useAdmin = ADMIN_PATHS.some(p => path === p || path.startsWith(p + '/'));
  return useAdmin ? <AdminLayout>{children}</AdminLayout> : <PublicLayout>{children}</PublicLayout>;
}

Object.assign(window, { Logo, PublicNav, AdminLayout, PublicLayout, RootLayout, NotificationsBell, PUB_NAV, ADMIN_NAV });
