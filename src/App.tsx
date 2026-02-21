import { useState, useCallback, useEffect } from 'react';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { AddTransaction } from '@/pages/AddTransaction';
import { TransactionsPage } from '@/pages/Transactions';
import { BillsPage } from '@/pages/Bills';
import { ReportsPage } from '@/pages/Reports';
import { ImportCSV } from '@/pages/ImportCSV';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { useAuth } from '@/contexts/AuthContext';
import type { ViewState } from '@/types';

// Simple hook to manage view state
function useViewState() {
  const [currentView, setCurrentViewState] = useState<ViewState>('dashboard');

  const setCurrentView = useCallback((view: ViewState) => {
    setCurrentViewState(view);
    // Store in session storage for persistence during session
    sessionStorage.setItem('currentView', view);
  }, []);

  // Restore view on mount
  useEffect(() => {
    const saved = sessionStorage.getItem('currentView') as ViewState;
    if (saved && ['dashboard', 'add', 'transactions', 'bills', 'reports', 'import'].includes(saved)) {
      setCurrentViewState(saved);
    }
  }, []);

  return { currentView, setCurrentView };
}

function App() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { currentView, setCurrentView } = useViewState();

  const handleNavigate = useCallback((view: string) => {
    if (['dashboard', 'add', 'transactions', 'bills', 'reports', 'import'].includes(view)) {
      setCurrentView(view as ViewState);
    }
  }, [setCurrentView]);

  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <div className="bg-ledger-bg min-h-screen flex items-center justify-center">
        <div className="grain-overlay" />
        <div className="flex flex-col items-center gap-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.15) 0%, rgba(201, 162, 39, 0.05) 100%)',
              border: '1px solid rgba(201, 162, 39, 0.3)',
            }}
          >
            <span className="font-serif text-2xl text-gold font-semibold">J</span>
          </div>
          <span className="w-5 h-5 border-2 border-ledger-text-secondary/30 border-t-gold rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-ledger-bg min-h-screen">
        <div className="grain-overlay" />
        <Login />
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'add':
        return <AddTransaction onNavigate={handleNavigate} />;
      case 'transactions':
        return <TransactionsPage />;
      case 'bills':
        return <BillsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'import':
        return <ImportCSV onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="bg-ledger-bg min-h-screen">
      {/* Grain overlay */}
      <div className="grain-overlay" />
      
      {/* Header */}
      <Header onAddClick={() => handleNavigate('add')} />
      
      {/* Main content */}
      <main className="pt-14">
        {renderContent()}
      </main>
      
      {/* Bottom Navigation */}
      <BottomNav currentView={currentView} onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
