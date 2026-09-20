// ============================================================
// CIVIX — App entry, routes
// ============================================================

const ROUTES = [
  { path: '/',                  component: HomePage },
  { path: '/about',             component: AboutPage },
  { path: '/report',            component: ReportPage },
  { path: '/report/result',     component: ReportResultPage },
  { path: '/report/success',    component: ReportSuccessPage },
  { path: '/my-reports',        component: MyReportsPage },
  { path: '/reports',           component: ReportsPage },
  { path: '/reports/:id',       component: ReportDetailsPage },
  { path: '/map',               component: MapPage },
  { path: '/analytics',         component: AnalyticsPage },
  { path: '/departments',       component: DepartmentsPage },
  { path: '/departments/:id',   component: DepartmentDetailsPage },
  { path: '/admin',             component: AdminDashboard },
  { path: '/insights',          component: AIInsightsPage },
  { path: '/settings',          component: SettingsPage },
];

function App() {
  // Warm the api / seed data on first mount
  useEffect(() => { window.CIVIX.api.dashboardStats(); }, []);
  return <Router routes={ROUTES} layout={({ children, path }) => <RootLayout path={path}>{children}</RootLayout>}/>;
}

const rootEl = document.getElementById('root');
ReactDOM.createRoot(rootEl).render(<App/>);
