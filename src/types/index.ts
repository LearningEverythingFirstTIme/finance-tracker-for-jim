export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  categoryId: string;
  type: 'income' | 'expense';
  notes: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  isIncome: boolean;
  color?: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isRecurring: boolean;
  frequency: 'monthly' | 'weekly' | 'yearly';
  status: 'paid' | 'pending' | 'overdue';
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryBreakdown {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export type ViewState = 'login' | 'dashboard' | 'add' | 'transactions' | 'bills' | 'reports' | 'import';
