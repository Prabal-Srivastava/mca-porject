import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import Breadcrumbs from './components/Breadcrumbs';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EditorPage = lazy(() => import('./pages/EditorPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const StatusPage = lazy(() => import('./pages/StatusPage'));
const SnippetManager = lazy(() => import('./pages/SnippetManager'));
const Portfolio = lazy(() => import('./pages/Portfolio'));
const TestForge = lazy(() => import('./pages/TestForge'));
const BattleMode = lazy(() => import('./pages/BattleMode'));

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  return token ? <Navigate to="/dashboard" /> : children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/30">
        <Navbar />
        <main className="flex-1 flex flex-col pt-24">
          {/* Global Background Elements */}
          <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full animate-pulse-slow" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[150px] rounded-full" />
          </div>

          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          }>
            <Routes>
              <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/status" element={<div className="container mx-auto px-6 py-12 relative z-10 max-w-5xl"><StatusPage /></div>} />
              <Route path="/snippets" element={<div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl"><SnippetManager /></div>} />
              <Route path="/portfolio/:username" element={<Portfolio />} />
              <Route path="/tests" element={<div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl"><TestForge /></div>} />
              <Route path="/battles" element={<div className="container mx-auto px-6 py-12 relative z-10 max-w-7xl"><BattleMode /></div>} />
              
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <div className="container mx-auto px-6 py-12 relative z-10 max-w-6xl">
                      <Breadcrumbs />
                      <Dashboard />
                    </div>
                  </PrivateRoute>
                }
              />
              <Route
                path="/editor/:projectId?"
                element={
                  <PrivateRoute>
                    <div className="container mx-auto px-6 py-12 relative z-10 max-w-full h-[calc(100vh-180px)]">
                      <Breadcrumbs />
                      <EditorPage />
                    </div>
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}

export default App;
