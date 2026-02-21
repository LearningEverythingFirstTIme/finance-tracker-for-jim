# Jim's Finance App - React Rewrite Implementation Plan

## Overview
Complete frontend rewrite of Jim's Finance Tracker from SvelteKit to React + Vite, connecting to existing Supabase backend from v3 (or new project if needed).

---

## Phase 1: Project Setup & Dependencies

### 1.1 Install Required Packages
```bash
npm install @supabase/supabase-js
npm install -D @types/node  # if not already present
```

### 1.2 Environment Configuration
Create `.env` file:
```
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[anon_key]
```

Update `vite.config.ts` to expose env vars:
```typescript
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {}
  }
})
```

---

## Phase 2: Supabase Client Setup

### 2.1 Create Supabase Client
**File:** `src/lib/supabase.ts`
```typescript
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
```

### 2.2 Type Definitions
**File:** `src/types/supabase.ts`
- Database table types
- Transaction, Bill, User types matching Supabase schema
- Auth response types

---

## Phase 3: Authentication System

### 3.1 Auth Context
**File:** `src/contexts/AuthContext.tsx`
```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (password: string) => Promise<void>;
  logout: () => Promise<void>;
}
```

### 3.2 Password-Only Login (Jim's Pattern)
- Hardcoded email: `jim@finance.app`
- Password stored in environment or hardcoded
- Supabase auth with signInWithPassword
- Session persistence via localStorage

### 3.3 Protected Route Wrapper
**File:** `src/components/ProtectedRoute.tsx`
- Redirects to login if no session
- Shows loading state during auth check

---

## Phase 4: Data Layer - API Functions

### 4.1 Transactions API
**File:** `src/lib/api/transactions.ts`
```typescript
export async function getTransactions(): Promise<Transaction[]>
export async function addTransaction(data: TransactionInput): Promise<Transaction>
export async function updateTransaction(id: string, data: Partial<Transaction>): Promise<void>
export async function deleteTransaction(id: string): Promise<void>
export async function importTransactions(transactions: TransactionInput[]): Promise<void>
```

### 4.2 Bills API
**File:** `src/lib/api/bills.ts`
```typescript
export async function getBills(): Promise<Bill[]>
export async function addBill(data: BillInput): Promise<Bill>
export async function updateBill(id: string, data: Partial<Bill>): Promise<void>
export async function deleteBill(id: string): Promise<void>
export async function toggleBillPaid(id: string, paid: boolean): Promise<void>
```

### 4.3 Reports API
**File:** `src/lib/api/reports.ts`
```typescript
export async function getMonthlySummary(month: string): Promise<MonthlySummary>
export async function getCategoryBreakdown(startDate: string, endDate: string): Promise<CategoryData[]>
export async function getYearlyComparison(year: number): Promise<YearlyData>
```

---

## Phase 5: State Management

### 5.1 Data Context
**File:** `src/contexts/DataContext.tsx`
```typescript
interface DataContextType {
  transactions: Transaction[];
  bills: Bill[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
  addTransaction: (data: TransactionInput) => Promise<void>;
  // ... other mutations
}
```

### 5.2 Real-time Subscriptions (Optional Phase 2)
- Subscribe to transactions table changes
- Subscribe to bills table changes
- Auto-refresh on external updates

---

## Phase 6: Component Updates

### 6.1 Login Page (`src/pages/Login.tsx`)
**Changes:**
- Replace mock `onLogin` prop with real Supabase auth
- Add loading state during login
- Show error messages from Supabase
- Store session in context

### 6.2 Dashboard (`src/pages/Dashboard.tsx`)
**Changes:**
- Fetch real data from Supabase
- Calculate totals from transactions
- Show upcoming bills from database
- Add loading skeletons

### 6.3 Add Transaction (`src/pages/AddTransaction.tsx`)
**Changes:**
- Submit to Supabase instead of local state
- Show success/error toasts
- Navigate after successful add

