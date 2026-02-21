import { supabase } from '@/lib/supabase';
import type { Transaction } from '@/types';
import type { DbTransaction } from '@/lib/supabase';

function mapDbToTransaction(db: DbTransaction): Transaction {
  return {
    id: db.id,
    date: db.date,
    amount: db.amount,
    category: db.category,
    categoryId: db.category_id,
    type: db.type,
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
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }

  return (data || []).map(mapDbToTransaction);
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
      category_id: data.categoryId,
      type: data.type,
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
  if (data.categoryId !== undefined) updateData.category_id = data.categoryId;
  if (data.type !== undefined) updateData.type = data.type;
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
    category_id: t.categoryId,
    type: t.type,
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
  const startOfMonth = `${month}-01`;
  const endOfMonth = `${month}-31`;

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .gte('date', startOfMonth)
    .lte('date', endOfMonth);

  if (error) {
    console.error('Error fetching monthly summary:', error);
    throw error;
  }

  const income = (data || [])
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expense = (data || [])
    .filter(t => t.type === 'expense')
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
  const { data, error } = await supabase
    .from('transactions')
    .select('category, amount')
    .eq('type', 'expense')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) {
    console.error('Error fetching category breakdown:', error);
    throw error;
  }

  const categoryTotals: Record<string, number> = {};
  let total = 0;

  (data || []).forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
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
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data, error } = await supabase
    .from('transactions')
    .select('date, type, amount')
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
    if (t.type === 'income') {
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
