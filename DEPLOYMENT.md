# Jim's Finance App - React + Supabase

A modern personal finance tracking application built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Password-only Authentication** - Simple login with hardcoded email (jim@finance.app)
- **Transaction Management** - Add, view, and delete income/expense transactions
- **Bill Tracking** - Track recurring bills with due dates and payment status
- **Dashboard** - Visual overview with charts and summaries
- **Reports** - Detailed financial insights with export functionality
- **CSV Import** - Bulk import transactions from bank statements

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth)
- **Charts**: Recharts
- **Icons**: Lucide React

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

The app expects the following tables in Supabase:

### transactions
```sql
create table transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  date date not null,
  amount decimal(10,2) not null,
  category text not null,
  category_id text,
  type text check (type in ('income', 'expense')) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### bills
```sql
create table bills (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  amount decimal(10,2) not null,
  due_date date not null,
  category text not null,
  is_recurring boolean default true,
  frequency text check (frequency in ('monthly', 'weekly', 'yearly')) default 'monthly',
  status text check (status in ('paid', 'pending', 'overdue')) default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

### Row Level Security (RLS)

Enable RLS on both tables and add policies:

```sql
-- Transactions RLS
alter table transactions enable row level security;

create policy "Users can only access their own transactions"
  on transactions for all
  using (auth.uid() = user_id);

-- Bills RLS
alter table bills enable row level security;

create policy "Users can only access their own bills"
  on bills for all
  using (auth.uid() = user_id);
```

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd jim-finance-frontend-new
npm install
```

### 2. Configure Supabase

1. Create a new Supabase project at https://supabase.com
2. Run the SQL schema above in the SQL Editor
3. Create a user with email `jim@finance.app` and your preferred password
4. Copy the project URL and anon key to your `.env` file

### 3. Development

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

## Deployment to Vercel

### Option 1: Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

### Option 2: Git Integration (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select "Vite" as the framework preset
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Deploy

### Option 3: Manual Upload

1. Build locally:
```bash
npm run build
```

2. Upload the `dist/` folder to Vercel:
   - Go to https://vercel.com/new
   - Select "Upload" 
   - Upload the `dist` folder contents
   - Add environment variables
   - Deploy

## Auth Setup

The app uses a hardcoded email (`jim@finance.app`) with password-only login. To set up:

1. In Supabase Dashboard, go to Authentication → Users
2. Click "Add User" → "Create New User"
3. Email: `jim@finance.app`
4. Password: Your chosen password
5. Confirm the user

## Project Structure

```
src/
├── components/      # UI components (shadcn/ui)
├── contexts/        # Auth and Data contexts
├── data/            # Mock data (categories)
├── lib/             # Utilities and API functions
│   ├── api/         # Supabase API functions
│   └── supabase.ts  # Supabase client
├── pages/           # Page components
├── types/           # TypeScript types
└── App.tsx          # Main app component
```

## License

Private - For Jim's personal use only.
