import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import * as transactionsApi from '@/lib/api/transactions';
import * as billsApi from '@/lib/api/bills';
import * as reportsApi from '@/lib/api/reports';
import type { Transaction, Bill } from '@/types';
import type { TransactionInput, BillInput } from '@/lib/api';
import { toast } from 'sonner';

// AA/Sobriety-themed encouraging messages
const ENCOURAGING_MESSAGES = [
  "One day at a time — and today, you're taking care of business.",
  "Progress, not perfection. Every entry is a step toward financial sanity.",
  "Just like we keep a moral inventory, we keep a financial one. Good work.",
  "Self-supporting through our own contributions — you're living the Tradition.",
  "Easy does it, but do it. You're showing up for yourself.",
  "Faith without works is dead — and you're putting in the work.",
  "Keep coming back — to your finances, to your program, to life.",
  "We will not regret the past nor wish to shut the door on it. You're facing your numbers head-on.",
  "To thine own self be true — honest books, honest recovery.",
  "The Promises are coming true in all your affairs, including these.",
];

function getRandomEncouragingMessage(): string {
  const index = Math.floor(Math.random() * ENCOURAGING_MESSAGES.length);
  return ENCOURAGING_MESSAGES[index];
}

interface DataContextType {
  // Data
  transactions: Transaction[];
  bills: Bill[];
  isLoading: boolean;
  isRefreshing: boolean;
  
  // Dashboard data
  dashboardSummary: {
    income: number;
    expense: number;
    balance: number;
    savingsRate: number;
  } | null;
  categoryBreakdown: reportsApi.CategoryData[];
  monthlyData: reportsApi.MonthlyData[];
  upcomingBills: Bill[];
  
  // Actions
  refreshData: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  refreshBills: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  
  // Mutations
  addTransaction: (data: TransactionInput) => Promise<void>;
  updateTransaction: (id: string, data: Partial<TransactionInput>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  importTransactions: (transactions: TransactionInput[]) => Promise<void>;
  
  addBill: (data: BillInput) => Promise<void>;
  updateBill: (id: string, data: Partial<BillInput>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  toggleBillPaid: (id: string, paid: boolean) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  // Data states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Dashboard states
  const [dashboardSummary, setDashboardSummary] = useState<DataContextType['dashboardSummary']>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<reportsApi.CategoryData[]>([]);
  const [monthlyData, setMonthlyData] = useState<reportsApi.MonthlyData[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<Bill[]>([]);

  // Refresh functions
  const refreshTransactions = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await transactionsApi.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Error refreshing transactions:', error);
      toast.error('Failed to load transactions');
    }
  }, [isAuthenticated]);

  const refreshBills = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await billsApi.getBills();
      setBills(data);
    } catch (error) {
      console.error('Error refreshing bills:', error);
      toast.error('Failed to load bills');
    }
  }, [isAuthenticated]);

  const refreshDashboard = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await reportsApi.getDashboardData();
      setDashboardSummary(data.summary);
      setCategoryBreakdown(data.categoryBreakdown);
      setMonthlyData(data.monthlyData);
      setUpcomingBills(data.upcomingBills);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      toast.error('Failed to load dashboard data');
    }
  }, [isAuthenticated]);

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshTransactions(),
        refreshBills(),
        refreshDashboard(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, [isAuthenticated, refreshTransactions, refreshBills, refreshDashboard]);

  // Transaction mutations
  const addTransaction = useCallback(async (data: TransactionInput) => {
    setIsLoading(true);
    try {
      await transactionsApi.addTransaction(data);
      await refreshTransactions();
      await refreshDashboard();
      toast.success('Transaction added successfully');
      // Show encouraging message after successful transaction
      setTimeout(() => {
        toast.message(getRandomEncouragingMessage(), {
          icon: '💙',
          style: {
            background: '#1e3a5f',
            border: '1px solid #2d5a87',
            color: '#e0f0ff',
          },
        });
      }, 500);
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshTransactions, refreshDashboard]);

  const updateTransaction = useCallback(async (id: string, data: Partial<TransactionInput>) => {
    setIsLoading(true);
    try {
      await transactionsApi.updateTransaction(id, data);
      await refreshTransactions();
      await refreshDashboard();
      toast.success('Transaction updated successfully');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshTransactions, refreshDashboard]);

  const deleteTransaction = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await transactionsApi.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
      await refreshDashboard();
      toast.success('Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshDashboard]);

  const importTransactions = useCallback(async (newTransactions: TransactionInput[]) => {
    setIsLoading(true);
    try {
      await transactionsApi.importTransactions(newTransactions);
      await refreshTransactions();
      await refreshDashboard();
      toast.success(`${newTransactions.length} transactions imported successfully`);
    } catch (error) {
      console.error('Error importing transactions:', error);
      toast.error('Failed to import transactions');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshTransactions, refreshDashboard]);

  // Bill mutations
  const addBill = useCallback(async (data: BillInput) => {
    setIsLoading(true);
    try {
      await billsApi.addBill(data);
      await refreshBills();
      toast.success('Bill added successfully');
    } catch (error) {
      console.error('Error adding bill:', error);
      toast.error('Failed to add bill');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshBills]);

  const updateBill = useCallback(async (id: string, data: Partial<BillInput>) => {
    setIsLoading(true);
    try {
      await billsApi.updateBill(id, data);
      await refreshBills();
      toast.success('Bill updated successfully');
    } catch (error) {
      console.error('Error updating bill:', error);
      toast.error('Failed to update bill');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [refreshBills]);

  const deleteBill = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      await billsApi.deleteBill(id);
      setBills(prev => prev.filter(b => b.id !== id));
      toast.success('Bill deleted successfully');
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast.error('Failed to delete bill');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleBillPaid = useCallback(async (id: string, paid: boolean) => {
    try {
      await billsApi.toggleBillPaid(id, paid);
      setBills(prev => prev.map(bill => 
        bill.id === id 
          ? { ...bill, status: paid ? 'paid' : 'pending' }
          : bill
      ));
      toast.success(paid ? 'Bill marked as paid' : 'Bill marked as unpaid');
    } catch (error) {
      console.error('Error toggling bill status:', error);
      toast.error('Failed to update bill status');
      throw error;
    }
  }, []);

  return (
    <DataContext.Provider
      value={{
        transactions,
        bills,
        isLoading,
        isRefreshing,
        dashboardSummary,
        categoryBreakdown,
        monthlyData,
        upcomingBills,
        refreshData,
        refreshTransactions,
        refreshBills,
        refreshDashboard,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        importTransactions,
        addBill,
        updateBill,
        deleteBill,
        toggleBillPaid,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
