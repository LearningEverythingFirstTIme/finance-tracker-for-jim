import { useState, useCallback } from 'react';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { AddTransaction } from '@/pages/AddTransaction';
import { TransactionsPage } from '@/pages/Transactions';
import { BillsPage } from '@/pages/Bills';
import { ReportsPage } from '@/pages/Reports';
import { ImportCSV } from '@/pages/ImportCSV';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { transactions as initialTransactions, bills as initialBills } from '@/data/mockData';
import type { Transaction, Bill, ViewState } from '@/types';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [bills, setBills] = useState<Bill[]>(initialBills);

  const handleLogin = useCallback(() => {
    setIsLoggedIn(true);
  }, []);

  const handleNavigate = useCallback((view: string) => {
    if (['dashboard', 'add', 'transactions', 'bills', 'reports', 'import'].includes(view)) {
      setCurrentView(view as ViewState);
    }
  }, []);

  const handleAddTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  }, []);

  const handleDeleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleToggleBillPaid = useCallback((id: string) => {
    setBills(prev => prev.map(bill => 
      bill.id === id 
        ? { ...bill, status: bill.status === 'paid' ? 'pending' : 'paid' }
        : bill
    ));
  }, []);

  const handleImportTransactions = useCallback((newTransactions: Omit<Transaction, 'id' | 'createdAt'>[]) => {
    const imported: Transaction[] = newTransactions.map((t, index) => ({
      ...t,
      id: `imported-${Date.now()}-${index}`,
      createdAt: new Date().toISOString(),
    }));
    setTransactions(prev => [...imported, ...prev]);
  }, []);

  if (!isLoggedIn) {
    return (
      <div className="bg-ledger-bg min-h-screen">
        <div className="grain-overlay" />
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'add':
        return <AddTransaction onAdd={handleAddTransaction} onNavigate={handleNavigate} />;
      case 'transactions':
        return <TransactionsPage transactions={transactions} onDelete={handleDeleteTransaction} />;
      case 'bills':
        return <BillsPage bills={bills} onTogglePaid={handleToggleBillPaid} />;
      case 'reports':
        return <ReportsPage transactions={transactions} />;
      case 'import':
        return <ImportCSV onImport={handleImportTransactions} onNavigate={handleNavigate} />;
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
