import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { monthlyData, getIncomeTotal, getExpenseTotal, getBalance } from '@/data/mockData';
import type { Transaction } from '@/types';

interface ReportsProps {
  transactions: Transaction[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatCurrencyFull = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export function ReportsPage({ transactions }: ReportsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [period, setPeriod] = useState<'month' | 'year'>('month');

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const income = getIncomeTotal();
  const expense = getExpenseTotal();
  const balance = getBalance();

  const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

  const largestExpense = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)[0];
  }, [transactions]);

  const topCategory = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    return sorted[0] || ['None', 0];
  }, [transactions]);

  const handleExport = () => {
    const csvContent = [
      ['Date', 'Category', 'Type', 'Amount', 'Notes'].join(','),
      ...transactions.map(t => [
        t.date,
        t.category,
        t.type,
        t.amount,
        `"${t.notes}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div 
          className={`
            flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8
            transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <div>
            <h1 className="font-serif text-2xl md:text-3xl text-ledger-text tracking-wider mb-1">
              REPORTS
            </h1>
            <p className="text-ledger-text-secondary text-sm">
              Insights into your financial health
            </p>
          </div>
          <Button
            onClick={handleExport}
            className="flex items-center gap-2 bg-ledger-surface border border-ledger-border text-ledger-text hover:border-gold/50 hover:text-gold transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div 
          className={`
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8
            transition-all duration-700 ease-out delay-100
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <Card className="bg-ledger-surface border-ledger-border p-5" style={{ borderTop: '2px solid #5a9a6e' }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-ledger-income" />
              <span className="text-ledger-text-secondary text-xs uppercase tracking-wider">Income</span>
            </div>
            <p className="font-serif text-xl text-ledger-income tabular-nums">{formatCurrencyFull(income)}</p>
          </Card>

          <Card className="bg-ledger-surface border-ledger-border p-5" style={{ borderTop: '2px solid #c75b5b' }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-ledger-expense" />
              <span className="text-ledger-text-secondary text-xs uppercase tracking-wider">Expenses</span>
            </div>
            <p className="font-serif text-xl text-ledger-expense tabular-nums">{formatCurrencyFull(expense)}</p>
          </Card>

          <Card className="bg-ledger-surface border-ledger-border p-5" style={{ borderTop: '2px solid #c9a227' }}>
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-gold" />
              <span className="text-ledger-text-secondary text-xs uppercase tracking-wider">Net</span>
            </div>
            <p className="font-serif text-xl text-gold tabular-nums">{formatCurrencyFull(balance)}</p>
          </Card>

          <Card className="bg-ledger-surface border-ledger-border p-5" style={{ borderTop: '2px solid #a8b5b0' }}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-ledger-text-secondary" />
              <span className="text-ledger-text-secondary text-xs uppercase tracking-wider">Savings Rate</span>
            </div>
            <p className={`font-serif text-xl tabular-nums ${savingsRate >= 20 ? 'text-ledger-income' : savingsRate >= 10 ? 'text-gold' : 'text-ledger-text'}`}>
              {savingsRate.toFixed(1)}%
            </p>
          </Card>
        </div>

        {/* Balance Over Time Chart */}
        <div 
          className={`
            mb-8 transition-all duration-700 ease-out delay-200
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <Card className="bg-ledger-surface border-ledger-border p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-sm text-ledger-text tracking-wider">
                BALANCE OVER TIME
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriod('month')}
                  className={`
                    px-3 py-1 rounded text-xs transition-colors
                    ${period === 'month' ? 'bg-gold/20 text-gold' : 'text-ledger-text-secondary hover:text-ledger-text'}
                  `}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setPeriod('year')}
                  className={`
                    px-3 py-1 rounded text-xs transition-colors
                    ${period === 'year' ? 'bg-gold/20 text-gold' : 'text-ledger-text-secondary hover:text-ledger-text'}
                  `}
                >
                  Yearly
                </button>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c9a227" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#c9a227" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#a8b5b0', fontSize: 11 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#a8b5b0', fontSize: 11 }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141f1c',
                      border: '1px solid rgba(245, 243, 239, 0.08)',
                      borderRadius: '8px',
                      color: '#f5f3ef',
                    }}
                    formatter={(value: number) => formatCurrencyFull(value)}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#c9a227" 
                    strokeWidth={2}
                    fill="url(#balanceGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Insights Grid */}
        <div 
          className={`
            grid grid-cols-1 md:grid-cols-2 gap-6
            transition-all duration-700 ease-out delay-300
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          {/* Top Insights */}
          <Card className="bg-ledger-surface border-ledger-border p-5">
            <h3 className="font-serif text-sm text-ledger-text tracking-wider mb-4">
              KEY INSIGHTS
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-gold mt-2 flex-shrink-0" />
                <div>
                  <p className="text-ledger-text text-sm">
                    <span className="font-medium">{topCategory[0]}</span> is your largest spending category at{' '}
                    <span className="text-gold">{formatCurrencyFull(topCategory[1] as number)}</span>
                  </p>
                </div>
              </div>
              {largestExpense && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-ledger-expense mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-ledger-text text-sm">
                      Largest single expense: <span className="font-medium">{largestExpense.category}</span> at{' '}
                      <span className="text-ledger-expense">{formatCurrencyFull(largestExpense.amount)}</span>
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-ledger-income mt-2 flex-shrink-0" />
                <div>
                  <p className="text-ledger-text text-sm">
                    Your savings rate is{' '}
                    <span className={savingsRate >= 20 ? 'text-ledger-income' : savingsRate >= 10 ? 'text-gold' : 'text-ledger-text-secondary'}>
                      {savingsRate.toFixed(1)}%
                    </span>
                    {savingsRate >= 20 ? ' — Excellent!' : savingsRate >= 10 ? ' — Good progress' : ' — Room for improvement'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Monthly Comparison */}
          <Card className="bg-ledger-surface border-ledger-border p-5">
            <h3 className="font-serif text-sm text-ledger-text tracking-wider mb-4">
              MONTHLY COMPARISON
            </h3>
            <div className="space-y-3">
              {monthlyData.slice(-3).map((month) => (
                <div key={month.month} className="flex items-center justify-between">
                  <span className="text-ledger-text-secondary text-sm">{month.month}</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-ledger-bg rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-ledger-income rounded-full"
                          style={{ width: `${(month.income / 7000) * 100}%` }}
                        />
                      </div>
                      <span className="text-ledger-income text-xs tabular-nums w-14 text-right">
                        {formatCurrency(month.income)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-ledger-bg rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-ledger-expense rounded-full"
                          style={{ width: `${(month.expense / 7000) * 100}%` }}
                        />
                      </div>
                      <span className="text-ledger-expense text-xs tabular-nums w-14 text-right">
                        {formatCurrency(month.expense)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-end gap-6 mt-4 pt-3 border-t border-ledger-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-ledger-income" />
                <span className="text-ledger-text-secondary text-xs">Income</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-ledger-expense" />
                <span className="text-ledger-text-secondary text-xs">Expense</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
