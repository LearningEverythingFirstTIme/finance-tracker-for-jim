import { supabase } from '@/lib/supabase';
import type { Bill } from '@/types';
import type { DbBill } from '@/lib/supabase';

function mapDbToBill(db: DbBill): Bill {
  return {
    id: db.id,
    name: db.name,
    amount: db.amount,
    dueDate: db.due_date,
    category: db.category,
    isRecurring: db.is_recurring,
    frequency: db.frequency,
    status: db.status,
  };
}

export interface BillInput {
  name: string;
  amount: number;
  dueDate: string;
  category: string;
  isRecurring: boolean;
  frequency: 'monthly' | 'weekly' | 'yearly';
  status: 'paid' | 'pending' | 'overdue';
}

export async function getBills(): Promise<Bill[]> {
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching bills:', error);
    throw error;
  }

  return (data || []).map(mapDbToBill);
}

export async function addBill(data: BillInput): Promise<Bill> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: result, error } = await supabase
    .from('bills')
    .insert({
      user_id: user.id,
      name: data.name,
      amount: data.amount,
      due_date: data.dueDate,
      category: data.category,
      is_recurring: data.isRecurring,
      frequency: data.frequency,
      status: data.status,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding bill:', error);
    throw error;
  }

  return mapDbToBill(result);
}

export async function updateBill(id: string, data: Partial<BillInput>): Promise<void> {
  const updateData: Partial<DbBill> = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.amount !== undefined) updateData.amount = data.amount;
  if (data.dueDate !== undefined) updateData.due_date = data.dueDate;
  if (data.category !== undefined) updateData.category = data.category;
  if (data.isRecurring !== undefined) updateData.is_recurring = data.isRecurring;
  if (data.frequency !== undefined) updateData.frequency = data.frequency;
  if (data.status !== undefined) updateData.status = data.status;

  const { error } = await supabase
    .from('bills')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating bill:', error);
    throw error;
  }
}

export async function deleteBill(id: string): Promise<void> {
  const { error } = await supabase
    .from('bills')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting bill:', error);
    throw error;
  }
}

export async function toggleBillPaid(id: string, paid: boolean): Promise<void> {
  const { error } = await supabase
    .from('bills')
    .update({ status: paid ? 'paid' : 'pending' })
    .eq('id', id);

  if (error) {
    console.error('Error toggling bill status:', error);
    throw error;
  }
}

export async function getUpcomingBills(limit: number = 5): Promise<Bill[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .gte('due_date', today)
    .neq('status', 'paid')
    .order('due_date', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching upcoming bills:', error);
    throw error;
  }

  return (data || []).map(mapDbToBill);
}

export async function getOverdueBills(): Promise<Bill[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('bills')
    .select('*')
    .lt('due_date', today)
    .neq('status', 'paid')
    .order('due_date', { ascending: true });

  if (error) {
    console.error('Error fetching overdue bills:', error);
    throw error;
  }

  // Mark them as overdue in the database
  const overdueIds = (data || []).map(b => b.id);
  if (overdueIds.length > 0) {
    await supabase
      .from('bills')
      .update({ status: 'overdue' })
      .in('id', overdueIds);
  }

  return (data || []).map(mapDbToBill);
}
