import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LegalNoticeBanner } from './components/LegalNoticeBanner';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Views
import { LandingPage } from './views/LandingPage';
import { AuthPages } from './views/AuthPages';
import { PublicMarketplace } from './views/PublicMarketplace';
import { DashboardView } from './views/dashboard/DashboardView';
import { AdminPanel } from './views/admin/AdminPanel';
import { LegalPages } from './views/LegalPages';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by App ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-slate-400 text-xs max-w-md mb-6">
            An unexpected error occurred while loading this view. You can return directly to the Earn & Micro-Tasks Dashboard.
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.href = '/dashboard/earn';
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Return to Earn Dashboard</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      if (!pathname || pathname === '/' || pathname === '/home') {
        return '/dashboard/earn';
      }
      return pathname;
    }
    return '/dashboard/earn';
  });

  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname;
      if (!pathname || pathname === '/' || pathname === '/home') {
        setCurrentPath('/dashboard/earn');
      } else {
        setCurrentPath(pathname);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching logic
  const renderRoute = () => {
    const cleanPath = (currentPath || '/dashboard/earn').split('?')[0];

    // Landing / Home route redirects to /dashboard/earn
    if (cleanPath === '/' || cleanPath === '' || cleanPath === '/home') {
      return <DashboardView currentSubpath="earn" navigate={navigate} />;
    }
    if (cleanPath === '/landing') {
      return <LandingPage navigate={navigate} />;
    }
    if (cleanPath === '/login') {
      return <AuthPages mode="login" navigate={navigate} />;
    }
    if (cleanPath === '/register') {
      return <AuthPages mode="register" navigate={navigate} />;
    }
    if (cleanPath === '/services' || cleanPath === '/my-services') {
      return <PublicMarketplace initialTab="services" navigate={navigate} />;
    }
    if (cleanPath === '/jobs' || cleanPath === '/my-jobs') {
      return <PublicMarketplace initialTab="jobs" navigate={navigate} />;
    }
    if (
      cleanPath === '/tasks' ||
      cleanPath === '/surveys' ||
      cleanPath === '/offers' ||
      cleanPath === '/cpalead' ||
      cleanPath === '/cpalead-offers' ||
      cleanPath === '/microtasks'
    ) {
      return <PublicMarketplace initialTab="tasks" navigate={navigate} />;
    }
    if (cleanPath === '/courses' || cleanPath === '/academy') {
      return <PublicMarketplace initialTab="courses" navigate={navigate} />;
    }
    if (cleanPath === '/products' || cleanPath === '/digital-products') {
      return <PublicMarketplace initialTab="products" navigate={navigate} />;
    }

    // Direct dashboard alias routes
    if (
      cleanPath === '/earn' ||
      cleanPath === '/adsterra' ||
      cleanPath === '/ad-tasks' ||
      cleanPath === '/earn-section' ||
      cleanPath === '/timewall' ||
      cleanPath === '/earn-tasks' ||
      cleanPath === '/micro-tasks' ||
      cleanPath === '/timewall-offers'
    ) {
      return <DashboardView currentSubpath="earn" navigate={navigate} />;
    }
    if (cleanPath === '/wallet') {
      return <DashboardView currentSubpath="wallet" navigate={navigate} />;
    }
    if (cleanPath === '/withdraw' || cleanPath === '/withdrawals') {
      return <DashboardView currentSubpath="withdrawals" navigate={navigate} />;
    }
    if (cleanPath === '/bonus' || cleanPath === '/daily-bonus') {
      return <DashboardView currentSubpath="bonus" navigate={navigate} />;
    }
    if (cleanPath === '/marketplace' || cleanPath === '/market') {
      return <DashboardView currentSubpath="marketplace" navigate={navigate} />;
    }
    if (cleanPath === '/transactions' || cleanPath === '/history') {
      return <DashboardView currentSubpath="transactions" navigate={navigate} />;
    }
    if (cleanPath === '/referral' || cleanPath === '/referrals' || cleanPath === '/affiliate') {
      return <DashboardView currentSubpath="referral" navigate={navigate} />;
    }
    if (cleanPath === '/kyc' || cleanPath === '/profile' || cleanPath === '/settings') {
      return <DashboardView currentSubpath="profile" navigate={navigate} />;
    }
    if (cleanPath === '/support' || cleanPath === '/tickets') {
      return <DashboardView currentSubpath="support" navigate={navigate} />;
    }
    if (cleanPath === '/messages') {
      return <DashboardView currentSubpath="messages" navigate={navigate} />;
    }
    if (cleanPath === '/notifications') {
      return <DashboardView currentSubpath="notifications" navigate={navigate} />;
    }

    // Dashboard nested subpaths
    if (cleanPath.startsWith('/dashboard')) {
      const parts = cleanPath.split('/').filter(Boolean);
      const subpath = parts[1] || 'earn';
      return <DashboardView currentSubpath={subpath} navigate={navigate} />;
    }

    // Admin panel
    if (cleanPath.startsWith('/admin')) {
      return <AdminPanel navigate={navigate} />;
    }

    // Legal and policy routes
    if (cleanPath === '/terms') {
      return <LegalPages type="terms" />;
    }
    if (cleanPath === '/privacy') {
      return <LegalPages type="privacy" />;
    }
    if (cleanPath === '/refund-policy') {
      return <LegalPages type="refund" />;
    }
    if (cleanPath === '/affiliate-disclosure') {
      return <LegalPages type="affiliate" />;
    }
    if (cleanPath === '/earnings-disclaimer') {
      return <LegalPages type="earnings" />;
    }

    // Default Fallback - redirect to /dashboard/earn
    return <DashboardView currentSubpath="earn" navigate={navigate} />;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] antialiased">
      {/* Mandatory Statutory Earnings & Compliance Notice Banner */}
      <LegalNoticeBanner />

      {/* Global Responsive Navigation */}
      <Navbar currentPath={currentPath} navigate={navigate} />

      {/* Main Routed Content */}
      <main className="flex-1">
        {renderRoute()}
      </main>

      {/* Global Comprehensive Footer with Full Legal Disclosures */}
      <Footer navigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
