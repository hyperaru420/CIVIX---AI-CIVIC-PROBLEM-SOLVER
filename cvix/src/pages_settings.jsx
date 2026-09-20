// ============================================================
// CIVIX — Settings (/settings)
// ============================================================

function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  useEffect(() => { window.CIVIX.api.getSettings().then(setSettings); }, []);
  const patch = async (p) => { const s = await window.CIVIX.api.updateSettings(p); setSettings(s); };
  const doReset = async () => { setResetting(true); await window.CIVIX.api.resetDemoData(); setResetting(false); setConfirmOpen(false); };

  if (!settings) return <LoadingSpinner/>;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-brand-700">Settings</div>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-sm text-ink-500 mt-1">Configure how CIVIX runs in this demo environment.</p>
      </div>

      <div className="space-y-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold">AI Mode</div>
              <div className="text-xs text-ink-500">Choose which AI engine powers the analysis.</div>
            </div>
            <DemoPill/>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <button onClick={()=>patch({aiMode:'gemini'})} className={`text-left p-4 rounded-lg ring-1 ${settings.aiMode==='gemini'?'ring-brand-400 bg-brand-50':'ring-surface-border bg-white hover:bg-ink-50'}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white ring-1 ring-surface-border flex items-center justify-center"><Icon name="Sparkles" size={14}/></div>
                <div className="font-semibold">Gemini Vision</div>
                {settings.aiMode==='gemini' && <span className="ml-auto text-brand-700"><Icon name="Check" size={16}/></span>}
              </div>
              <div className="text-xs text-ink-500 mt-2">Uses the Gemini API when GEMINI_API_KEY is set server-side.</div>
              <div className="text-[10px] uppercase tracking-wider mt-2 text-amber-700">{settings.hasApiKey ? 'API key detected' : 'No API key — will fall back to Mock'}</div>
            </button>
            <button onClick={()=>patch({aiMode:'mock'})} className={`text-left p-4 rounded-lg ring-1 ${settings.aiMode==='mock'?'ring-brand-400 bg-brand-50':'ring-surface-border bg-white hover:bg-ink-50'}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white ring-1 ring-surface-border flex items-center justify-center"><Icon name="Cpu" size={14}/></div>
                <div className="font-semibold">Mock Demo</div>
                {settings.aiMode==='mock' && <span className="ml-auto text-brand-700"><Icon name="Check" size={16}/></span>}
              </div>
              <div className="text-xs text-ink-500 mt-2">Deterministic analysis based on your text and hinted category.</div>
              <div className="text-[10px] uppercase tracking-wider mt-2 text-emerald-700">Recommended for demos</div>
            </button>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold mb-3">System status</div>
          <div className="grid sm:grid-cols-3 gap-3">
            <StatusRow label="Database"    status="OK" hint="SQLite (local)"/>
            <StatusRow label="API"         status="OK" hint="FastAPI on :8000"/>
            <StatusRow label="AI engine"   status="OK" hint={settings.aiMode==='gemini' ? 'Gemini Vision' : 'Mock analyzer'}/>
          </div>
        </Card>

        <Card>
          <div className="text-sm font-semibold mb-3">Application information</div>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <Info k="Product"     v="CIVIX — AI Civic Resolver"/>
            <Info k="Version"     v="1.0.0-demo"/>
            <Info k="Environment" v="Local demonstration"/>
            <Info k="Data"        v="Illustrative — DEMO DATA"/>
          </div>
          <div className="mt-4 text-[11px] text-ink-500">API keys are never exposed to the frontend. In this demo, no data leaves your device.</div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Reset demo data</div>
              <div className="text-xs text-ink-500 mt-1">Restores the demo dataset. Any complaints you submitted will be replaced.</div>
            </div>
            <Button variant="danger" icon="RotateCcw" onClick={()=>setConfirmOpen(true)}>Reset Demo Data</Button>
          </div>
        </Card>
      </div>

      <Modal open={confirmOpen} onClose={()=>setConfirmOpen(false)} title="Reset demo data?">
        <div className="text-sm text-ink-600">This will clear all locally stored complaints and restore the seeded dataset. This cannot be undone.</div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={()=>setConfirmOpen(false)}>Cancel</Button>
          <Button variant="danger" icon="RotateCcw" onClick={doReset} disabled={resetting}>{resetting?'Resetting…':'Reset'}</Button>
        </div>
      </Modal>
    </div>
  );
}

function StatusRow({ label, status, hint }) {
  const ok = status === 'OK';
  return (
    <div className="p-3 rounded-lg ring-1 ring-surface-border bg-white flex items-center gap-3">
      <span className={`w-2 h-2 rounded-full ${ok?'bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]':'bg-red-500'}`}></span>
      <div>
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-[11px] text-ink-500">{hint}</div>
      </div>
      <div className="ml-auto text-[11px] font-semibold uppercase text-emerald-700">{status}</div>
    </div>
  );
}
function Info({ k, v }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-ink-50">
      <div className="text-xs text-ink-500 uppercase tracking-wider font-semibold">{k}</div>
      <div className="text-sm font-medium">{v}</div>
    </div>
  );
}

Object.assign(window, { SettingsPage });
