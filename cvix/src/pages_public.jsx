// ============================================================
// CIVIX — Public pages: Landing, About
// ============================================================

function HeroDashboardIllustration() {
  // A stylized illustration of the CIVIX admin, built with divs.
  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-gradient-to-br from-brand-100/60 via-white to-emerald-100/40 rounded-3xl blur-2xl -z-10"></div>
      <div className="bg-white rounded-2xl ring-1 ring-surface-border shadow-pop overflow-hidden">
        {/* Fake window bar */}
        <div className="flex items-center gap-1.5 px-4 h-9 border-b border-surface-border bg-ink-50">
          <span className="w-2.5 h-2.5 rounded-full bg-red-300"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-amber-300"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-300"></span>
          <div className="ml-3 text-[11px] text-ink-500 font-mono">civix.app/admin</div>
        </div>
        <div className="grid grid-cols-12 gap-3 p-4">
          {/* Left mini sidebar */}
          <div className="hidden sm:block col-span-2 space-y-1.5">
            {['LayoutDashboard','FileText','Map','BarChart3','Building2','Settings'].map((ic, i) => (
              <div key={i} className={`h-8 rounded-md flex items-center gap-2 px-2 text-[11px] ${i===0?'bg-brand-50 text-brand-700':'text-ink-500'}`}>
                <Icon name={ic} size={12}/> <span className="truncate">{['Overview','Reports','Map','Analytics','Depts','Settings'][i]}</span>
              </div>
            ))}
          </div>
          {/* Right content */}
          <div className="col-span-12 sm:col-span-10 space-y-3">
            <div className="grid grid-cols-4 gap-3">
              {[
                { l: 'Total', v: '1,284', c: 'text-ink-900' },
                { l: 'Active', v: '428', c: 'text-brand-700' },
                { l: 'High Pri', v: '96', c: 'text-red-600' },
                { l: 'Resolved', v: '856', c: 'text-emerald-600' },
              ].map((k, i) => (
                <div key={i} className="p-2.5 rounded-lg ring-1 ring-surface-border bg-white">
                  <div className="text-[9px] uppercase tracking-wider text-ink-400">{k.l}</div>
                  <div className={`text-base font-bold tabular-nums ${k.c}`}>{k.v}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 p-3 rounded-lg ring-1 ring-surface-border h-32 relative overflow-hidden">
                <div className="text-[10px] text-ink-500 mb-1">Reports this week</div>
                <svg viewBox="0 0 240 80" className="w-full h-16">
                  <defs><linearGradient id="hg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#2563EB" stopOpacity=".35"/><stop offset="1" stopColor="#2563EB" stopOpacity="0"/></linearGradient></defs>
                  <path d="M0,60 L30,45 L60,55 L90,30 L120,40 L150,20 L180,32 L210,18 L240,25 L240,80 L0,80 Z" fill="url(#hg)"/>
                  <path d="M0,60 L30,45 L60,55 L90,30 L120,40 L150,20 L180,32 L210,18 L240,25" fill="none" stroke="#2563EB" strokeWidth="2"/>
                </svg>
              </div>
              <div className="p-3 rounded-lg ring-1 ring-surface-border h-32 flex flex-col items-center justify-center">
                <div className="text-[10px] text-ink-500 mb-1">Severity</div>
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#DC2626" strokeWidth="4" strokeDasharray="18 100"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#EA580C" strokeWidth="4" strokeDasharray="28 100" strokeDashoffset="-18"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#D97706" strokeWidth="4" strokeDasharray="30 100" strokeDashoffset="-46"/>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#059669" strokeWidth="4" strokeDasharray="24 100" strokeDashoffset="-76"/>
                  </svg>
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg ring-1 ring-surface-border space-y-1.5">
              {[
                { id: 'CVX-1024', t: 'Pothole', l: 'Whitefield', s: 'HIGH', sc: 'text-orange-600' },
                { id: 'CVX-1023', t: 'Garbage', l: 'Koramangala', s: 'MED', sc: 'text-amber-700' },
                { id: 'CVX-1022', t: 'Waterlog', l: 'HSR Layout', s: 'CRIT', sc: 'text-red-600' },
              ].map(r => (
                <div key={r.id} className="grid grid-cols-12 items-center text-[11px] py-1 border-b border-surface-border last:border-0">
                  <div className="col-span-3 font-mono text-ink-500">{r.id}</div>
                  <div className="col-span-4 text-ink-800">{r.t}</div>
                  <div className="col-span-3 text-ink-500">{r.l}</div>
                  <div className={`col-span-2 text-right font-semibold ${r.sc}`}>{r.s}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Floating map card */}
      <div className="hidden sm:block absolute -bottom-8 -left-8 bg-white rounded-xl ring-1 ring-surface-border shadow-pop w-56 overflow-hidden">
        <div className="h-24 bg-gradient-to-br from-brand-100 via-emerald-50 to-white relative">
          <div className="absolute inset-0" style={{backgroundImage:'radial-gradient(circle at 30% 40%, rgba(220,38,38,0.35) 0, transparent 25px), radial-gradient(circle at 70% 60%, rgba(234,88,12,0.35) 0, transparent 22px), radial-gradient(circle at 55% 30%, rgba(5,150,105,0.35) 0, transparent 18px)'}}></div>
          <div className="absolute top-2 left-2 text-[10px] font-semibold text-ink-800 bg-white/80 rounded px-1.5 py-0.5">Live Map</div>
        </div>
        <div className="p-3">
          <div className="text-[11px] text-ink-500">3 hotspots detected in central district</div>
        </div>
      </div>
    </div>
  );
}

function HomePage() {
  const [stats, setStats] = useState(null);
  useEffect(() => { window.CIVIX.api.dashboardStats().then(setStats); }, []);
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 fade-in-up">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-brand-700 bg-brand-50 ring-1 ring-brand-100 rounded-full px-2.5 py-1 mb-5">
              <Icon name="Sparkles" size={12}/> AI-powered civic tech · Demo
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink-900 leading-[1.05]">
              Turn civic problems into <span className="text-brand-600">actionable solutions.</span>
            </h1>
            <p className="mt-5 text-lg text-ink-500 max-w-xl">
              AI-powered civic issue detection, intelligent routing and transparent resolution tracking — from the citizen's phone to the municipal command center.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/report" className="inline-flex items-center gap-2 bg-ink-900 hover:bg-ink-800 text-white px-5 py-3 rounded-lg text-sm font-semibold shadow-card">
                <Icon name="Camera" size={16}/> Report an Issue
              </Link>
              <Link to="/admin" className="inline-flex items-center gap-2 bg-white ring-1 ring-surface-border hover:bg-ink-50 text-ink-800 px-5 py-3 rounded-lg text-sm font-semibold">
                <Icon name="LayoutDashboard" size={16}/> Explore City Dashboard
              </Link>
            </div>
            <div className="mt-6 flex items-center gap-4 text-xs text-ink-500">
              <div className="flex -space-x-1.5">
                <span className="w-6 h-6 rounded-full bg-red-100 ring-2 ring-white flex items-center justify-center text-red-600"><Icon name="Camera" size={12}/></span>
                <span className="w-6 h-6 rounded-full bg-blue-100 ring-2 ring-white flex items-center justify-center text-blue-600"><Icon name="Brain" size={12}/></span>
                <span className="w-6 h-6 rounded-full bg-emerald-100 ring-2 ring-white flex items-center justify-center text-emerald-600"><Icon name="CircleCheck" size={12}/></span>
              </div>
              Report → AI → Route → Resolve — under one workflow.
            </div>
          </div>
          <div className="lg:col-span-6"><HeroDashboardIllustration/></div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-surface-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { v: '12,480+', l: 'Reports Processed' },
            { v: '94%',     l: 'AI Classification Accuracy' },
            { v: '82%',     l: 'Issues Resolved' },
            { v: '24/7',    l: 'Monitoring' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-3xl sm:text-4xl font-bold text-ink-900 tabular-nums">{s.v}</div>
              <div className="text-sm text-ink-500 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-6 -mt-3 text-[11px] text-ink-400 uppercase tracking-wider">Demo statistics · illustrative</div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">How CIVIX Works</div>
            <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">From a photo to a fix, in four steps.</h2>
            <p className="mt-3 text-ink-500">A single workflow connects citizens, AI classification and the right municipal department.</p>
          </div>
          <div className="mt-10 grid md:grid-cols-4 gap-4">
            {[
              { n: '01', t: 'Report',        d: 'Citizen uploads a photo, adds a location and a short note.',    ic: 'Camera' },
              { n: '02', t: 'AI Understands',d: 'Model identifies the issue, category, severity and confidence.', ic: 'Brain' },
              { n: '03', t: 'Smart Routing', d: 'CIVIX assigns the report to the correct department.',           ic: 'GitBranch' },
              { n: '04', t: 'Resolution',    d: 'Municipal team acts on it, and the status updates transparently.', ic: 'CircleCheck' },
            ].map((s, i) => (
              <div key={i} className="relative bg-white ring-1 ring-surface-border rounded-xl p-5 shadow-card">
                <div className="text-[11px] font-mono text-ink-400">{s.n}</div>
                <div className="mt-3 w-10 h-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center"><Icon name={s.ic} size={18}/></div>
                <div className="mt-3 font-semibold">{s.t}</div>
                <div className="mt-1 text-sm text-ink-500">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="pb-20 bg-white border-t border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div className="max-w-2xl">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">Platform</div>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Everything a city needs, in one console.</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { ic: 'ScanEye',    t: 'AI Vision',           d: 'Recognizes potholes, garbage, waterlogging, streetlights and more from a single photo.' },
              { ic: 'GitBranch',  t: 'Smart Routing',       d: 'Complaints go to the right department, every time — with a recommended action.' },
              { ic: 'MapPinned',  t: 'Geo Intelligence',    d: 'Live civic map surfaces hotspots and clusters across neighborhoods.' },
              { ic: 'BarChart3',  t: 'Analytics',           d: 'Trends, severity mix, department workload and resolution velocity in one view.' },
              { ic: 'Eye',        t: 'Transparent Tracking',d: 'Citizens follow every complaint from Reported to Resolved.' },
              { ic: 'Languages',  t: 'Multilingual Support',d: 'Report in the language you speak; AI understands and standardizes it.' },
            ].map((f, i) => (
              <div key={i} className="bg-surface-base rounded-xl ring-1 ring-surface-border p-5 hover:shadow-cardHover transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-white ring-1 ring-surface-border text-ink-800 flex items-center justify-center"><Icon name={f.ic} size={18}/></div>
                <div className="mt-3 font-semibold">{f.t}</div>
                <div className="mt-1 text-sm text-ink-500">{f.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-2xl bg-ink-900 text-white p-8 sm:p-12 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="text-2xl sm:text-3xl font-bold tracking-tight">See CIVIX resolve an issue in under a minute.</div>
              <div className="mt-2 text-ink-300 max-w-2xl">Try the full flow — upload a photo, watch AI classify and route it, then track the resolution across the dashboard and live map.</div>
            </div>
            <div className="flex gap-3">
              <Link to="/report" className="inline-flex items-center gap-2 bg-white text-ink-900 px-5 py-3 rounded-lg text-sm font-semibold"><Icon name="Camera" size={16}/> Try it now</Link>
              <Link to="/admin" className="inline-flex items-center gap-2 ring-1 ring-white/20 hover:bg-white/10 px-5 py-3 rounded-lg text-sm font-semibold"><Icon name="LayoutDashboard" size={16}/> Open Dashboard</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">About</div>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Civic technology, done transparently.</h1>
      <p className="mt-4 text-ink-500 text-lg">
        CIVIX is a demonstration of what modern civic tooling can look like when AI, geographic intelligence and clear resolution workflows come together. This build ships with realistic mock data so judges and stakeholders can experience the entire flow end-to-end without any setup.
      </p>
      <div className="mt-10 grid md:grid-cols-2 gap-6">
        {[
          { t: 'Built for demonstrations', d: 'Every route, chart and workflow is interactive — no dead buttons.' },
          { t: 'AI with a fallback', d: 'When a Gemini key is provided, live vision runs. Otherwise CIVIX uses a deterministic mock so the experience never breaks.' },
          { t: 'Privacy-first', d: 'API keys are never exposed to the browser. In this demo, no data leaves your device.' },
          { t: 'Open architecture', d: 'React + Recharts on the front, FastAPI + SQLite on the back. Swap components as needed.' },
        ].map((c, i) => (
          <Card key={i}>
            <div className="font-semibold text-ink-900">{c.t}</div>
            <div className="text-sm text-ink-500 mt-1">{c.d}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { HomePage, AboutPage });
