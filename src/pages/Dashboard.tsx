import { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { useData } from '@/contexts/DataContext';
import type { ViewState } from '@/types';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

// Updated chart colors for blue theme
const COLORS = ['#3b82f6', '#10b981', '#60a5fa', '#8b5cf6', '#ef4444', '#94a3b8'];

export function Dashboard({ onNavigate }: DashboardProps) {
  const { 
    transactions, 
    dashboardSummary, 
    categoryBreakdown, 
    monthlyData, 
    refreshDashboard,
    refreshTransactions 
  } = useData();
  
  const [isVisible, setIsVisible] = useState(false);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [displayIncome, setDisplayIncome] = useState(0);
  const [displayExpense, setDisplayExpense] = useState(0);
  
  const balanceRef = useRef(0);
  const incomeRef = useRef(0);
  const expenseRef = useRef(0);

  // Update refs when data changes
  useEffect(() => {
    if (dashboardSummary) {
      balanceRef.current = dashboardSummary.balance;
      incomeRef.current = dashboardSummary.income;
      expenseRef.current = dashboardSummary.expense;
    }
  }, [dashboardSummary]);

  // Load data on mount
  useEffect(() => {
    setIsVisible(true);
    refreshDashboard();
    refreshTransactions();
  }, [refreshDashboard, refreshTransactions]);

  // Animate numbers when data is available
  useEffect(() => {
    if (!dashboardSummary) return;
    
    const duration = 1000;
    const steps = 30;
    const interval = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setDisplayBalance(balanceRef.current * easeOut);
      setDisplayIncome(incomeRef.current * easeOut);
      setDisplayExpense(expenseRef.current * easeOut);
      
      if (step >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, [dashboardSummary]);

  const recentTransactions = transactions.slice(0, 5);

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Salary': '💼',
      'Freelance': '💻',
      'Investments': '📈',
      'Groceries': '🛒',
      'Dining': '🍽️',
      'Transport': '🚗',
      'Utilities': '⚡',
      'Rent': '🏠',
      'Entertainment': '🎬',
      'Healthcare': '❤️',
      'Shopping': '🛍️',
      'Other': '•••',
    };
    return icons[category] || '•';
  };

  // Prepare chart data with colors
  const chartData = categoryBreakdown.map((cat, index) => ({
    ...cat,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="min-h-screen pb-24">
      {/* Header with Balance */}
      <div 
        className={`
          relative pt-8 pb-6 px-4 md:px-6 transition-all duration-700 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        {/* Blue gradient border */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.5) 50%, transparent 100%)',
          }}
        />
        
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-finance-text-secondary text-xs uppercase tracking-wider mb-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="font-semibold text-xl md:text-2xl text-finance-text tracking-tight">
                Financial Overview
              </h1>
            </div>
            <div className="text-left md:text-right">
              <p className="text-finance-text-secondary text-xs uppercase tracking-wider mb-1">
                Net Balance
              </p>
              <p className="font-semibold text-3xl md:text-4xl text-finance-primary tabular-nums">
                {formatCurrency(displayBalance)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div 
        className={`
          px-4 md:px-6 py-6 transition-all duration-700 ease-out delay-100
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Income Card */}
          <Card 
            className="bg-finance-surface border-finance-text-secondary/10 p-5 card-lift relative overflow-hidden"
            style={{ borderTop: '2px solid #10b981' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-finance-income/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-finance-income" />
                </div>
                <span className="text-finance-text-secondary text-sm">Income</span>
              </div>
              <span className="text-finance-income text-xs flex items-center gap-1">
                +8% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="font-semibold text-2xl text-finance-income tabular-nums">
              {formatCurrency(displayIncome)}
            </p>
            <p className="text-finance-text-secondary text-xs mt-1">this month</p>
          </Card>

          {/* Expense Card */}
          <Card 
            className="bg-finance-surface border-finance-text-secondary/10 p-5 card-lift relative overflow-hidden"
            style={{ borderTop: '2px solid #ef4444' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-finance-expense/10 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-finance-expense" />
                </div>
                <span className="text-finance-text-secondary text-sm">Expenses</span>
              </div>
              <span className="text-finance-income text-xs flex items-center gap-1">
                -3% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="font-semibold text-2xl text-finance-expense tabular-nums">
              {formatCurrency(displayExpense)}
            </p>
            <p className="text-finance-text-secondary text-xs mt-1">this month</p>
          </Card>

          {/* Balance Card */}
          <Card 
            className="bg-finance-surface border-finance-text-secondary/10 p-5 card-lift relative overflow-hidden"
            style={{ borderTop: '2px solid #3b82f6' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-finance-primary/10 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-finance-primary" />
                </div>
                <span className="text-finance-text-secondary text-sm">Balance</span>
              </div>
              <span className="text-finance-primary text-xs">On track</span>
            </div>
            <p className="font-semibold text-2xl text-finance-primary tabular-nums">
              {formatCurrency(displayBalance)}
            </p>
            <p className="text-finance-text-secondary text-xs mt-1">net position</p>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      <div 
        className={`
          px-4 md:px-6 py-6 transition-all duration-700 ease-out delay-200
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Breakdown */}
          <Card className="bg-finance-surface border-finance-text-secondary/10 p-5">
            <h3 className="font-semibold text-sm text-finance-text tracking-tight mb-4">
              Spending by Category
            </h3>
            <div className="h-64">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid rgba(148, 163, 184, 0.12)',
                        borderRadius: '8px',
                        color: '#f1f5f9',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-finance-text-secondary">
                  No expense data yet
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {chartData.slice(0, 4).map((cat) => (
                <div key={cat.name} className="flex items-center gap-1.5">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-finance-text-secondary text-xs">{cat.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Monthly Trend */}
          <Card className="bg-finance-surface border-finance-text-secondary/10 p-5">
            <h3 className="font-semibold text-sm text-finance-text tracking-tight mb-4">
              Monthly Trend
            </h3>
            <div className="h-64">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <YAxis 
                      hide
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#111827',
                        border: '1px solid rgba(148, 163, 184, 0.12)',
                        borderRadius: '8px',
                        color: '#f1f5f9',
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-finance-text-secondary">
                  No monthly data yet
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-4 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-finance-income" />
                <span className="text-finance-text-secondary text-xs">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-finance-expense" />
                <span className="text-finance-text-secondary text-xs">Expense</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <div 
        className={`
          px-4 md:px-6 py-6 transition-all duration-700 ease-out delay-300
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-finance-text tracking-tight">
              Recent Transactions
            </h3>
            <button 
              onClick={() => onNavigate('transactions')}
              className="text-finance-primary text-xs hover:text-finance-primary-bright transition-colors"
            >
              View All
            </button>
          </div>
          
          <Card className="bg-finance-surface border-finance-text-secondary/10 overflow-hidden">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction, index) => (
                <div
                  key={transaction.id}
                  className={`
                    flex items-center justify-between p-4 transaction-item cursor-pointer
                    ${index !== recentTransactions.length - 1 ? 'border-b border-finance-text-secondary/10' : ''}
                  `}
                  onClick={() => onNavigate('transactions')}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-finance-bg flex items-center justify-center text-lg">
                      {getCategoryIcon(transaction.category)}
                    </div>
                    <div>
                      <p className="text-finance-text text-sm font-medium">{transaction.category}</p>
                      <p className="text-finance-text-secondary text-xs">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <p className={`tabular-nums font-medium ${
                    transaction.type === 'income' ? 'text-finance-income' : 'text-finance-expense'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-finance-text-secondary">
                No transactions yet. <button onClick={() => onNavigate('add')} className="text-finance-primary hover:text-finance-primary-bright transition-colors">Add one now</button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
