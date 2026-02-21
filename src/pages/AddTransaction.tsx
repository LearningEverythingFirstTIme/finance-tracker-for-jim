import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Briefcase, Laptop, TrendingUp, ShoppingCart, Utensils, Car, Zap, Home, Film, Heart, ShoppingBag, MoreHorizontal, Upload } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { categories } from '@/data/mockData';
import type { ViewState } from '@/types';

interface AddTransactionProps {
  onNavigate: (view: ViewState) => void;
}

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

export function AddTransaction({ onNavigate }: AddTransactionProps) {
  const { addTransaction, isLoading } = useData();
  const [isVisible, setIsVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const filteredCategories = categories.filter(c => c.isIncome === (type === 'income'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    setIsSubmitting(true);
    
    try {
      const selectedCategory = categories.find(c => c.id === category);
      
      await addTransaction({
        date: format(date, 'yyyy-MM-dd'),
        amount: parseFloat(amount),
        category: selectedCategory?.name || '',
        categoryId: category,
        type,
        notes,
      });

      // Reset form
      setAmount('');
      setCategory('');
      setNotes('');
      setDate(new Date());
      
      onNavigate('dashboard');
    } catch (error) {
      console.error('Error adding transaction:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value.split('.').length <= 2) {
      setAmount(value);
    }
  };

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 md:px-6">
      {/* Background glow */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.04) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-2xl mx-auto relative">
        {/* Header */}
        <div 
          className={`
            mb-8 transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <h1 className="font-semibold text-2xl md:text-3xl text-finance-text tracking-tight mb-2">
            Log a Transaction
          </h1>
          <p className="text-finance-text-secondary text-sm">
            Capture income or spending in seconds. Clear notes make reports meaningful.
          </p>
        </div>

        {/* Form Card */}
        <Card 
          className={`
            bg-finance-surface border-finance-text-secondary/10 p-6 md:p-8 transition-all duration-700 ease-out delay-100
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <Label className="text-finance-text-secondary text-xs uppercase tracking-wider">
                Amount
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-finance-primary text-2xl font-semibold">$</span>
                <Input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="0.00"
                  className="pl-10 py-6 text-3xl font-semibold bg-finance-bg border-finance-text-secondary/10 text-finance-text placeholder:text-finance-text-secondary/30 focus:border-finance-primary focus:ring-finance-primary/20 tabular-nums"
                  required
                />
              </div>
            </div>

            {/* Type Toggle */}
            <div className="space-y-2">
              <Label className="text-finance-text-secondary text-xs uppercase tracking-wider">
                Type
              </Label>
              <div className="flex gap-2 p-1 bg-finance-bg rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setType('expense');
                    setCategory('');
                  }}
                  className={`
                    flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200
                    ${type === 'expense' 
                      ? 'bg-finance-expense/20 text-finance-expense' 
                      : 'text-finance-text-secondary hover:text-finance-text'
                    }
                  `}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('income');
                    setCategory('');
                  }}
                  className={`
                    flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200
                    ${type === 'income' 
                      ? 'bg-finance-income/20 text-finance-income' 
                      : 'text-finance-text-secondary hover:text-finance-text'
                    }
                  `}
                >
                  Income
                </button>
              </div>
            </div>

            {/* Category Chips */}
            <div className="space-y-2">
              <Label className="text-finance-text-secondary text-xs uppercase tracking-wider">
                Category
              </Label>
              <div className="flex flex-wrap gap-2">
                {filteredCategories.map((cat) => {
                  const Icon = iconMap[cat.icon] || MoreHorizontal;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-all duration-200
                        ${category === cat.id
                          ? 'border-finance-primary bg-finance-primary/10 text-finance-primary'
                          : 'border-finance-text-secondary/10 bg-finance-bg text-finance-text-secondary hover:border-finance-text-secondary/30 hover:text-finance-text'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label className="text-finance-text-secondary text-xs uppercase tracking-wider">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 bg-finance-bg border border-finance-text-secondary/10 rounded-md text-finance-text hover:border-finance-text-secondary/30 transition-colors"
                  >
                    <span>{format(date, 'MMMM d, yyyy')}</span>
                    <CalendarIcon className="w-4 h-4 text-finance-text-secondary" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-finance-surface border-finance-text-secondary/10" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                    className="bg-finance-surface"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-finance-text-secondary text-xs uppercase tracking-wider">
                Note
              </Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                className="w-full px-4 py-3 bg-finance-bg border border-finance-text-secondary/10 rounded-md text-finance-text placeholder:text-finance-text-secondary/30 focus:border-finance-primary focus:ring-1 focus:ring-finance-primary/20 focus:outline-none resize-none transition-colors"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!amount || !category || isSubmitting || isLoading}
              className="w-full py-6 font-medium transition-all duration-200 disabled:opacity-50"
              style={{ 
                backgroundColor: !amount || !category ? 'rgba(59, 130, 246, 0.3)' : '#3b82f6',
                color: '#ffffff'
              }}
            >
              {isSubmitting || isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                'Save Entry'
              )}
            </Button>

            {/* Import CSV Link */}
            <button
              type="button"
              onClick={() => onNavigate('import')}
              className="w-full flex items-center justify-center gap-2 text-finance-text-secondary text-sm hover:text-finance-primary transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
