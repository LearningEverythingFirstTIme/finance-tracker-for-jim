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
import { transactions, monthlyData, categoryBreakdown, getIncomeTotal, getExpenseTotal, getBalance } from '@/data/mockData';

interface DashboardProps {
  onNavigate: (view: string) => void;
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

export function Dashboard({ onNavigate }: DashboardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [displayBalance, setDisplayBalance] = useState(0);
  const [displayIncome, setDisplayIncome] = useState(0);
  const [displayExpense, setDisplayExpense] = useState(0);
  const balanceRef = useRef(getBalance());
  const incomeRef = useRef(getIncomeTotal());
  const expenseRef = useRef(getExpenseTotal());

  useEffect(() => {
    setIsVisible(true);
    
    // Animate numbers
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
  }, []);

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

  return (
    <div className="min-h-screen pb-24">
      {/* Header with Balance */}
      <div 
        className={`
          relative pt-8 pb-6 px-4 md:px-6 transition-all duration-700 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        {/* Gold gradient border */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(201, 162, 39, 0.5) 50%, transparent 100%)',
          }}
        />
        
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-ledger-text-secondary text-xs uppercase tracking-wider mb-1">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="font-serif text-xl md:text-2xl text-ledger-text tracking-wider">
                FINANCIAL OVERVIEW
              </h1>
            </div>
            <div className="text-left md:text-right">
              <p className="text-ledger-text-secondary text-xs uppercase tracking-wider mb-1">
                Net Balance
              </p>
              <p className="font-serif text-3xl md:text-4xl text-gold tabular-nums">
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
            className="bg-ledger-surface border-ledger-border p-5 card-lift relative overflow-hidden"
            style={{ borderTop: '2px solid #5a9a6e' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-ledger-income/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-ledger-income" />
                </div>
                <span className="text-ledger-text-secondary text-sm">Income</span>
              </div>
              <span className="text-ledger-income text-xs flex items-center gap-1">
                +8% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="font-serif text-2xl text-ledger-income tabular-nums">
              {formatCurrency(displayIncome)}
            </p>
            <p className="text-ledger-text-secondary text-xs mt-1">vs last month</p>
          </Card>

          {/* Expense Card */}
          <Card 
            className="bg-ledger-surface border-ledger-border p-5 card-lift relative overflow-hidden"
            style={{ borderTop: '2px solid #c75b5b' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-ledger-expense/10 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-ledger-expense" />
                </div>
                <span className="text-ledger-text-secondary text-sm">Expenses</span>
              </div>
              <span className="text-ledger-income text-xs flex items-center gap-1">
                -3% <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
            <p className="font-serif text-2xl text-ledger-expense tabular-nums">
              {formatCurrency(displayExpense)}
            </p>
            <p className="text-ledger-text-secondary text-xs mt-1">vs last month</p>
          </Card>

          {/* Balance Card */}
          <Card 
            className="bg-ledger-surface border-ledger-border p-5 card-lift relative overflow-hidden"
            style={{ borderTop: '2px solid #c9a227' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-gold" />
                </div>
                <span className="text-ledger-text-secondary text-sm">Balance</span>
              </div>
              <span className="text-gold text-xs">On track</span>
            </div>
            <p className="font-serif text-2xl text-gold tabular-nums">
              {formatCurrency(displayBalance)}
            </p>
            <p className="text-ledger-text-secondary text-xs mt-1">net position</p>
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
          <Card className="bg-ledger-surface border-ledger-border p-5">
            <h3 className="font-serif text-sm text-ledger-text tracking-wider mb-4">
              SPENDING BY CATEGORY
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141f1c',
                      border: '1px solid rgba(245, 243, 239, 0.08)',
                      borderRadius: '8px',
                      color: '#f5f3ef',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {categoryBreakdown.slice(0, 4).map((cat) => (
                <div key={cat.name} className="flex items-center gap-1.5">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-ledger-text-secondary text-xs">{cat.name}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Monthly Trend */}
          <Card className="bg-ledger-surface border-ledger-border p-5">
            <h3 className="font-serif text-sm text-ledger-text tracking-wider mb-4">
              MONTHLY TREND
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#a8b5b0', fontSize: 11 }}
                  />
                  <YAxis 
                    hide
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#141f1c',
                      border: '1px solid rgba(245, 243, 239, 0.08)',
                      borderRadius: '8px',
                      color: '#f5f3ef',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="income" fill="#5a9a6e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#c75b5b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-4 justify-center">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-ledger-income" />
                <span className="text-ledger-text-secondary text-xs">Income</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-ledger-expense" />
                <span className="text-ledger-text-secondary text-xs">Expense</span>
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
            <h3 className="font-serif text-sm text-ledger-text tracking-wider">
              RECENT TRANSACTIONS
            </h3>
            <button 
              onClick={() => onNavigate('transactions')}
              className="text-gold text-xs hover:underline"
            >
              View All
            </button>
          </div>
          
          <Card className="bg-ledger-surface border-ledger-border overflow-hidden">
            {recentTransactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className={`
                  flex items-center justify-between p-4 transaction-item cursor-pointer
                  ${index !== recentTransactions.length - 1 ? 'border-b border-ledger-border' : ''}
                `}
                onClick={() => onNavigate('transactions')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ledger-bg flex items-center justify-center text-lg">
                    {getCategoryIcon(transaction.category)}
                  </div>
                  <div>
                    <p className="text-ledger-text text-sm font-medium">{transaction.category}</p>
                    <p className="text-ledger-text-secondary text-xs">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <p className={`tabular-nums font-medium ${
                  transaction.type === 'income' ? 'text-ledger-income' : 'text-ledger-expense'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
