import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Trash2, Briefcase, Laptop, TrendingUp, ShoppingCart, Utensils, Car, Zap, Home, Film, Heart, ShoppingBag, MoreHorizontal } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import type { Transaction } from '@/types';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const iconMap: Record<string, React.ElementType> = {
  Briefcase,
  Laptop,
  TrendingUp,
  ShoppingCart,
  Utensils,
  Car,
  Zap,
  Home,
  Film,
  Heart,
  ShoppingBag,
  MoreHorizontal,
};

const getCategoryIcon = (categoryName: string) => {
  const icons: Record<string, string> = {
    'Salary': 'Briefcase',
    'Freelance': 'Laptop',
    'Investments': 'TrendingUp',
    'Groceries': 'ShoppingCart',
    'Dining': 'Utensils',
    'Transport': 'Car',
    'Utilities': 'Zap',
    'Rent': 'Home',
    'Entertainment': 'Film',
    'Healthcare': 'Heart',
    'Shopping': 'ShoppingBag',
    'Other': 'MoreHorizontal',
  };
  return icons[categoryName] || 'MoreHorizontal';
};

const groupByDate = (transactions: Transaction[]) => {
  const grouped: Record<string, Transaction[]> = {};
  transactions.forEach(t => {
    if (!grouped[t.date]) {
      grouped[t.date] = [];
    }
    grouped[t.date].push(t);
  });
  return Object.entries(grouped).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
};

export function TransactionsPage() {
  const { transactions, deleteTransaction, refreshTransactions, isLoading } = useData();
  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Load transactions on mount
  useEffect(() => {
    refreshTransactions();
  }, [refreshTransactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.notes.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filter === 'all' || t.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [transactions, searchQuery, filter]);

  const groupedTransactions = groupByDate(filteredTransactions);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    
    try {
      await deleteTransaction(id);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div 
          className={`
            mb-6 transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <h1 className="font-serif text-2xl md:text-3xl text-ledger-text tracking-wider mb-2">
            TRANSACTIONS
          </h1>
          <p className="text-ledger-text-secondary text-sm">
            {isLoading ? 'Loading...' : `${filteredTransactions.length} entries found`}
          </p>
        </div>

        {/* Filter Bar */}
        <div 
          className={`
            mb-6 space-y-4 transition-all duration-700 ease-out delay-100
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ledger-text-secondary" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="pl-10 bg-ledger-surface border-ledger-border text-ledger-text placeholder:text-ledger-text-secondary/50 focus:border-gold focus:ring-gold/20"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {(['all', 'income', 'expense'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200
                    ${filter === f
                      ? 'bg-gold/10 text-gold border border-gold/30'
                      : 'bg-ledger-surface border border-ledger-border text-ledger-text-secondary hover:text-ledger-text'
                    }
                  `}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div 
          className={`
            space-y-6 transition-all duration-700 ease-out delay-200
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          {isLoading ? (
            <Card className="bg-ledger-surface border-ledger-border p-12 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-ledger-text-secondary/30 border-t-gold rounded-full animate-spin" />
                <span className="text-ledger-text-secondary">Loading transactions...</span>
              </div>
            </Card>
          ) : groupedTransactions.length === 0 ? (
            <Card className="bg-ledger-surface border-ledger-border p-12 text-center">
              <p className="text-ledger-text-secondary">No transactions found</p>
              <p className="text-ledger-text-secondary/60 text-sm mt-1">Try adjusting your search or filters</p>
            </Card>
          ) : (
            groupedTransactions.map(([date, dayTransactions]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="sticky top-0 z-10 bg-ledger-bg/95 backdrop-blur-sm py-2 mb-2">
                  <h3 className="font-serif text-xs text-ledger-text-secondary uppercase tracking-wider">
                    {formatDate(date)}
                  </h3>
                </div>

                {/* Transactions for this date */}
                <Card className="bg-ledger-surface border-ledger-border overflow-hidden divide-y divide-ledger-border">
                  {dayTransactions.map((transaction) => {
                    const Icon = iconMap[getCategoryIcon(transaction.category)] || MoreHorizontal;
                    return (
                      <div
                        key={transaction.id}
                        className={`
                          flex items-center justify-between p-4 transition-all duration-300
                          ${deletingId === transaction.id ? 'opacity-0 translate-x-full' : 'opacity-100'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-ledger-bg flex items-center justify-center">
                            <Icon className="w-4 h-4 text-ledger-text-secondary" />
                          </div>
                          <div>
                            <p className="text-ledger-text text-sm font-medium">{transaction.category}</p>
                            {transaction.notes && (
                              <p className="text-ledger-text-secondary text-xs">{transaction.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className={`tabular-nums font-medium ${
                            transaction.type === 'income' ? 'text-ledger-income' : 'text-ledger-expense'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            disabled={deletingId === transaction.id}
                            className="p-2 text-ledger-text-secondary hover:text-ledger-expense transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </Card>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
