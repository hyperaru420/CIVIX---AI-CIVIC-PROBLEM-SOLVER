// ============================================================
// CIVIX — Live Map (/map)
// ============================================================

function MapPage() {
  const [items, setItems] = useState(null);
  const [severity, setSeverity] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus]     = useState('');
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const mapEl = useRef(null);
  const mapObj = useRef(null);
  const layers = useRef({ markers: null, hotspots: null });

  useEffect(() => {
    let alive = true;
    const load = () => window.CIVIX.api.listIssues({}).then(x => alive && setItems(x));
    load();
    window.addEventListener('civix:changed', load);
    return () => { alive = false; window.removeEventListener('civix:changed', load); };
  }, []);

  // Init map once
  useEffect(() => {
    if (!mapEl.current || mapObj.current) return;
    const map = L.map(mapEl.current, { zoomControl: true, attributionControl: true, preferCanvas: true }).setView([12.9700, 77.6400], 12);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { subdomains: 'abcd', maxZoom: 19, attribution: '© OpenStreetMap © CARTO' }).addTo(map);
    layers.current.hotspots = L.layerGroup().addTo(map);
    layers.current.markers  = L.layerGroup().addTo(map);
    mapObj.current = map;
    return () => { map.remove(); mapObj.current = null; };
  }, []);

  const filtered = useMemo(() => {
    if (!items) return [];
    let x = items;
    if (severity) x = x.filter(i => i.severity === severity);
    if (category) x = x.filter(i => i.category === category);
    if (status)   x = x.filter(i => i.status === status);
    if (q) {
      const s = q.toLowerCase();
      x = x.filter(i => (i.location_name||'').toLowerCase().includes(s) || i.title.toLowerCase().includes(s) || i.ticket_id.toLowerCase().includes(s));
    }
    return x;
  }, [items, severity, category, status, q]);

  // Compute hotspots by grouping locations
  const hotspots = useMemo(() => {
    if (!filtered.length) return [];
    const groups = {};
    filtered.forEach(i => {
      if (!groups[i.location_name]) groups[i.location_name] = { name: i.location_name, count: 0, lat: 0, lng: 0 };
      groups[i.location_name].count++;
      groups[i.location_name].lat += i.latitude;
      groups[i.location_name].lng += i.longitude;
    });
    return Object.values(groups).map(g => ({ name: g.name, count: g.count, lat: g.lat / g.count, lng: g.lng / g.count })).filter(g => g.count >= 3).sort((a,b) => b.count - a.count);
  }, [filtered]);

  // Draw markers & hotspots
  useEffect(() => {
    const map = mapObj.current; if (!map) return;
    layers.current.markers.clearLayers();
    layers.current.hotspots.clearLayers();
    hotspots.forEach(h => {
      L.circle([h.lat, h.lng], { radius: 500 + h.count * 60, className: 'civix-hotspot', color: '#DC2626', weight: 1.5, fillColor: '#DC2626', fillOpacity: 0.12 }).addTo(layers.current.hotspots);
    });
    filtered.forEach(r => {
      const m = L.marker([r.latitude, r.longitude], { icon: sevIcon(r.severity) })
        .bindPopup(popupHtml(r), { closeButton: false });
      m.on('click', () => setSelected(r));
      m.addTo(layers.current.markers);
    });
  }, [filtered, hotspots]);

  const focus = (r) => {
    setSelected(r);
    const map = mapObj.current;
    if (map) map.flyTo([r.latitude, r.longitude], 15, { duration: 0.6 });
  };

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-4 h-[calc(100vh-9rem)] min-h-[560px]">
      {/* Left: map + top controls */}
      <div className="relative rounded-xl overflow-hidden ring-1 ring-surface-border bg-white">
        <div ref={mapEl} className="absolute inset-0"></div>
        {/* Overlay controls */}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center gap-2 z-[500]">
          <div className="bg-white/95 backdrop-blur ring-1 ring-surface-border rounded-lg shadow-card px-2 py-1 flex items-center gap-2 flex-wrap">
            <TextInput icon="Search" placeholder="Search location or ticket…" value={q} onChange={e=>setQ(e.target.value)} className="w-64"/>
            <Select value={category} onChange={e=>setCategory(e.target.value)} options={[{value:'',label:'All categories'}, ...window.CIVIX.CATEGORIES.map(c=>({value:c.key,label:c.label}))]}/>
            <Select value={severity} onChange={e=>setSeverity(e.target.value)} options={[{value:'',label:'All severities'}, ...window.CIVIX.SEVERITIES.map(s=>({value:s,label:s}))]}/>
            <Select value={status} onChange={e=>setStatus(e.target.value)} options={[{value:'',label:'All statuses'}, ...window.CIVIX.STATUSES.map(s=>({value:s,label:s}))]}/>
          </div>
          <div className="ml-auto bg-white/95 ring-1 ring-surface-border rounded-lg shadow-card px-3 py-1.5 text-xs text-ink-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {filtered.filter(i => i.status !== 'Resolved').length} active issues
          </div>
        </div>
        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-[500] bg-white/95 backdrop-blur ring-1 ring-surface-border rounded-lg shadow-card p-3 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-ink-500 font-semibold mb-2">Severity</div>
          <div className="flex flex-col gap-1.5">
            {[['crit','Critical','#DC2626'],['high','High','#EA580C'],['med','Medium','#D97706'],['low','Low','#059669']].map(([k,l,c]) => (
              <div key={k} className="flex items-center gap-2 text-ink-700">
                <span className="w-3 h-3 rounded-full" style={{background: c}}></span>{l}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: issue panel */}
      <div className="flex flex-col rounded-xl ring-1 ring-surface-border bg-white overflow-hidden">
        <div className="p-4 border-b border-surface-border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Nearby issues</div>
              <div className="text-xs text-ink-500 mt-0.5">{filtered.length} matches</div>
            </div>
            <DemoPill/>
          </div>
          {hotspots.length > 0 && (
            <div className="mt-3">
              <div className="text-[11px] uppercase tracking-wider text-ink-400 font-semibold mb-1.5">Hotspots</div>
              <div className="flex flex-wrap gap-1.5">
                {hotspots.slice(0, 5).map(h => (
                  <button key={h.name} onClick={()=>mapObj.current && mapObj.current.flyTo([h.lat,h.lng], 14, { duration: 0.6 })}
                    className="inline-flex items-center gap-1.5 text-[11px] bg-red-50 text-red-700 ring-1 ring-red-200 rounded-full px-2 py-0.5 hover:bg-red-100">
                    <Icon name="MapPin" size={10}/> {h.name} · {h.count}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto divide-y divide-surface-border">
          {items === null ? <LoadingSpinner/> : filtered.length === 0 ? <EmptyState icon="MapOff" title="No issues match" body="Adjust the filters to see reports."/> : filtered.slice(0, 60).map(r => (
            <button key={r.id} onClick={()=>focus(r)} className={`w-full text-left p-3 hover:bg-ink-50 ${selected && selected.id === r.id ? 'bg-brand-50' : ''}`}>
              <div className="flex items-start gap-3">
                <img src={r.image} className="w-14 h-14 object-cover rounded-md ring-1 ring-surface-border" alt=""/>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-ink-500">
                    {r.ticket_id}
                    <SeverityBadge value={r.severity}/>
                  </div>
                  <div className="text-sm font-medium text-ink-900 truncate mt-0.5">{r.title}</div>
                  <div className="text-[11px] text-ink-500 flex items-center gap-1 mt-0.5"><Icon name="MapPin" size={10}/>{r.location_name} · {timeAgo(r.created_at)}</div>
                  <div className="mt-1"><StatusBadge value={r.status}/></div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {selected && (
          <div className="border-t border-surface-border p-3">
            <Link to={'/reports/' + selected.id} className="w-full inline-flex items-center justify-center gap-1.5 bg-ink-900 text-white text-sm font-medium px-3 py-2 rounded-lg">
              Open {selected.ticket_id} <Icon name="ArrowRight" size={14}/>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function popupHtml(r) {
  const sev = r.severity;
  const sevColor = sev==='Critical' ? '#DC2626' : sev==='High' ? '#EA580C' : sev==='Medium' ? '#D97706' : '#059669';
  return `
    <div style="font-family: Inter, sans-serif; min-width: 220px">
      <div style="font-size: 11px; color:#6B7280; font-family: ui-monospace, monospace">${r.ticket_id}</div>
      <div style="font-weight:600; margin-top:2px; color:#0B1220">${r.title}</div>
      <div style="display:flex; gap:6px; margin-top:6px; flex-wrap:wrap">
        <span style="font-size:10px; padding:2px 6px; border-radius:6px; background:#F3F4F6; color:#374151">${r.category}</span>
        <span style="font-size:10px; padding:2px 6px; border-radius:6px; background:${sevColor}15; color:${sevColor}; font-weight:600; text-transform:uppercase">${sev}</span>
      </div>
      <div style="font-size:12px; color:#374151; margin-top:6px">${r.department}</div>
      <div style="font-size:11px; color:#6B7280; margin-top:2px">${r.location_name} · ${r.status}</div>
    </div>
  `;
}

Object.assign(window, { MapPage });
