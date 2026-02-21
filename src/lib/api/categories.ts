import { supabase } from '@/lib/supabase';

export interface Category {
  id: number;
  name: string;
  icon: string;
  is_income: boolean;
  color: string;
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('id');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  return (data || []).map(c => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    is_income: Boolean(c.is_income),
    color: c.color,
  }));
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching category:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    icon: data.icon,
    is_income: Boolean(data.is_income),
    color: data.color,
  };
}
