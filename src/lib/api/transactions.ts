import { supabase } from '@/lib/supabase';
import type { Transaction } from '@/types';
import type { DbTransaction } from '@/lib/supabase';

function mapDbToTransaction(db: any): Transaction {
  return {
    id: db.id,
    date: db.date,
    amount: db.amount,
    category: db.category_id, // Map category_id to category
    categoryId: db.category_id,
    type: db.transaction_type,
    notes: db.notes,
    createdAt: db.created_at,
  };
}

export interface TransactionInput {
  date: string;
  amount: number;
  category: string;
  categoryId: string;
  type: 'income' | 'expense';
  notes: string;
}

export async function getTransactions(): Promise<Transaction[]> {
  // Fetch transactions with category names
  const { data: transactionsData, error: transError } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (transError) {
    console.error('Error fetching transactions:', transError);
    throw transError;
  }

  // Fetch all categories for lookup
  const { data: categoriesData, error: catError } = await supabase
    .from('categories')
    .select('id, name');

  if (catError) {
    console.error('Error fetching categories:', catError);
    // Continue with ID as fallback
  }

  // Create category lookup map
  const categoryMap: Record<number, string> = {};
  (categoriesData || []).forEach(c => {
    categoryMap[c.id] = c.name;
  });

  return (transactionsData || []).map(db => ({
    id: db.id,
    date: db.date,
    amount: db.amount,
    category: categoryMap[db.category_id] || String(db.category_id),
    categoryId: String(db.category_id),
    type: db.transaction_type,
    notes: db.notes,
    createdAt: db.created_at,
  }));
}

export async function addTransaction(data: TransactionInput): Promise<Transaction> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: result, error } = await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      date: data.date,
      amount: data.amount,
      category: data.category,
      category_id: parseInt(data.categoryId, 10),
      transaction_type: data.type,
      notes: data.notes,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }

  return mapDbToTransaction(result);
}

export async function updateTransaction(
  id: string, 
  data: Partial<TransactionInput>
): Promise<void> {
  const updateData: Partial<DbTransaction> = {};
  
  if (data.date !== undefined) updateData.date = data.date;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.categoryId !== undefined) updateData.category_id = parseInt(data.categoryId, 10);
  if (data.type !== undefined) updateData.transaction_type = data.type;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const { error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}

export async function importTransactions(transactions: TransactionInput[]): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const dbTransactions = transactions.map(t => ({
    user_id: user.id,
    date: t.date,
    amount: t.amount,
    category: t.category,
    category_id: parseInt(t.categoryId, 10),
    transaction_type: t.type,
    notes: t.notes,
  }));

  const { error } = await supabase
    .from('transactions')
    .insert(dbTransactions);

  if (error) {
    console.error('Error importing transactions:', error);
    throw error;
  }
}

// Reports API functions
export async function getMonthlySummary(month: string): Promise<{
  income: number;
  expense: number;
  balance: number;
}> {
  // Parse month (format: YYYY-MM)
  const [year, monthNum] = month.split('-').map(Number);
  const startOfMonth = new Date(year, monthNum - 1, 1).toISOString().split('T')[0];
  const endOfMonth = new Date(year, monthNum, 0).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('transactions')
    .select('transaction_type, amount')
    .gte('date', startOfMonth)
    .lte('date', endOfMonth);

  if (error) {
    console.error('Error fetching monthly summary:', error);
    throw error;
  }

  const income = (data || [])
    .filter(t => t.transaction_type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expense = (data || [])
    .filter(t => t.transaction_type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    income,
    expense,
    balance: income - expense,
  };
}

export interface CategoryData {
  name: string;
  amount: number;
  percentage: number;
}

export async function getCategoryBreakdown(
  startDate: string, 
  endDate: string
): Promise<CategoryData[]> {
  // Use ISO date format for Supabase
  const start = new Date(startDate).toISOString().split('T')[0];
  const end = new Date(endDate).toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('transactions')
    .select('category_id, amount')
    .eq('transaction_type', 'expense')
    .gte('date', start)
    .lte('date', end);

  if (error) {
    console.error('Error fetching category breakdown:', error);
    throw error;
  }

  const categoryTotals: Record<string, number> = {};
  let total = 0;

  (data || []).forEach(t => {
    categoryTotals[t.category_id] = (categoryTotals[t.category_id] || 0) + t.amount;
    total += t.amount;
  });

  return Object.entries(categoryTotals)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export async function getMonthlyData(year: number): Promise<MonthlyData[]> {
  const startDate = new Date(`${year}-01-01`).toISOString().split('T')[0];
  const endDate = new Date(`${year}-12-31`).toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('transactions')
    .select('date, transaction_type, amount')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) {
    console.error('Error fetching monthly data:', error);
    throw error;
  }

  const monthlyMap: Record<string, { income: number; expense: number }> = {};

  (data || []).forEach(t => {
    const month = t.date.substring(0, 7); // YYYY-MM
    if (!monthlyMap[month]) {
      monthlyMap[month] = { income: 0, expense: 0 };
    }
    if (t.transaction_type === 'income') {
      monthlyMap[month].income += t.amount;
    } else {
      monthlyMap[month].expense += t.amount;
    }
  });

  return Object.entries(monthlyMap)
    .map(([month, values]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short' }),
      income: values.income,
      expense: values.expense,
      balance: values.income - values.expense,
    }))
    .sort((a, b) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });
}