### 6.4 Transactions List (`src/pages/Transactions.tsx`)
**Changes:**
- Fetch from Supabase with pagination
- Real delete with confirmation
- Search/filter server-side or client-side

### 6.5 Bills Page (`src/pages/Bills.tsx`)
**Changes:**
- Fetch bills from Supabase
- Real toggle paid status
- Add/edit/delete bill operations

### 6.6 Reports (`src/pages/Reports.tsx`)
**Changes:**
- Query aggregated data from Supabase
- Replace mock chart data with real
- Date range filtering

### 6.7 CSV Import (`src/pages/ImportCSV.tsx`)
**Changes:**
- Parse CSV client-side (keep existing)
- Bulk insert to Supabase
- Show import progress/results

---

## Phase 7: Database Schema Alignment

### 7.1 Verify/Create Tables
**transactions table:**
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key)
- date: date
- description: text
- amount: numeric
- type: enum ('income', 'expense')
- category: text
- notes: text (optional)
- created_at: timestamp
```

**bills table:**
```sql
- id: uuid (primary key)
- user_id: uuid (foreign key)
- name: text
- amount: numeric
- due_date: date
- status: enum ('pending', 'paid')
- recurring: boolean
- frequency: text (optional)
- created_at: timestamp
```

### 7.2 Row Level Security (RLS)
- Enable RLS on all tables
- Policies: users can only access their own data
- Authenticated role permissions

---

## Phase 8: Error Handling & UX

### 8.1 Error Boundaries
**File:** `src/components/ErrorBoundary.tsx`
- Catch React errors
- Show user-friendly error UI
- Option to retry

### 8.2 Loading States
- Skeleton loaders for dashboard
- Spinners for buttons during async ops
- Full-page loader for initial auth check

### 8.3 Toast Notifications
**File:** `src/hooks/useToast.ts` or use sonner
- Success: "Transaction added"
- Error: "Failed to save. Please try again."
- Info: "Syncing..."

---

## Phase 9: Testing & Validation

### 9.1 Manual Testing Checklist
- [ ] Login with correct password
- [ ] Login with wrong password (error)
- [ ] Add transaction (appears in list)
- [ ] Delete transaction (confirms, removes)
- [ ] Add bill
- [ ] Toggle bill paid status
- [ ] Import CSV (bulk adds)
- [ ] Reports show correct data
- [ ] Logout and back in (data persists)
- [ ] Refresh page (stays logged in)

### 9.2 Data Integrity
- Verify amounts calculate correctly
- Check date formatting
- Confirm category filters work

---

## Phase 10: Deployment

### 10.1 Vercel Configuration
- Connect GitHub repo
- Set environment variables in Vercel dashboard
- Configure build command: `npm run build`
- Output directory: `dist`

### 10.2 Environment Variables in Vercel
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

### 10.3 Post-Deploy Verification
- Test login on production URL
- Add test transaction
- Verify data persists

---

## File Structure (Final)

```
src/
├── components/          # Existing UI components
├── contexts/
│   ├── AuthContext.tsx
│   └── DataContext.tsx
├── lib/
│   ├── supabase.ts
│   └── api/
│       ├── transactions.ts
│       ├── bills.ts
│       └── reports.ts
├── pages/               # Existing pages (modified)
├── types/
│   ├── index.ts         # Existing types
│   └── supabase.ts      # Database types
├── hooks/               # Custom hooks
└── App.tsx              # Modified for auth
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Supabase schema mismatch | Verify tables before migration |
| Auth session issues | Test thoroughly, fallback to localStorage |
| Data loss during transition | Keep v3 running until v4 validated |
| Performance with large datasets | Add pagination, lazy loading |

---

## Success Criteria

- [ ] Jim can log in with password
- [ ] All CRUD operations work on real data
- [ ] Data persists across sessions
- [ ] App deploys to Vercel successfully
- [ ] Mobile responsive (already done in frontend)
- [ ] No mock data remains in production

---

*Plan created: 2026-02-22*
*Ready for implementation when Nick gives go-ahead*
