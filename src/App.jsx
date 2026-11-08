import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Toast } from './components/Toast';
import { OpenPlay } from './pages/OpenPlay';
import { CourtRentals } from './pages/CourtRentals';
import { PaddleRentals } from './pages/PaddleRentals';
import { Reports } from './pages/Reports';
import { LiveDisplay } from './pages/LiveDisplay';
import { Login } from './pages/Login';
import { Play, Calendar, Layers, BarChart3 } from 'lucide-react';

export default function App() {
  const { currentUser } = useApp();

  // Check URL pathname or query for /display mode
  const isDisplayUrl = () => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      const s = window.location.search.toLowerCase();
      return p.includes('display') || s.includes('display');
    }
    return false;
  };

  const [viewMode, setViewMode] = useState(isDisplayUrl() ? 'display' : 'admin');
  const [activeTab, setActiveTab] = useState('openplay');
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Sync with browser back/forward or url hash changes
  useEffect(() => {
    const handlePopState = () => {
      setViewMode(isDisplayUrl() ? 'display' : 'admin');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openLiveDisplay = () => {
    setViewMode('display');
    window.history.pushState({}, '', '/display');
  };

  const backToAdmin = () => {
    setViewMode('admin');
    window.history.pushState({}, '', '/');
  };

  // If in Display View (Public TV / Smartphone View)
  if (viewMode === 'display') {
    return (
      <>
        <LiveDisplay onBackToAdmin={backToAdmin} />
        <Toast />
      </>
    );
  }

  // If not logged in
  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={() => setIsAuthenticated(true)} />
        <Toast />
      </>
    );
  }

  // Admin Dashboard views
  const getTabContent = () => {
    switch (activeTab) {
      case 'openplay':
        return <OpenPlay onOpenLiveDisplay={openLiveDisplay} />;
      case 'courtrental':
        return <CourtRentals />;
      case 'paddlerental':
        return <PaddleRentals />;
      case 'reports':
        return <Reports />;
      default:
        return <OpenPlay onOpenLiveDisplay={openLiveDisplay} />;
    }
  };

  const getTabMeta = () => {
    switch (activeTab) {
      case 'openplay':
        return { title: 'Open Play', subtitle: 'Paddle Stacking & Session Queue Management', icon: Play };
      case 'courtrental':
        return { title: 'Court Rental', subtitle: 'Hourly Court Booking & Schedule Calendar', icon: Calendar };
      case 'paddlerental':
        return { title: 'Paddle & Ball Rental', subtitle: 'Equipment check-out, rental rates & return tracking', icon: Layers };
      case 'reports':
        return { title: 'Reports & Revenue', subtitle: 'Match history, registration logbook & session revenue', icon: BarChart3 };
      default:
        return { title: 'Open Play', subtitle: 'Paddle Stacking & Session Management', icon: Play };
    }
  };

  const meta = getTabMeta();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLiveDisplay={openLiveDisplay}
        onLogout={() => setIsAuthenticated(false)}
      />

      {/* Main Content Area */}
      <main
        style={{
          marginLeft: 272,
          flex: 1,
          padding: '28px 36px 60px',
          maxWidth: 1600,
          minHeight: '100vh',
        }}
      >
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          icon={meta.icon}
          onLogout={() => setIsAuthenticated(false)}
        />

        {getTabContent()}
      </main>

      {/* Floating Toasts */}
      <Toast />
    </div>
  );
}
