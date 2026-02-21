import type { Transaction, Category, Bill, MonthlyData, CategoryBreakdown } from '@/types';

export const categories: Category[] = [
  { id: '1', name: 'Salary', icon: 'Briefcase', isIncome: true },
  { id: '2', name: 'Freelance', icon: 'Laptop', isIncome: true },
  { id: '3', name: 'Investments', icon: 'TrendingUp', isIncome: true },
  { id: '4', name: 'Groceries', icon: 'ShoppingCart', isIncome: false },
  { id: '5', name: 'Dining', icon: 'Utensils', isIncome: false },
  { id: '6', name: 'Transport', icon: 'Car', isIncome: false },
  { id: '7', name: 'Utilities', icon: 'Zap', isIncome: false },
  { id: '8', name: 'Rent', icon: 'Home', isIncome: false },
  { id: '9', name: 'Entertainment', icon: 'Film', isIncome: false },
  { id: '10', name: 'Healthcare', icon: 'Heart', isIncome: false },
  { id: '11', name: 'Shopping', icon: 'ShoppingBag', isIncome: false },
  { id: '12', name: 'Other', icon: 'MoreHorizontal', isIncome: false },
];

export const transactions: Transaction[] = [
  {
    id: '1',
    date: '2026-02-20',
    amount: 4200,
    category: 'Salary',
    categoryId: '1',
    type: 'income',
    notes: 'Monthly salary',
    createdAt: '2026-02-20T09:00:00Z',
  },
  {
    id: '2',
    date: '2026-02-19',
    amount: 1200,
    category: 'Freelance',
    categoryId: '2',
    type: 'income',
    notes: 'Web design project',
    createdAt: '2026-02-19T14:30:00Z',
  },
  {
    id: '3',
    date: '2026-02-18',
    amount: 94.50,
    category: 'Groceries',
    categoryId: '4',
    type: 'expense',
    notes: 'Weekly groceries',
    createdAt: '2026-02-18T18:20:00Z',
  },
  {
    id: '4',
    date: '2026-02-17',
    amount: 142,
    category: 'Utilities',
    categoryId: '7',
    type: 'expense',
    notes: 'Electric bill',
    createdAt: '2026-02-17T10:00:00Z',
  },
  {
    id: '5',
    date: '2026-02-16',
    amount: 65,
    category: 'Dining',
    categoryId: '5',
    type: 'expense',
    notes: 'Dinner with friends',
    createdAt: '2026-02-16T20:00:00Z',
  },
  {
    id: '6',
    date: '2026-02-15',
    amount: 45,
    category: 'Transport',
    categoryId: '6',
    type: 'expense',
    notes: 'Gas refill',
    createdAt: '2026-02-15T16:45:00Z',
  },
  {
    id: '7',
    date: '2026-02-14',
    amount: 180,
    category: 'Entertainment',
    categoryId: '9',
    type: 'expense',
    notes: 'Concert tickets',
    createdAt: '2026-02-14T19:30:00Z',
  },
  {
    id: '8',
    date: '2026-02-13',
    amount: 350,
    category: 'Investments',
    categoryId: '3',
    type: 'income',
    notes: 'Dividend payment',
    createdAt: '2026-02-13T11:00:00Z',
  },
  {
    id: '9',
    date: '2026-02-12',
    amount: 78,
    category: 'Shopping',
    categoryId: '11',
    type: 'expense',
    notes: 'New shoes',
    createdAt: '2026-02-12T15:20:00Z',
  },
  {
    id: '10',
    date: '2026-02-11',
    amount: 120,
    category: 'Healthcare',
    categoryId: '10',
    type: 'expense',
    notes: 'Doctor visit',
    createdAt: '2026-02-11T09:30:00Z',
  },
  {
    id: '11',
    date: '2026-02-10',
    amount: 1500,
    category: 'Rent',
    categoryId: '8',
    type: 'expense',
    notes: 'Monthly rent',
    createdAt: '2026-02-10T08:00:00Z',
  },
  {
    id: '12',
    date: '2026-02-09',
    amount: 250,
    category: 'Freelance',
    categoryId: '2',
    type: 'income',
    notes: 'Consulting call',
    createdAt: '2026-02-09T13:00:00Z',
  },
];

export const bills: Bill[] = [
  {
    id: '1',
    name: 'Rent',
    amount: 1500,
    dueDate: '2026-03-01',
    category: 'Housing',
    isRecurring: true,
    frequency: 'monthly',
    status: 'pending',
  },
  {
    id: '2',
    name: 'Electricity',
    amount: 142,
    dueDate: '2026-02-25',
    category: 'Utilities',
    isRecurring: true,
    frequency: 'monthly',
    status: 'pending',
  },
  {
    id: '3',
    name: 'Internet',
    amount: 79,
    dueDate: '2026-02-22',
    category: 'Utilities',
    isRecurring: true,
    frequency: 'monthly',
    status: 'overdue',
  },
  {
    id: '4',
    name: 'Phone',
    amount: 65,
    dueDate: '2026-02-28',
    category: 'Utilities',
    isRecurring: true,
    frequency: 'monthly',
    status: 'pending',
  },
  {
    id: '5',
    name: 'Gym',
    amount: 50,
    dueDate: '2026-02-15',
    category: 'Health',
    isRecurring: true,
    frequency: 'monthly',
    status: 'paid',
  },
  {
    id: '6',
    name: 'Streaming',
    amount: 15,
    dueDate: '2026-02-20',
    category: 'Entertainment',
    isRecurring: true,
    frequency: 'monthly',
    status: 'paid',
  },
];

export const monthlyData: MonthlyData[] = [
  { month: 'Sep', income: 5200, expense: 3800, balance: 1400 },
  { month: 'Oct', income: 5400, expense: 4100, balance: 1300 },
  { month: 'Nov', income: 5100, expense: 3600, balance: 1500 },
  { month: 'Dec', income: 6200, expense: 4800, balance: 1400 },
  { month: 'Jan', income: 5500, expense: 3900, balance: 1600 },
  { month: 'Feb', income: 5750, expense: 2840, balance: 2910 },
];

export const categoryBreakdown: CategoryBreakdown[] = [
  { name: 'Housing', amount: 1500, percentage: 35, color: '#c9a227' },
  { name: 'Food', amount: 650, percentage: 15, color: '#5a9a6e' },
  { name: 'Transport', amount: 420, percentage: 10, color: '#a8b5b0' },
  { name: 'Utilities', amount: 380, percentage: 9, color: '#7a8b85' },
  { name: 'Entertainment', amount: 350, percentage: 8, color: '#c9a227' },
  { name: 'Other', amount: 540, percentage: 23, color: '#5a6a65' },
];

export const getIncomeTotal = () => {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getExpenseTotal = () => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getBalance = () => {
  return getIncomeTotal() - getExpenseTotal();
};
