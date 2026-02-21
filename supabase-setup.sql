-- Jim's Finance App - Supabase Database Setup
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  category_id TEXT,
  type TEXT CHECK (type IN ('income', 'expense')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only access their own transactions" ON transactions;

-- Create policy for transactions
CREATE POLICY "Users can only access their own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- ============================================
-- BILLS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  category TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT true,
  frequency TEXT CHECK (frequency IN ('monthly', 'weekly', 'yearly')),
  status TEXT CHECK (status IN ('paid', 'pending', 'overdue')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on bills
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only access their own bills" ON bills;

-- Create policy for bills
CREATE POLICY "Users can only access their own bills"
  ON bills FOR ALL
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);

-- ============================================
-- CATEGORIES TABLE (Optional - for custom categories)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT DEFAULT 'MoreHorizontal',
  is_income BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#c9a227',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only access their own categories" ON categories;

-- Create policy for categories
CREATE POLICY "Users can only access their own categories"
  ON categories FOR ALL
  USING (auth.uid() = user_id);

-- Insert default categories for new users (optional)
-- These can be used as a reference in the frontend

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment and modify user_id if you want to add sample data

/*
-- Sample transactions (replace with actual user_id)
INSERT INTO transactions (user_id, date, amount, category, category_id, type, notes) VALUES
  ('your-user-id-here', '2026-02-20', 4200.00, 'Salary', '1', 'income', 'Monthly salary'),
  ('your-user-id-here', '2026-02-19', 1200.00, 'Freelance', '2', 'income', 'Web design project'),
  ('your-user-id-here', '2026-02-18', 94.50, 'Groceries', '4', 'expense', 'Weekly groceries'),
  ('your-user-id-here', '2026-02-17', 142.00, 'Utilities', '7', 'expense', 'Electric bill'),
  ('your-user-id-here', '2026-02-16', 65.00, 'Dining', '5', 'expense', 'Dinner with friends');

-- Sample bills (replace with actual user_id)
INSERT INTO bills (user_id, name, amount, due_date, category, is_recurring, frequency, status) VALUES
  ('your-user-id-here', 'Rent', 1500.00, '2026-03-01', 'Housing', true, 'monthly', 'pending'),
  ('your-user-id-here', 'Electricity', 142.00, '2026-02-25', 'Utilities', true, 'monthly', 'pending'),
  ('your-user-id-here', 'Internet', 79.00, '2026-02-22', 'Utilities', true, 'monthly', 'overdue'),
  ('your-user-id-here', 'Phone', 65.00, '2026-02-28', 'Utilities', true, 'monthly', 'pending'),
  ('your-user-id-here', 'Gym', 50.00, '2026-02-15', 'Health', true, 'monthly', 'paid');
*/

-- ============================================
-- VERIFICATION
-- ============================================
-- Run these queries to verify the setup:

-- Check tables exist
-- SELECT * FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS is enabled
-- SELECT relname, relrowsecurity FROM pg_class WHERE relname IN ('transactions', 'bills', 'categories');

-- Check policies exist
-- SELECT * FROM pg_policies WHERE tablename IN ('transactions', 'bills', 'categories');
