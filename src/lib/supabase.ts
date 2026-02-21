import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!url || !key) {
  console.error('Missing Supabase env vars');
}

export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  key || 'placeholder'
);

export type SupabaseClient = typeof supabase;

// Database types matching Supabase schema
export interface DbTransaction {
  id: string;
  user_id: string;
  date: string;
  amount: number;
  category: string;
  category_id: number;
  transaction_type: 'income' | 'expense';
  notes: string;
  created_at: string;
}

export interface DbBill {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_date: string;
  category: string;
  is_recurring: boolean;
  frequency: 'monthly' | 'weekly' | 'yearly';
  status: 'paid' | 'pending' | 'overdue';
  created_at: string;
}

export interface DbCategory {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  is_income: boolean;
  color: string;
  created_at: string;
}
