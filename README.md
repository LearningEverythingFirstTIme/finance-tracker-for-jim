# Jim's Finance App - React + Supabase

A personal finance tracker built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- 🔐 Password-only authentication (email: jim@finance.app)
- 💰 Track income and expenses
- 📊 Visual reports and charts
- 📅 Recurring bills management
- 📥 CSV import for bulk transactions
- 📱 Mobile-responsive design
- 🎨 Elegant ledger-inspired UI

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/          # UI components (shadcn/ui)
├── contexts/
│   ├── AuthContext.tsx  # Authentication state
│   └── DataContext.tsx  # Data fetching and mutations
├── lib/
│   ├── supabase.ts      # Supabase client
│   └── api/
│       ├── transactions.ts  # Transaction API
│       ├── bills.ts         # Bills API
│       └── reports.ts       # Reports API
├── pages/               # Page components
├── types/               # TypeScript types
└── App.tsx             # Main app component
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Supabase Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key

### 2. Database Schema

Run these SQL commands in the Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  category_id TEXT,
  type TEXT CHECK (type IN ('income', 'expense')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bills table
CREATE TABLE bills (
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

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only access their own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own bills"
  ON bills FOR ALL
  USING (auth.uid() = user_id);
```

### 3. Create User Account

Create a user with email `jim@finance.app` via Supabase Auth:

1. Go to Authentication → Users
2. Click "Add user"
3. Enter email: `jim@finance.app`
4. Set a secure password
5. The app will use this email automatically for login

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click "Deploy"

### 3. Post-Deploy Verification

1. Visit your deployed URL
2. Log in with the password you set for `jim@finance.app`
3. Add a test transaction
4. Verify data persists after refresh

## Authentication Flow

The app uses password-only authentication:

1. User enters password on login screen
2. App authenticates with Supabase using hardcoded email `jim@finance.app`
3. Session is persisted via Supabase Auth
4. Protected routes check authentication state

## API Layer

### Transactions

- `getTransactions()` - Fetch all transactions
- `addTransaction(data)` - Add new transaction
- `updateTransaction(id, data)` - Update transaction
- `deleteTransaction(id)` - Delete transaction
- `importTransactions(transactions)` - Bulk import

### Bills

- `getBills()` - Fetch all bills
- `addBill(data)` - Add new bill
- `updateBill(id, data)` - Update bill
- `deleteBill(id)` - Delete bill
- `toggleBillPaid(id, paid)` - Toggle paid status

### Reports

- `getDashboardData()` - Get dashboard summary
- `getMonthlySummary(month)` - Get monthly stats
- `getCategoryBreakdown(startDate, endDate)` - Get spending by category
- `getMonthlyData(year)` - Get yearly trend data

## Mobile Responsiveness

The app is fully responsive with:
- Bottom navigation on mobile
- Stacked layouts on small screens
- Touch-friendly buttons and inputs
- Optimized chart sizes for mobile

## License

Private - For Jim's personal use only.
