// ============================================================
// CIVIX — Departments (/departments, /departments/:id)
// ============================================================

function DepartmentsPage() {
  const [depts, setDepts] = useState(null);
  useEffect(() => { const load = () => window.CIVIX.api.listDepartments().then(setDepts); load(); window.addEventListener('civix:changed', load); return () => window.removeEventListener('civix:changed', load); }, []);
  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">Departments</div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">Municipal Departments</h1>
          <p className="text-sm text-ink-500 mt-1">Workload and resolution performance by department.</p>
        </div>
        <DemoPill/>
      </div>
      {depts ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {depts.map(d => <DepartmentCard key={d.id} d={d}/>)}
        </div>
      ) : <LoadingSpinner/>}
    </div>
  );
}

function DepartmentCard({ d }) {
  const { navigate } = useRoute();
  const total = (d.open || 0) + (d.resolved || 0);
  const rate = total ? Math.round((d.resolved / total) * 100) : 0;
  return (
    <Card onClick={()=>navigate('/departments/'+d.id)} className="cursor-pointer hover:shadow-cardHover transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{background: d.color}}><Icon name="Building2" size={18}/></div>
        <div className="flex-1">
          <div className="font-semibold text-ink-900">{d.name}</div>
          <div className="text-xs text-ink-500">{d.description}</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-4">
        <Metric label="Open" value={d.open} tone="brand"/>
        <Metric label="In progress" value={d.in_progress} tone="warning"/>
        <Metric label="Resolved" value={d.resolved} tone="success"/>
        <Metric label="Avg hrs" value={d.avg_resolution_hours} tone="ink"/>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-[11px] text-ink-500 mb-1"><span>Resolution rate</span><span>{rate}%</span></div>
        <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden"><div className="h-full" style={{ width: rate + '%', background: d.color }}></div></div>
      </div>
    </Card>
  );
}
function Metric({ label, value, tone }) {
  const t = { brand: 'text-brand-700', warning: 'text-amber-700', success: 'text-emerald-700', ink: 'text-ink-800' }[tone] || 'text-ink-800';
  return (
    <div className="p-2 rounded-lg bg-ink-50">
      <div className={`text-lg font-bold tabular-nums ${t}`}>{value ?? 0}</div>
      <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold">{label}</div>
    </div>
  );
}

function DepartmentDetailsPage({ id }) {
  const [dept, setDept] = useState(null);
  const [nf, setNf] = useState(false);
  useEffect(() => {
    const load = () => window.CIVIX.api.getDepartment(id).then(d => { if (!d) setNf(true); else setDept(d); });
    load(); window.addEventListener('civix:changed', load); return () => window.removeEventListener('civix:changed', load);
  }, [id]);
  if (nf) return <EmptyState icon="Building2" title="Department not found" body="Please pick one from the list." action={<Link to="/departments" className="text-brand-700 text-sm font-medium">Back to Departments</Link>}/>;
  if (!dept) return <LoadingSpinner/>;

  const stagesData = window.CIVIX.STATUSES.map(s => ({ name: s, value: dept.issues.filter(i => i.status === s).length }));
  const priorityCount = dept.issues.filter(i => i.severity === 'High' || i.severity === 'Critical').length;

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-ink-500 mb-4">
        <Link to="/departments" className="hover:text-ink-800">Departments</Link>
        <Icon name="ChevronRight" size={12}/> <span>{dept.name}</span>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white" style={{background: dept.color}}><Icon name="Building2" size={22}/></div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{dept.name}</h1>
          <p className="text-sm text-ink-500">{dept.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="Activity"      label="Open"       value={dept.open}       tone="brand"   help="Not yet resolved"/>
        <StatCard icon="Clock"         label="In progress" value={dept.in_progress} tone="warning"/>
        <StatCard icon="AlertTriangle" label="Priority"   value={priorityCount}   tone="danger"  help="Critical + High"/>
        <StatCard icon="CircleCheck"   label="Resolved"   value={dept.resolved}   tone="success"/>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-4">
        <ChartCard title="Workload by pipeline" subtitle="Where issues sit right now" className="lg:col-span-2" height={260}>
          <StatusBarChart data={stagesData}/>
        </ChartCard>
        <Card>
          <div className="text-sm font-semibold mb-3">Recent activity</div>
          <div className="space-y-2">
            {dept.issues.slice(0, 5).map(i => (
              <Link key={i.id} to={'/reports/'+i.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-50">
                <img src={i.image} className="w-10 h-10 object-cover rounded-md ring-1 ring-surface-border" alt=""/>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-mono text-ink-500">{i.ticket_id}</div>
                  <div className="text-sm font-medium truncate">{i.title}</div>
                  <div className="text-[11px] text-ink-500">{timeAgo(i.created_at)}</div>
                </div>
                <StatusBadge value={i.status}/>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <Card padded={false} className="mt-4">
        <div className="p-4 border-b border-surface-border flex items-center justify-between">
          <div className="text-sm font-semibold">Assigned reports</div>
          <div className="text-xs text-ink-500">{dept.issues.length} total</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-[11px] uppercase tracking-wider text-ink-500">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">ID</th>
                <th className="text-left px-4 py-3 font-semibold">Issue</th>
                <th className="text-left px-4 py-3 font-semibold">Category</th>
                <th className="text-left px-4 py-3 font-semibold">Severity</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Created</th>
              </tr>
            </thead>
            <tbody>
              {dept.issues.map(r => <ReportTableRow key={r.id} r={r}/>)}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { DepartmentsPage, DepartmentDetailsPage, DepartmentCard });
