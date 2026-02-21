# Adding Categories Lookup Table to Jim's Finance App

## Step 1: Create/Update the Categories Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Add missing columns if they don't exist
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'MoreHorizontal';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#c9a227';

-- Update existing categories with proper data
UPDATE categories SET 
  name = CASE id
    WHEN 1 THEN 'Salary'
    WHEN 2 THEN 'Freelance'
    WHEN 3 THEN 'Investments'
    WHEN 4 THEN 'Groceries'
    WHEN 5 THEN 'Dining'
    WHEN 6 THEN 'Transport'
    WHEN 7 THEN 'Utilities'
    WHEN 8 THEN 'Rent'
    WHEN 9 THEN 'Entertainment'
    WHEN 10 THEN 'Healthcare'
    WHEN 11 THEN 'Shopping'
    WHEN 12 THEN 'Other'
    ELSE name
  END,
  icon = CASE id
    WHEN 1 THEN 'Briefcase'
    WHEN 2 THEN 'Laptop'
    WHEN 3 THEN 'TrendingUp'
    WHEN 4 THEN 'ShoppingCart'
    WHEN 5 THEN 'Utensils'
    WHEN 6 THEN 'Car'
    WHEN 7 THEN 'Zap'
    WHEN 8 THEN 'Home'
    WHEN 9 THEN 'Film'
    WHEN 10 THEN 'Heart'
    WHEN 11 THEN 'ShoppingBag'
    WHEN 12 THEN 'MoreHorizontal'
    ELSE icon
  END,
  is_income = CASE 
    WHEN id IN (1, 2, 3) THEN 1
    ELSE 0
  END,
  color = CASE id
    WHEN 1 THEN '#5a9a6e'
    WHEN 2 THEN '#5a9a6e'
    WHEN 3 THEN '#5a9a6e'
    WHEN 4 THEN '#c75b5b'
    WHEN 5 THEN '#c75b5b'
    WHEN 6 THEN '#c75b5b'
    WHEN 7 THEN '#c75b5b'
    WHEN 8 THEN '#c75b5b'
    WHEN 9 THEN '#c75b5b'
    WHEN 10 THEN '#c75b5b'
    WHEN 11 THEN '#c75b5b'
    WHEN 12 THEN '#a8b5b0'
    ELSE color
  END;

-- Insert any missing categories
INSERT INTO categories (id, name, icon, is_income, color) VALUES
  (1, 'Salary', 'Briefcase', 1, '#5a9a6e'),
  (2, 'Freelance', 'Laptop', 1, '#5a9a6e'),
  (3, 'Investments', 'TrendingUp', 1, '#5a9a6e'),
  (4, 'Groceries', 'ShoppingCart', 0, '#c75b5b'),
  (5, 'Dining', 'Utensils', 0, '#c75b5b'),
  (6, 'Transport', 'Car', 0, '#c75b5b'),
  (7, 'Utilities', 'Zap', 0, '#c75b5b'),
  (8, 'Rent', 'Home', 0, '#c75b5b'),
  (9, 'Entertainment', 'Film', 0, '#c75b5b'),
  (10, 'Healthcare', 'Heart', 0, '#c75b5b'),
  (11, 'Shopping', 'ShoppingBag', 0, '#c75b5b'),
  (12, 'Other', 'MoreHorizontal', 0, '#a8b5b0')
ON CONFLICT (id) DO NOTHING;

-- Update RLS policy to allow reads
DROP POLICY IF EXISTS "Allow all users to read categories" ON categories;
CREATE POLICY "Allow all users to read categories"
  ON categories FOR SELECT
  TO authenticated, anon
  USING (true);
```

## Step 2: Update the API to Fetch Category Names

After running the SQL, you'll need to update the code to:

1. Fetch categories from the new table
2. Join categories when fetching transactions
3. Display category names instead of IDs

The changes needed are in:
- `src/lib/api/categories.ts` (new file)
- `src/lib/api/transactions.ts` (update to join with categories)
- `src/contexts/DataContext.tsx` (load categories)
- `src/pages/Transactions.tsx` (display category names)

## Step 3: Verify Setup

After running the SQL, test with this query:

```sql
SELECT * FROM categories ORDER BY id;
```

You should see all 12 categories with names, icons, and colors.

## Notes

- Category IDs match your existing `category_id` values in transactions
- All users can read categories (no user-specific RLS needed)
- You can add more categories later by inserting new rows
- To edit a category name, just update the `categories` table
