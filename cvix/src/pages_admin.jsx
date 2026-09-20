// ============================================================
// CIVIX — Admin dashboard (/admin)
// ============================================================

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [trend, setTrend] = useState(null);
  const [cats, setCats]   = useState(null);
  const [sev, setSev]     = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [depts, setDepts] = useState(null);
  const [recent, setRecent] = useState(null);
  const [insights, setInsights] = useState(null);
  const [range, setRange] = useState(7);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    try {
      const api = window.CIVIX.api;
      const [a,b,c,d,e,f,g,h] = await Promise.all([
        api.dashboardStats(), api.dashboardTrends(range), api.dashboardCategories(),
        api.dashboardSeverity(), api.dashboardStatus(), api.dashboardDepartments(),
        api.dashboardRecent(6), api.analyticsInsights(),
      ]);
      setStats(a); setTrend(b); setCats(c); setSev(d); setStatusData(e); setDepts(f); setRecent(g); setInsights(h);
    } catch (err) { setError('Unable to load dashboard data.'); }
  }, [range]);

  useEffect(() => {
    loadAll();
    const onChange = () => loadAll();
    window.addEventListener('civix:changed', onChange);
    return () => window.removeEventListener('civix:changed', onChange);
  }, [loadAll]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  if (error) return <ErrorState title="Dashboard unavailable" body={error} onRetry={loadAll}/>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{greeting}, Admin</h1>
          <p className="text-sm text-ink-500 mt-1">Here's what's happening across the city.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-[11px] text-ink-500 hidden sm:inline">Range</div>
          <div className="flex items-center bg-white ring-1 ring-surface-border rounded-lg p-1">
            {[
              { l: '7d',  v: 7 },
              { l: '30d', v: 30 },
              { l: '6m',  v: 180 },
            ].map(r => (
              <button key={r.v} onClick={()=>setRange(r.v)} className={`px-2.5 py-1 rounded-md text-xs font-medium ${range===r.v?'bg-ink-900 text-white':'text-ink-600 hover:bg-ink-50'}`}>{r.l}</button>
            ))}
          </div>
          <Button variant="secondary" icon="Download" size="sm">Export</Button>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats ? (<>
          <StatCard icon="FileText"       label="Total Reports"  value={stats.total.toLocaleString()}   trend={stats.trends.total}    tone="brand"   help="All reports in the system"/>
          <StatCard icon="Activity"       label="Active"         value={stats.active.toLocaleString()}  trend={stats.trends.active}   tone="warning" help="Not yet resolved"/>
          <StatCard icon="AlertTriangle"  label="High Priority"  value={stats.high.toLocaleString()}    trend={stats.trends.high}     tone="danger"  help="Critical + High severity"/>
          <StatCard icon="CircleCheck"    label="Resolved"       value={stats.resolved.toLocaleString()} trend={stats.trends.resolved} tone="success" help="Closed complaints"/>
        </>) : (<>
          {[0,1,2,3].map(i => <Skeleton key={i} className="h-28"/>)}
        </>)}
      </div>

      {/* Row: reports over time + severity donut */}
      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <ChartCard title="Reports over time" subtitle={`Last ${range === 180 ? '6 months' : range + ' days'}`} className="lg:col-span-2" height={280}>
          {trend ? <ReportsTrendChart data={trend}/> : <Skeleton className="w-full h-full"/>}
        </ChartCard>
        <ChartCard title="Severity distribution" subtitle="Share by priority" height={280}>
          {sev ? <SeverityDonut data={sev}/> : <Skeleton className="w-full h-full"/>}
        </ChartCard>
      </div>

      {/* Row: categories + status + workload */}
      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <ChartCard title="Issues by category" subtitle="Count by type" height={260}>
          {cats ? <CategoryBarChart data={cats}/> : <Skeleton className="w-full h-full"/>}
        </ChartCard>
        <ChartCard title="Resolution status" subtitle="Where reports stand" height={260}>
          {statusData ? <StatusBarChart data={statusData}/> : <Skeleton className="w-full h-full"/>}
        </ChartCard>
        <ChartCard title="Department workload" subtitle="Open issues by dept" height={260}>
          {depts ? <DepartmentWorkloadChart data={depts}/> : <Skeleton className="w-full h-full"/>}
        </ChartCard>
      </div>

      {/* Row: resolution trend + AI insights */}
      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <ChartCard title="Resolution trend" subtitle="Reports vs. resolved" className="lg:col-span-2" height={260}>
          {trend ? <ResolutionTrendChart data={trend}/> : <Skeleton className="w-full h-full"/>}
        </ChartCard>
        <Card className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center"><Icon name="Brain" size={14}/></div>
            <div className="text-sm font-semibold">AI Civic Insights</div>
            <DemoPill className="ml-auto"/>
          </div>
          <div className="space-y-2">
            {insights ? insights.slice(0, 4).map((n, i) => (
              <div key={i} className="p-3 rounded-lg bg-ink-50 ring-1 ring-surface-border">
                <div className="text-sm font-medium text-ink-900">{n.title}</div>
                <div className="text-xs text-ink-500 mt-0.5">{n.body}</div>
              </div>
            )) : [0,1,2,3].map(i => <Skeleton key={i} className="h-14"/>)}
          </div>
        </Card>
      </div>

      {/* Recent reports */}
      <Card padded={false} className="mt-4">
        <div className="p-4 flex items-center justify-between border-b border-surface-border">
          <div>
            <div className="text-sm font-semibold">Recent Reports</div>
            <div className="text-xs text-ink-500">Latest civic complaints</div>
          </div>
          <Link to="/reports" className="text-sm text-brand-700 hover:text-brand-800 font-medium inline-flex items-center gap-1">View all reports <Icon name="ArrowRight" size={12}/></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-[11px] uppercase tracking-wider text-ink-500">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">ID</th>
                <th className="text-left px-4 py-3 font-semibold">Issue</th>
                <th className="text-left px-4 py-3 font-semibold">Location</th>
                <th className="text-left px-4 py-3 font-semibold">Severity</th>
                <th className="text-left px-4 py-3 font-semibold">Department</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Reported</th>
              </tr>
            </thead>
            <tbody>
              {recent ? recent.map(r => <ReportTableRow key={r.id} r={r}/>) : [0,1,2,3,4].map(i => <tr key={i} className="border-t border-surface-border"><td colSpan="7" className="p-3"><Skeleton className="h-8"/></td></tr>)}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { AdminDashboard });
