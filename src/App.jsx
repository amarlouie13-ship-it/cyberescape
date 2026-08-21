import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { appRoutes } from './routes';

const SplashPage = lazy(() => import('./pages/auth/SplashPage'));

function App() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white">Loading CyberEscape...</div>}>
      <Routes>
        <Route path="/" element={<SplashPage />} />
        {appRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route path="*" element={<SplashPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
