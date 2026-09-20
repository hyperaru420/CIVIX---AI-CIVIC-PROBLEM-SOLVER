// ============================================================
// CIVIX — Chart wrappers using Recharts
// ============================================================

const {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area
} = Recharts;

const CHART_COLORS = {
  brand: '#2563EB', brandLight: '#93C5FD',
  crit: '#DC2626', high: '#EA580C', med: '#D97706', low: '#059669',
  ink: '#0B1220', muted: '#6B7280', grid: '#EEF1F5',
};

const SEV_COLOR = { Critical: '#DC2626', High: '#EA580C', Medium: '#D97706', Low: '#059669' };
const STATUS_COLOR = { 'Reported': '#94A3B8', 'Under Review': '#3B82F6', 'Assigned': '#6366F1', 'In Progress': '#D97706', 'Resolved': '#059669' };
const CATEGORY_COLOR = { 'Potholes': '#DC2626', 'Garbage': '#059669', 'Waterlogging': '#0284C7', 'Streetlights': '#D97706', 'Road Damage': '#EA580C', 'Drainage': '#0891B2', 'Other': '#7C3AED' };

function ChartCard({ title, subtitle, action, children, height = 260, className = '' }) {
  return (
    <Card className={`flex flex-col ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-ink-900">{title}</div>
          {subtitle && <div className="text-xs text-ink-500 mt-0.5">{subtitle}</div>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div style={{ width: '100%', height }}>{children}</div>
    </Card>
  );
}

function ReportsTrendChart({ data }) {
  return (
    <ResponsiveContainer>
      <AreaChart data={data} margin={{ top: 8, right: 16, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="cReports" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.brand} stopOpacity={0.35}/>
            <stop offset="100%" stopColor={CHART_COLORS.brand} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false}/>
        <XAxis dataKey="label" stroke={CHART_COLORS.muted} tick={{ fontSize: 11 }} tickLine={false} axisLine={false}/>
        <YAxis stroke={CHART_COLORS.muted} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={36}/>
        <Tooltip cursor={{ stroke: CHART_COLORS.brand, strokeDasharray: '3 3' }} />
        <Area type="monotone" dataKey="reports" stroke={CHART_COLORS.brand} fill="url(#cReports)" strokeWidth={2} name="Reports"/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

function CategoryBarChart({ data, layout = 'vertical' }) {
  return (
    <ResponsiveContainer>
      <BarChart data={data} layout={layout === 'horizontal' ? 'vertical' : 'horizontal'} margin={{ top: 8, right: 16, left: layout === 'horizontal' ? 40 : -18, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={layout !== 'horizontal'} horizontal={layout === 'horizontal'} />
        {layout === 'horizontal' ? (
          <>
            <XAxis type="number" stroke={CHART_COLORS.muted} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="name" stroke={CHART_COLORS.muted} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={110}/>
          </>
        ) : (
          <>
            <XAxis dataKey="name" stroke={CHART_COLORS.muted} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis stroke={CHART_COLORS.muted} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={36}/>
          </>
        )}
        <Tooltip cursor={{ fill: '#F5F7FA' }}/>
        <Bar dataKey="value" radius={[6,6,0,0]}>
          {data.map((d, i) => <Cell key={i} fill={CATEGORY_COLOR[d.name] || CHART_COLORS.brand}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function SeverityDonut({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer>
        <PieChart>
          <Tooltip/>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="60%" outerRadius="85%" paddingAngle={2} stroke="none">
            {data.map((d, i) => <Cell key={i} fill={SEV_COLOR[d.name] || '#999'}/>)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-2xl font-bold tabular-nums">{total}</div>
        <div className="text-[10px] uppercase tracking-wider text-ink-500">Reports</div>
      </div>
    </div>
  );
}

function StatusBarChart({ data }) {
  return (
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 8, right: 16, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false}/>
        <XAxis dataKey="name" stroke={CHART_COLORS.muted} tick={{ fontSize: 11 }} tickLine={false} axisLine={false}/>
        <YAxis stroke={CHART_COLORS.muted} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={36}/>
        <Tooltip cursor={{ fill: '#F5F7FA' }}/>
        <Bar dataKey="value" radius={[6,6,0,0]}>
          {data.map((d, i) => <Cell key={i} fill={STATUS_COLOR[d.name] || CHART_COLORS.brand}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function DepartmentWorkloadChart({ data }) {
  const items = data.map(d => ({ name: d.name, value: d.open, color: d.color }));
  return (
    <ResponsiveContainer>
      <BarChart data={items} layout="vertical" margin={{ top: 8, right: 24, left: 40, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" horizontal={true} vertical={false}/>
        <XAxis type="number" stroke={CHART_COLORS.muted} tick={{ fontSize: 11 }} tickLine={false} axisLine={false}/>
        <YAxis type="category" dataKey="name" stroke={CHART_COLORS.muted} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={150}/>
        <Tooltip cursor={{ fill: '#F5F7FA' }}/>
        <Bar dataKey="value" radius={[0,6,6,0]}>
          {items.map((d, i) => <Cell key={i} fill={d.color || CHART_COLORS.brand}/>)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function ResolutionTrendChart({ data }) {
  return (
    <ResponsiveContainer>
      <LineChart data={data} margin={{ top: 8, right: 16, left: -18, bottom: 0 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false}/>
        <XAxis dataKey="label" stroke={CHART_COLORS.muted} tick={{ fontSize: 11 }} tickLine={false} axisLine={false}/>
        <YAxis stroke={CHART_COLORS.muted} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={36}/>
        <Tooltip/>
        <Legend wrapperStyle={{ fontSize: 11 }}/>
        <Line type="monotone" dataKey="reports"  stroke={CHART_COLORS.brand} strokeWidth={2} dot={false} name="Reports"/>
        <Line type="monotone" dataKey="resolved" stroke="#059669" strokeWidth={2} dot={false} name="Resolved"/>
      </LineChart>
    </ResponsiveContainer>
  );
}

Object.assign(window, {
  ChartCard, ReportsTrendChart, CategoryBarChart, SeverityDonut, StatusBarChart, DepartmentWorkloadChart, ResolutionTrendChart,
  CHART_COLORS, SEV_COLOR, STATUS_COLOR, CATEGORY_COLOR,
});
