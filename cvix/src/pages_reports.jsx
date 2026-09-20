// ============================================================
// CIVIX — Report flow: /report, /report/result, /my-reports, /reports, /reports/:id
// ============================================================

const REPORT_DRAFT_KEY = 'civix.report.draft';

function readDraft()  { try { return JSON.parse(localStorage.getItem(REPORT_DRAFT_KEY) || '{}'); } catch { return {}; } }
function writeDraft(d){ localStorage.setItem(REPORT_DRAFT_KEY, JSON.stringify(d)); }
function clearDraft() { localStorage.removeItem(REPORT_DRAFT_KEY); }

// ---------- /report ----------
function ReportPage() {
  const { navigate } = useRoute();
  const initial = readDraft();
  const [image, setImage] = useState(initial.image || null);
  const [imageName, setImageName] = useState(initial.imageName || '');
  const [locationName, setLocationName] = useState(initial.locationName || '');
  const [coords, setCoords] = useState(initial.coords || null);
  const [description, setDescription] = useState(initial.description || '');
  const [category, setCategory] = useState(initial.category || 'Auto Detect');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropRef = useRef(null);

  useEffect(() => {
    writeDraft({ image, imageName, locationName, coords, description, category });
  }, [image, imageName, locationName, coords, description, category]);

  const onFile = (file) => {
    if (!file) return;
    const okTypes = ['image/jpeg','image/jpg','image/png','image/webp'];
    if (!okTypes.includes(file.type)) { setError('Please upload a JPG, PNG or WEBP image.'); return; }
    if (file.size > 8 * 1024 * 1024) { setError('Image must be under 8 MB.'); return; }
    setError(null);
    const r = new FileReader(); r.onload = () => { setImage(r.result); setImageName(file.name); }; r.readAsDataURL(file);
  };
  const onDrop = (e) => { e.preventDefault(); const f = e.dataTransfer.files && e.dataTransfer.files[0]; onFile(f); };
  const onDragOver = (e) => { e.preventDefault(); };

  const useMyLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation not available in this browser.'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: +pos.coords.latitude.toFixed(5), lng: +pos.coords.longitude.toFixed(5) }),
      () => setError('Location permission denied.'),
      { timeout: 5000 }
    );
  };

  const submit = async (e) => {
    e && e.preventDefault();
    if (!image) { setError('Please upload a photo of the civic problem.'); return; }
    setLoading(true); setError(null);
    try {
      const result = await window.CIVIX.api.aiAnalyze({
        description, locationName,
        hintedCategory: category, imageDataUrl: image,
      });
      // Stash for the result page
      sessionStorage.setItem('civix.analysis', JSON.stringify({
        result, image, imageName, locationName, coords, description
      }));
      navigate('/report/result');
    } catch (e2) {
      setError('AI analysis failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">Report an issue</div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight">Tell CIVIX what you saw.</h1>
        <p className="mt-2 text-ink-500 max-w-2xl">Upload a photo, add a location and a short note. Our AI will identify the issue, estimate severity and route it to the right department.</p>
      </div>

      <form onSubmit={submit} className="grid lg:grid-cols-5 gap-6">
        {/* Upload */}
        <div className="lg:col-span-3">
          <Card padded={false} className="overflow-hidden">
            <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
              <div className="text-sm font-semibold">Photo evidence</div>
              <div className="text-[11px] text-ink-500">JPG · PNG · WEBP · up to 8 MB</div>
            </div>
            <div
              ref={dropRef}
              onDrop={onDrop} onDragOver={onDragOver}
              className={`m-5 border-2 border-dashed rounded-xl transition-colors ${image ? 'border-transparent bg-ink-50' : 'border-ink-200 hover:border-brand-400 hover:bg-brand-50/40'}`}
              style={{ minHeight: 320 }}
            >
              {image ? (
                <div className="relative">
                  <img src={image} alt="preview" className="w-full max-h-[420px] object-contain rounded-xl bg-white"/>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button type="button" onClick={()=>{ setImage(null); setImageName(''); }} className="bg-white/95 ring-1 ring-surface-border rounded-md px-2.5 py-1 text-xs flex items-center gap-1 shadow-card"><Icon name="Trash2" size={12}/> Remove</button>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-white/95 ring-1 ring-surface-border rounded-md px-2.5 py-1 text-[11px] font-mono text-ink-600 shadow-card">{imageName || 'uploaded photo'}</div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center py-16 px-6 text-center cursor-pointer">
                  <div className="w-14 h-14 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mb-3"><Icon name="ImageUp" size={22}/></div>
                  <div className="font-semibold text-ink-800">Upload a photo of the civic problem</div>
                  <div className="text-sm text-ink-500 mt-1">Drag &amp; drop here, or click to browse</div>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={e => onFile(e.target.files[0])}/>
                </label>
              )}
            </div>
          </Card>

          {/* Demo photo shortcuts */}
          <div className="mt-4">
            <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold mb-2">Or try a demo image</div>
            <div className="flex flex-wrap gap-2">
              {['Potholes','Garbage','Waterlogging','Streetlights','Drainage'].map(cat => (
                <button type="button" key={cat} onClick={() => { setImage(window.CIVIX.catImage(cat)); setImageName('demo-'+cat.toLowerCase()+'.svg'); setCategory(cat); }}
                  className="inline-flex items-center gap-1.5 bg-white ring-1 ring-surface-border hover:ring-brand-300 hover:text-brand-700 px-2.5 py-1.5 rounded-lg text-xs text-ink-700">
                  <span className="w-2 h-2 rounded-full" style={{background: window.CATEGORY_COLOR[cat]}}></span> {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <div className="text-sm font-semibold mb-3">Location</div>
            <TextInput icon="MapPin" placeholder="e.g., Whitefield, Bengaluru" value={locationName} onChange={e => setLocationName(e.target.value)}/>
            <div className="flex items-center gap-2 mt-3">
              <button type="button" onClick={useMyLocation} className="inline-flex items-center gap-1.5 text-xs text-brand-700 hover:text-brand-800 font-medium">
                <Icon name="LocateFixed" size={14}/> Use my current location
              </button>
              {coords && <span className="text-[11px] text-ink-500 font-mono">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>}
            </div>
          </Card>

          <Card>
            <div className="text-sm font-semibold mb-3">Additional description</div>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              rows={5} placeholder="Tell us anything else about the problem…"
              className="w-full px-3 py-2 text-sm bg-white rounded-lg ring-1 ring-surface-border focus:ring-brand-400 focus:outline-none placeholder-ink-400 resize-none"
            />
          </Card>

          <Card>
            <div className="text-sm font-semibold mb-3">Issue category</div>
            <Select value={category} onChange={e => setCategory(e.target.value)} options={['Auto Detect', ...window.CIVIX.CATEGORIES.map(c => c.key)]}/>
            <div className="text-[11px] text-ink-500 mt-2">Leave as Auto Detect to let AI classify.</div>
          </Card>

          {error && <div className="text-sm text-red-700 bg-red-50 ring-1 ring-red-200 rounded-lg px-3 py-2">{error}</div>}

          <Button type="submit" size="lg" className="w-full" icon="Brain" disabled={loading}>
            {loading ? 'Analyzing civic issue…' : 'Analyze with AI'}
          </Button>
          <div className="text-[11px] text-ink-500 text-center">CIVIX will read the photo, classify the issue and estimate severity.</div>
        </div>
      </form>

      {loading && (
        <div className="fixed inset-0 z-40 bg-white/70 backdrop-blur flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-pop ring-1 ring-surface-border p-8 flex flex-col items-center max-w-sm text-center">
            <div className="relative w-16 h-16 mb-4">
              <svg className="animate-spin absolute inset-0" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="2"/>
                <path d="M22 12a10 10 0 0 1-10 10" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-brand-600"><Icon name="Brain" size={22}/></div>
            </div>
            <div className="font-semibold text-ink-900">Analyzing civic issue…</div>
            <div className="text-xs text-ink-500 mt-1">CIVIX is reading your photo and matching it to a category.</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- /report/result ----------
function ReportResultPage() {
  const { navigate } = useRoute();
  const [data, setData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('civix.analysis');
    if (raw) setData(JSON.parse(raw));
    else navigate('/report');
  }, []);

  if (!data) return <LoadingSpinner label="Loading analysis…"/>;
  const { result, image, imageName, locationName, coords, description } = data;

  const submit = async () => {
    setSubmitting(true);
    const created = await window.CIVIX.api.createIssue({
      title: result.title, category: result.category, description,
      severity: result.severity, confidence: result.confidence,
      department: result.department, recommended_action: result.recommended_action,
      reasoning: result.reasoning, location_name: locationName || undefined,
      latitude: coords ? coords.lat : undefined, longitude: coords ? coords.lng : undefined,
      image, source: 'citizen',
    });
    sessionStorage.setItem('civix.success', JSON.stringify(created));
    sessionStorage.removeItem('civix.analysis');
    clearDraft();
    navigate('/report/success');
  };
  const reanalyze = async () => {
    setSubmitting(true);
    const res = await window.CIVIX.api.aiAnalyze({ description, locationName, hintedCategory: result.category, imageDataUrl: image });
    setData(d => ({ ...d, result: res }));
    setSubmitting(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">AI Analysis</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Here's what CIVIX found.</h1>
        </div>
        <div className="text-xs text-ink-500 inline-flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 rounded-full px-2 py-0.5 ring-1 ring-emerald-200 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> {result._source === 'gemini' ? 'Gemini Vision' : 'Mock AI'}
          </span>
          <span>· {Math.round(result.confidence*100)}% confidence</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <Card padded={false} className="overflow-hidden">
            <img src={image} alt="report" className="w-full max-h-[420px] object-cover"/>
            <div className="px-4 py-3 text-[11px] text-ink-500 font-mono border-t border-surface-border">{imageName || 'photo'}</div>
          </Card>
          <Card className="mt-4">
            <div className="text-sm font-semibold mb-3">Location</div>
            <div className="flex items-center gap-2 text-sm text-ink-800"><Icon name="MapPin" size={14} className="text-ink-400"/> {locationName || 'Unspecified'}</div>
            {coords && <div className="mt-2 text-[11px] text-ink-500 font-mono">{coords.lat}, {coords.lng}</div>}
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <Card>
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">Issue</div>
                <div className="text-2xl font-bold tracking-tight mt-1">{result.title}</div>
                <div className="mt-2 flex items-center gap-2">
                  <CategoryBadge value={result.category}/>
                  <SeverityBadge value={result.severity} size="lg"/>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">AI Confidence</div>
                <div className="text-2xl font-bold text-brand-700 tabular-nums">{Math.round(result.confidence*100)}%</div>
                <div className="w-24 h-1.5 bg-ink-100 rounded-full mt-1 overflow-hidden"><div className="h-full bg-brand-600" style={{ width: `${Math.round(result.confidence*100)}%` }}></div></div>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">Responsible Department</div>
                <div className="mt-1 text-sm font-semibold flex items-center gap-2"><Icon name="Building2" size={14}/> {result.department}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">Recommended Action</div>
                <div className="mt-1 text-sm">{result.recommended_action}</div>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-surface-border">
              <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">AI Summary</div>
              <p className="mt-1 text-sm text-ink-700">{result.summary || result.description}</p>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center"><Icon name="Lightbulb" size={14}/></div>
              <div className="text-sm font-semibold">Why AI classified this</div>
            </div>
            <ul className="space-y-2">
              {(result.reasoning || []).map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-700"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500"></span>{r}</li>
              ))}
            </ul>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" icon="Send" onClick={submit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Complaint'}</Button>
            <Button size="lg" variant="secondary" icon="Pencil" onClick={()=>navigate('/report')}>Edit Report</Button>
            <Button size="lg" variant="ghost" icon="RefreshCcw" onClick={reanalyze} disabled={submitting}>Analyze Again</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Success page ----------
function ReportSuccessPage() {
  const { navigate } = useRoute();
  const [issue, setIssue] = useState(null);
  useEffect(() => {
    const raw = sessionStorage.getItem('civix.success');
    if (raw) setIssue(JSON.parse(raw));
    else navigate('/report');
  }, []);
  if (!issue) return <LoadingSpinner/>;

  const steps = [
    { t: 'Report Created',      done: true },
    { t: 'AI Analyzed',         done: true },
    { t: 'Department Assigned', done: true },
    { t: 'Awaiting Action',     done: false, active: true },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center pop-in">
          <Icon name="CircleCheck" size={40}/>
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Complaint Submitted</h1>
        <p className="mt-2 text-ink-500">Your civic complaint has been created and routed to the appropriate department.</p>
        <div className="mt-6 inline-flex items-center gap-3 bg-white ring-1 ring-surface-border rounded-full px-4 py-2 shadow-card">
          <span className="text-[11px] uppercase tracking-wider text-ink-500 font-semibold">Ticket</span>
          <span className="font-mono font-bold text-lg text-ink-900">{issue.ticket_id}</span>
        </div>
      </div>

      <Card className="mt-10">
        <div className="grid sm:grid-cols-2 gap-4">
          <Detail label="Category" value={<CategoryBadge value={issue.category}/>}/>
          <Detail label="Severity" value={<SeverityBadge value={issue.severity}/>}/>
          <Detail label="Department" value={issue.department}/>
          <Detail label="Location" value={issue.location_name}/>
          <Detail label="Submitted" value={formatDT(issue.created_at)}/>
          <Detail label="Status" value={<StatusBadge value={issue.status}/>}/>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="text-sm font-semibold mb-4">Resolution Timeline</div>
        <ol className="relative">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3 pb-4 last:pb-0 relative">
              <div className="flex flex-col items-center">
                <span className={`tl-dot ${s.done ? 'bg-emerald-500' : s.active ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-ink-200'}`}></span>
                {i < steps.length - 1 && <span className="w-px flex-1 bg-ink-200 mt-1"></span>}
              </div>
              <div className="pb-2">
                <div className={`text-sm ${s.done ? 'text-ink-800 font-medium' : s.active ? 'text-amber-800 font-semibold' : 'text-ink-500'}`}>{s.t}</div>
                <div className="text-[11px] text-ink-500">{s.done ? formatDT(issue.created_at) : s.active ? 'Awaiting municipal action' : '—'}</div>
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <Link to={`/reports/${issue.id}`} className="inline-flex items-center gap-1.5 bg-ink-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium"><Icon name="Eye" size={14}/> View Complaint</Link>
        <Link to="/map" className="inline-flex items-center gap-1.5 bg-white ring-1 ring-surface-border text-ink-800 px-4 py-2.5 rounded-lg text-sm font-medium"><Icon name="Map" size={14}/> View on Map</Link>
        <Link to="/report" className="inline-flex items-center gap-1.5 text-brand-700 hover:text-brand-800 px-4 py-2.5 rounded-lg text-sm font-medium">Report Another Issue</Link>
      </div>
    </div>
  );
}
function Detail({ label, value }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">{label}</div>
      <div className="mt-1 text-sm text-ink-800">{value}</div>
    </div>
  );
}

// ---------- /my-reports ----------
function MyReportsPage() {
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState('All');
  useEffect(() => {
    let alive = true;
    const load = () => window.CIVIX.api.listIssues({}).then(x => alive && setItems(x));
    load();
    window.addEventListener('civix:changed', load);
    return () => { alive = false; window.removeEventListener('civix:changed', load); };
  }, []);
  const filtered = useMemo(() => {
    if (!items) return [];
    let x = items;
    if (tab === 'Pending')     x = x.filter(i => i.status === 'Reported' || i.status === 'Under Review');
    if (tab === 'In Progress') x = x.filter(i => i.status === 'Assigned' || i.status === 'In Progress');
    if (tab === 'Resolved')    x = x.filter(i => i.status === 'Resolved');
    if (q) {
      const s = q.toLowerCase();
      x = x.filter(i => i.ticket_id.toLowerCase().includes(s) || i.title.toLowerCase().includes(s) || (i.location_name||'').toLowerCase().includes(s));
    }
    return x;
  }, [items, tab, q]);
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">My Reports</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Track your civic reports.</h1>
        </div>
        <Link to="/report" className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm px-3.5 py-2 rounded-lg font-medium"><Icon name="Plus" size={14}/> New report</Link>
      </div>
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <div className="flex items-center bg-white ring-1 ring-surface-border rounded-lg p-1">
          {['All','Pending','In Progress','Resolved'].map(t => (
            <button key={t} onClick={()=>setTab(t)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${tab===t?'bg-ink-900 text-white':'text-ink-600 hover:bg-ink-50'}`}>{t}</button>
          ))}
        </div>
        <TextInput icon="Search" placeholder="Search reports…" value={q} onChange={e=>setQ(e.target.value)} className="w-full sm:w-72"/>
      </div>
      {items === null ? <LoadingSpinner/> : filtered.length === 0 ? <EmptyState icon="FileText" title="No civic reports found." body="Try a different filter or submit a new report." action={<Link to="/report" className="inline-flex items-center gap-1.5 bg-brand-600 text-white text-sm px-3 py-2 rounded-lg font-medium">Report an issue</Link>}/> : (
        <div className="grid gap-3">
          {filtered.map(r => <ReportRowCard key={r.id} r={r}/>)}
        </div>
      )}
    </div>
  );
}

function ReportRowCard({ r }) {
  const { navigate } = useRoute();
  return (
    <Card onClick={()=>navigate('/reports/'+r.id)} className="cursor-pointer hover:shadow-cardHover transition-shadow">
      <div className="grid grid-cols-12 gap-4 items-center">
        <img src={r.image} className="col-span-3 sm:col-span-2 h-16 object-cover rounded-lg ring-1 ring-surface-border" alt=""/>
        <div className="col-span-9 sm:col-span-4">
          <div className="text-xs font-mono text-ink-500">{r.ticket_id}</div>
          <div className="font-semibold text-ink-900 mt-0.5">{r.title}</div>
          <div className="text-xs text-ink-500 mt-1 flex items-center gap-1.5"><Icon name="MapPin" size={12}/> {r.location_name}</div>
        </div>
        <div className="col-span-6 sm:col-span-2"><CategoryBadge value={r.category}/></div>
        <div className="col-span-3 sm:col-span-2"><SeverityBadge value={r.severity}/></div>
        <div className="col-span-3 sm:col-span-2 text-right"><StatusBadge value={r.status}/><div className="text-[11px] text-ink-500 mt-1">{timeAgo(r.created_at)}</div></div>
      </div>
    </Card>
  );
}

// ---------- /reports (admin full list) ----------
function ReportsPage() {
  const [items, setItems] = useState(null);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 12;

  useEffect(() => {
    let alive = true;
    const load = () => window.CIVIX.api.listIssues({}).then(x => alive && setItems(x));
    load();
    window.addEventListener('civix:changed', load);
    return () => { alive = false; window.removeEventListener('civix:changed', load); };
  }, []);
  const filtered = useMemo(() => {
    if (!items) return [];
    let x = items;
    if (category)   x = x.filter(i => i.category === category);
    if (severity)   x = x.filter(i => i.severity === severity);
    if (department) x = x.filter(i => i.department === department);
    if (status)     x = x.filter(i => i.status === status);
    if (q) { const s = q.toLowerCase(); x = x.filter(i => i.ticket_id.toLowerCase().includes(s) || i.title.toLowerCase().includes(s) || (i.location_name||'').toLowerCase().includes(s) || (i.department||'').toLowerCase().includes(s)); }
    return x;
  }, [items, category, severity, department, status, q]);
  useEffect(() => { setPage(1); }, [category, severity, department, status, q]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page-1)*perPage, page*perPage);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">Reports</div>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">Report Management</h1>
          <p className="text-sm text-ink-500 mt-1">Filter, sort and update the civic complaint queue.</p>
        </div>
        <div className="flex items-center gap-2">
          <DemoPill/>
          <Link to="/report" className="inline-flex items-center gap-1.5 bg-brand-600 text-white text-sm px-3 py-2 rounded-lg font-medium"><Icon name="Plus" size={14}/> New</Link>
        </div>
      </div>

      <Card padded={false}>
        <div className="p-4 flex flex-wrap items-center gap-2 border-b border-surface-border">
          <TextInput icon="Search" placeholder="Search by ticket, title, location, department…" value={q} onChange={e=>setQ(e.target.value)} className="w-full sm:w-80"/>
          <Select value={category} onChange={e=>setCategory(e.target.value)} options={[{value:'', label:'All categories'}, ...window.CIVIX.CATEGORIES.map(c=>({value:c.key,label:c.label}))]}/>
          <Select value={severity} onChange={e=>setSeverity(e.target.value)} options={[{value:'',label:'All severities'}, ...window.CIVIX.SEVERITIES.map(s=>({value:s,label:s}))]}/>
          <Select value={status} onChange={e=>setStatus(e.target.value)} options={[{value:'',label:'All statuses'}, ...window.CIVIX.STATUSES.map(s=>({value:s,label:s}))]}/>
          <Select value={department} onChange={e=>setDepartment(e.target.value)} options={[{value:'',label:'All departments'}, ...window.CIVIX.DEPARTMENTS.map(d=>({value:d.name,label:d.name}))]}/>
          <div className="ml-auto text-xs text-ink-500 hidden sm:block">{filtered.length} results</div>
        </div>

        {items === null ? <LoadingSpinner/> : filtered.length === 0 ? <EmptyState icon="Search" title="No matching reports" body="Try clearing filters or searching a different term."/> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-[11px] uppercase tracking-wider text-ink-500">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">ID</th>
                  <th className="text-left px-4 py-3 font-semibold">Image</th>
                  <th className="text-left px-4 py-3 font-semibold">Issue</th>
                  <th className="text-left px-4 py-3 font-semibold">Category</th>
                  <th className="text-left px-4 py-3 font-semibold">Severity</th>
                  <th className="text-left px-4 py-3 font-semibold">Department</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Created</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map(r => <ReportTableRow key={r.id} r={r}/>)}
              </tbody>
            </table>
          </div>
        )}
        {filtered.length > 0 && (
          <div className="p-3 flex items-center justify-between border-t border-surface-border text-xs">
            <div className="text-ink-500">Page {page} of {pageCount}</div>
            <div className="flex items-center gap-1">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-2 py-1 rounded-md ring-1 ring-surface-border disabled:opacity-40"><Icon name="ChevronLeft" size={14}/></button>
              <button onClick={()=>setPage(p=>Math.min(pageCount,p+1))} disabled={page===pageCount} className="px-2 py-1 rounded-md ring-1 ring-surface-border disabled:opacity-40"><Icon name="ChevronRight" size={14}/></button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function ReportTableRow({ r }) {
  const { navigate } = useRoute();
  return (
    <tr className="border-t border-surface-border hover:bg-ink-50/40 cursor-pointer" onClick={()=>navigate('/reports/'+r.id)}>
      <td className="px-4 py-3 font-mono text-xs text-ink-600">{r.ticket_id}</td>
      <td className="px-4 py-3"><img src={r.image} className="w-12 h-9 object-cover rounded-md ring-1 ring-surface-border" alt=""/></td>
      <td className="px-4 py-3">
        <div className="font-medium text-ink-900">{r.title}</div>
        <div className="text-[11px] text-ink-500 flex items-center gap-1"><Icon name="MapPin" size={11}/>{r.location_name}</div>
      </td>
      <td className="px-4 py-3"><CategoryBadge value={r.category}/></td>
      <td className="px-4 py-3"><SeverityBadge value={r.severity}/></td>
      <td className="px-4 py-3 text-ink-700">{r.department}</td>
      <td className="px-4 py-3"><StatusBadge value={r.status}/></td>
      <td className="px-4 py-3 text-ink-500 text-xs">{timeAgo(r.created_at)}</td>
      <td className="px-4 py-3 text-right">
        <button onClick={(e)=>{ e.stopPropagation(); navigate('/reports/'+r.id); }} className="text-brand-700 hover:text-brand-800 text-xs font-medium inline-flex items-center gap-1">View <Icon name="ArrowRight" size={12}/></button>
      </td>
    </tr>
  );
}

// ---------- /reports/:id ----------
function ReportDetailsPage({ id }) {
  const { navigate } = useRoute();
  const [issue, setIssue] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const mapEl = useRef(null);
  const mapObj = useRef(null);

  useEffect(() => {
    let alive = true;
    const load = () => window.CIVIX.api.getIssue(id).then(x => {
      if (!alive) return;
      if (!x) setNotFound(true); else setIssue(x);
    });
    load();
    window.addEventListener('civix:changed', load);
    return () => { alive = false; window.removeEventListener('civix:changed', load); };
  }, [id]);

  useEffect(() => {
    if (!issue || !mapEl.current) return;
    if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; }
    const map = L.map(mapEl.current, { zoomControl: true, attributionControl: false }).setView([issue.latitude, issue.longitude], 15);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    L.marker([issue.latitude, issue.longitude], { icon: sevIcon(issue.severity) }).addTo(map).bindPopup(`<b>${issue.title}</b><br/>${issue.location_name}`);
    mapObj.current = map;
    return () => { map.remove(); mapObj.current = null; };
  }, [issue]);

  if (notFound) return <div className="p-10"><EmptyState icon="FileQuestion" title="Report not found" body="The ticket may have been removed or the link is invalid." action={<Link to="/reports" className="text-brand-700 text-sm font-medium">Back to reports</Link>}/></div>;
  if (!issue) return <LoadingSpinner/>;

  const advance = async () => {
    const idx = window.CIVIX.STATUSES.indexOf(issue.status);
    const next = window.CIVIX.STATUSES[Math.min(idx + 1, window.CIVIX.STATUSES.length - 1)];
    await window.CIVIX.api.updateIssueStatus(issue.id, next);
  };
  const setStatus = async (s) => { await window.CIVIX.api.updateIssueStatus(issue.id, s); };

  const steps = window.CIVIX.STATUSES.map((s, i) => {
    const curIdx = window.CIVIX.STATUSES.indexOf(issue.status);
    return { t: s, done: i < curIdx, active: i === curIdx };
  });

  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-ink-500 mb-4">
        <Link to="/reports" className="hover:text-ink-800">Reports</Link>
        <Icon name="ChevronRight" size={12}/>
        <span className="font-mono">{issue.ticket_id}</span>
      </div>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card padded={false} className="overflow-hidden">
            <img src={issue.image} alt="" className="w-full max-h-[420px] object-cover"/>
            <div className="p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">Issue</div>
                  <h1 className="text-2xl font-bold tracking-tight mt-1">{issue.title}</h1>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <CategoryBadge value={issue.category}/>
                    <SeverityBadge value={issue.severity}/>
                    <StatusBadge value={issue.status}/>
                    <span className="text-xs text-ink-500 inline-flex items-center gap-1"><Icon name="MapPin" size={12}/>{issue.location_name}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold">Confidence</div>
                  <div className="text-2xl font-bold text-brand-700 tabular-nums">{Math.round(issue.confidence*100)}%</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-ink-700">{issue.description}</p>
              <div className="mt-5 grid sm:grid-cols-2 gap-4">
                <Detail label="Department" value={<span className="font-medium">{issue.department}</span>}/>
                <Detail label="Recommended action" value={issue.recommended_action}/>
                <Detail label="Created" value={formatDT(issue.created_at)}/>
                <Detail label="Last update" value={formatDT(issue.updated_at)}/>
              </div>
            </div>
          </Card>

          <Card>
            <div className="text-sm font-semibold mb-3">Location</div>
            <div ref={mapEl} className="w-full h-64 rounded-lg overflow-hidden ring-1 ring-surface-border"></div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold">Resolution Timeline</div>
              <Button size="sm" variant="secondary" icon="Play" onClick={advance}>Advance status</Button>
            </div>
            <ol>
              {steps.map((s, i) => (
                <li key={i} className="flex items-start gap-3 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span className={`tl-dot ${s.done ? 'bg-emerald-500' : s.active ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-ink-200'}`}></span>
                    {i < steps.length - 1 && <span className="w-px flex-1 bg-ink-200 mt-1" style={{minHeight: 16}}></span>}
                  </div>
                  <div>
                    <div className={`text-sm ${s.done ? 'text-ink-800' : s.active ? 'text-amber-800 font-semibold' : 'text-ink-500'}`}>{s.t}</div>
                    {s.active && <div className="text-[11px] text-ink-500">Currently at this stage</div>}
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <div className="text-sm font-semibold mb-3">Update status (admin)</div>
            <div className="grid grid-cols-1 gap-2">
              {window.CIVIX.STATUSES.map(s => (
                <button key={s} onClick={()=>setStatus(s)} className={`flex items-center justify-between px-3 py-2 rounded-lg ring-1 text-sm ${issue.status===s?'ring-brand-400 bg-brand-50 text-brand-800 font-medium':'ring-surface-border hover:bg-ink-50'}`}>
                  <span className="flex items-center gap-2"><StatusBadge value={s}/></span>
                  {issue.status===s && <Icon name="Check" size={14}/>}
                </button>
              ))}
            </div>
          </Card>

          <Card>
            <div className="text-sm font-semibold mb-3">Why AI classified this</div>
            <ul className="space-y-2">
              {(issue.reasoning || []).map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-ink-700"><span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500"></span>{r}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

function sevIcon(sev) {
  const cls = sev === 'Critical' ? 'crit' : sev === 'High' ? 'high' : sev === 'Medium' ? 'med' : 'low';
  const letter = sev[0];
  return L.divIcon({
    className: '',
    html: `<div class="civix-marker ${cls}">${letter}</div>`,
    iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -12],
  });
}

Object.assign(window, {
  ReportPage, ReportResultPage, ReportSuccessPage,
  MyReportsPage, ReportsPage, ReportDetailsPage, sevIcon,
});
