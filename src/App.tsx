import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/Toast';
import { Login } from '@/components/Login';
import { Layout } from '@/components/Layout';
import { Dashboard } from '@/components/Dashboard';
import { ParkingStation } from '@/components/ParkingStation';
import { TasksToProcess } from '@/components/TasksToProcess';
import { CrudModule } from '@/components/CrudModule';
import { SettingsPage } from '@/components/SettingsPage';
import { MODULES } from '@/lib/modules';
import type { ModuleId } from '@/lib/types';

type Route = ModuleId | 'settings';

function Shell() {
  const { user, canAccess } = useAuth();
  const [route, setRoute] = useState<Route>('1_Dashboard');

  useEffect(() => {
    if (user && !canAccess('1_Dashboard')) {
      const first = user.QuyenModule[0] || '1_Dashboard';
      setRoute(first);
    }
  }, [user, canAccess]);

  if (!user) return <Login />;

  const navigate = (r: Route) => setRoute(r);

  // Guard: if user lacks permission, show no-access
  const isAllowed = route === 'settings' || canAccess(route as ModuleId);
  if (!isAllowed && route !== '1_Dashboard') {
    // fallback to first allowed
    const first = user.QuyenModule[0] || '1_Dashboard';
    if (route !== first) setRoute(first);
  }

  let content;
  if (route === 'settings') content = <SettingsPage />;
  else if (route === '1_Dashboard') content = <Dashboard onGoModule={(m) => setRoute(m)} />;
  else if (route === '2_ViecCanXuLy') content = <TasksToProcess />;
  else if (route === '19_LuotGiuXe') content = <ParkingStation />;
  else content = <CrudModule module={route as ModuleId} />;

  return (
    <Layout active={route} onNavigate={navigate}>
      {content}
    </Layout>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </ToastProvider>
  );
}

void MODULES;
export default App;
