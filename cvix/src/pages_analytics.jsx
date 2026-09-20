// ============================================================
// CIVIX — Analytics (/analytics) + AI Insights (/insights)
// ============================================================

function AnalyticsPage() {
  const [trend, setTrend] = useState(null);
  const [cats, setCats] = useState(null);
  const [sev, setSev] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [depts, setDepts] = useState(null);
  const [insights, setInsights] = useState(null);
  const [items, setItems] = useState(null);
  const [range, setRange] = useState(30);

  const load = useCallback(() => {
    const api = window.CIVIX.api;
    Promise.all([
      api.dashboardTrends(range), api.dashboardCategories(), api.dashboardSeverity(),
      api.dashboardStatus(), api.dashboardDepartments(), api.analyticsInsights(), api.listIssues({})
    ]).then(([t,c,s,st,d,ins,it]) => { setTrend(t); setCats(c); setSev(s); setStatusData(st); setDepts(d); setInsights(ins); setItems(it); });
  }, [range]);
  useEffect(() => { load(); window.addEventListener('civix:changed', load); return () => window.removeEventListener('civix:changed', load); }, [load]);

  const hotspots = useMemo(() => {
    if (!items) return [];
    const g = {}; items.forEach(i => { if (!g[i.location_name]) g[i.location_name] = 0; g[i.location_name]++; });
    return Object.entries(g).sort((a,b)=>b[1]-a[1]).slice(0, 6).map(([name, value]) => ({ name, value }));
  }, [items]);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">Analytics</div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">Civic Intelligence</h1>
          <p className="text-sm text-ink-500 mt-1">Understand where and why civic issues are occurring.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white ring-1 ring-surface-border rounded-lg p-1">
            {[{l:'7d',v:7},{l:'30d',v:30},{l:'6m',v:180}].map(r => (
              <button key={r.v} onClick={()=>setRange(r.v)} className={`px-2.5 py-1 rounded-md text-xs font-medium ${range===r.v?'bg-ink-900 text-white':'text-ink-600 hover:bg-ink-50'}`}>{r.l}</button>
            ))}
          </div>
          <DemoPill/>
        </div>
      </div>

      {/* Trends */}
      <div className="grid lg:grid-cols-3 gap-4">
        <ChartCard title="Issue Trends" subtitle={`Reports over the last ${range} days`} className="lg:col-span-2" height={280}>
          {trend ? <ReportsTrendChart data={trend}/> : <Skeleton className="w-full h-full"/>}
        </ChartCard>
        <ChartCard title="Severity Analysis" subtitle="Share by priority" height={280}>
          {sev ? <SeverityDonut data={sev}/> : <Skeleton className="w-full h-full"/>}
        </ChartCard>
      </div>

      {/* Category + Status */}
      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <ChartCard title="Category Analysis" subtitle="Volume by issue type" height={280}>
          {cats ? <CategoryBarChart data={cats}/> : <Skeleton className="w-full h-full"/>}
        </ChartCard>
        <ChartCard title="Resolution Trends" subtitle="Reports vs. resolved" height={280}>
          {trend ? <ResolutionTrendChart data={trend}/> : <Skeleton className="w-full h-full"/>}
        </ChartCard>
      </div>

      {/* Department Performance */}
      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <ChartCard title="Department Performance" subtitle="Open workload by department" className="lg:col-span-2" height={280}>
          {depts ? <DepartmentWorkloadChart data={depts}/> : <Skeleton className="w-full h-full"/>}
        </ChartCard>
        <ChartCard title="Status Mix" subtitle="Reports by pipeline stage" height={280}>
          {statusData ? <StatusBarChart data={statusData}/> : <Skeleton className="w-full h-full"/>}
        </ChartCard>
      </div>

      {/* Geographic Hotspots */}
      <Card className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-semibold">Geographic Hotspots</div>
            <div className="text-xs text-ink-500">Neighborhoods with high complaint concentration</div>
          </div>
          <DemoPill/>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {hotspots.map(h => (
            <div key={h.name} className="p-3 rounded-lg ring-1 ring-surface-border bg-white hover:shadow-cardHover transition-shadow">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-900"><Icon name="MapPin" size={12} className="text-red-600"/>{h.name}</div>
              <div className="mt-2 flex items-baseline gap-1"><div className="text-xl font-bold tabular-nums">{h.value}</div><div className="text-[11px] text-ink-500">reports</div></div>
              <div className="mt-2 h-1.5 bg-ink-100 rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${Math.min(100, h.value * 12)}%` }}></div></div>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Insights */}
      <Card className="mt-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center"><Icon name="Brain" size={14}/></div>
          <div>
            <div className="text-sm font-semibold">AI Insights</div>
            <div className="text-xs text-ink-500">Auto-generated from your active civic data</div>
          </div>
          <DemoPill className="ml-auto"/>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {insights ? insights.map((n, i) => (
            <div key={i} className="p-4 rounded-lg bg-gradient-to-br from-ink-50 to-white ring-1 ring-surface-border">
              <div className="flex items-center gap-2 text-brand-700 mb-1"><Icon name={n.kind==='geo'?'MapPin':n.kind==='load'?'Layers':n.kind==='trend'?'TrendingUp':'CloudRain'} size={14}/></div>
              <div className="text-sm font-semibold">{n.title}</div>
              <div className="text-xs text-ink-500 mt-1">{n.body}</div>
            </div>
          )) : [0,1,2,3].map(i => <Skeleton key={i} className="h-20"/>)}
        </div>
      </Card>
    </div>
  );
}

function AIInsightsPage() {
  const [insights, setInsights] = useState(null);
  useEffect(() => { window.CIVIX.api.analyticsInsights().then(setInsights); }, []);
  return (
    <div>
      <div className="mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">AI Insights</div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">What CIVIX is noticing.</h1>
        <p className="text-sm text-ink-500 mt-1">Signals generated from the current civic dataset.</p>
      </div>
      {insights ? (
        <div className="grid md:grid-cols-2 gap-4">
          {insights.map((n, i) => (
            <Card key={i}>
              <div className="flex items-center gap-2 text-brand-700 mb-2">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center"><Icon name={n.kind==='geo'?'MapPin':n.kind==='load'?'Layers':n.kind==='trend'?'TrendingUp':'CloudRain'} size={14}/></div>
                <div className="text-[11px] uppercase tracking-wider font-semibold">{n.kind}</div>
              </div>
              <div className="font-semibold text-ink-900">{n.title}</div>
              <div className="text-sm text-ink-500 mt-1">{n.body}</div>
            </Card>
          ))}
        </div>
      ) : <LoadingSpinner/>}
    </div>
  );
}

Object.assign(window, { AnalyticsPage, AIInsightsPage });
