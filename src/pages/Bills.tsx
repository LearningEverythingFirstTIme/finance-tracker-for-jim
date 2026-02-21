import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Zap, Wifi, Smartphone, Dumbbell, Film, Check, AlertCircle, Clock } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import { AddBillDialog, AddBillButton } from '@/components/AddBillDialog';
// Bill type is used implicitly through useData

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
};

const iconMap: Record<string, React.ElementType> = {
  'Housing': Home,
  'Utilities': Zap,
  'Internet': Wifi,
  'Phone': Smartphone,
  'Health': Dumbbell,
  'Entertainment': Film,
};

const getDaysUntil = (dueDate: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getStatusColor = (status: string, daysUntil: number) => {
  if (status === 'paid') return 'bg-finance-income/20 text-finance-income border-finance-income/30';
  if (daysUntil < 0) return 'bg-finance-expense/20 text-finance-expense border-finance-expense/30';
  if (daysUntil === 0) return 'bg-finance-primary/20 text-finance-primary border-finance-primary/30';
  return 'bg-finance-text-secondary/10 text-finance-text-secondary border-finance-text-secondary/20';
};

const getStatusText = (status: string, daysUntil: number) => {
  if (status === 'paid') return 'Paid';
  if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
  if (daysUntil === 0) return 'Due today';
  if (daysUntil === 1) return 'Due tomorrow';
  return `Due in ${daysUntil} days`;
};

const getStatusIcon = (status: string, daysUntil: number) => {
  if (status === 'paid') return Check;
  if (daysUntil < 0) return AlertCircle;
  if (daysUntil === 0) return Clock;
  return Clock;
};

export function BillsPage() {
  const { bills, toggleBillPaid, refreshBills, isLoading } = useData();
  const [isVisible, setIsVisible] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Load bills on mount
  useEffect(() => {
    refreshBills();
  }, [refreshBills]);

  const sortedBills = [...bills].sort((a, b) => {
    const daysA = getDaysUntil(a.dueDate);
    const daysB = getDaysUntil(b.dueDate);
    if (a.status === 'paid' && b.status !== 'paid') return 1;
    if (a.status !== 'paid' && b.status === 'paid') return -1;
    return daysA - daysB;
  });

  const totalDue = bills
    .filter(b => b.status !== 'paid')
    .reduce((sum, b) => sum + b.amount, 0);

  const overdueCount = bills.filter(b => {
    const days = getDaysUntil(b.dueDate);
    return days < 0 && b.status !== 'paid';
  }).length;

  const handleTogglePaid = async (id: string, currentStatus: string) => {
    setTogglingId(id);
    
    try {
      const newPaidStatus = currentStatus !== 'paid';
      await toggleBillPaid(id, newPaidStatus);
    } catch (error) {
      console.error('Error toggling bill:', error);
      toast.error('Failed to update bill status');
    } finally {
      setTogglingId(null);
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-2xl md:text-3xl text-finance-text tracking-tight mb-2">
                Recurring Bills
              </h1>
              <p className="text-finance-text-secondary text-sm">
                Track your monthly obligations
              </p>
            </div>
            <AddBillButton onClick={() => setIsAddDialogOpen(true)} />
          </div>
        </div>

        {/* Summary Cards */}
        <div 
          className={`
            grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 transition-all duration-700 ease-out delay-100
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <Card className="bg-finance-surface border-finance-text-secondary/10 p-4">
            <p className="text-finance-text-secondary text-xs uppercase tracking-wider mb-1">Total Due</p>
            <p className="font-semibold text-xl text-finance-primary tabular-nums">{formatCurrency(totalDue)}</p>
          </Card>
          <Card className="bg-finance-surface border-finance-text-secondary/10 p-4">
            <p className="text-finance-text-secondary text-xs uppercase tracking-wider mb-1">Overdue</p>
            <p className={`font-semibold text-xl tabular-nums ${overdueCount > 0 ? 'text-finance-expense' : 'text-finance-text'}`}>
              {overdueCount}
            </p>
          </Card>
          <Card className="bg-finance-surface border-finance-text-secondary/10 p-4">
            <p className="text-finance-text-secondary text-xs uppercase tracking-wider mb-1">Active Bills</p>
            <p className="font-semibold text-xl text-finance-text tabular-nums">{bills.length}</p>
          </Card>
        </div>

        {/* Bills List */}
        <div 
          className={`
            space-y-4 transition-all duration-700 ease-out delay-200
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          {isLoading ? (
            <Card className="bg-finance-surface border-finance-text-secondary/10 p-12 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-finance-text-secondary/30 border-t-finance-primary rounded-full animate-spin" />
                <span className="text-finance-text-secondary">Loading bills...</span>
              </div>
            </Card>
          ) : sortedBills.length === 0 ? (
            <Card className="bg-finance-surface border-finance-text-secondary/10 p-12 text-center">
              <p className="text-finance-text-secondary">No bills found</p>
              <p className="text-finance-text-secondary/60 text-sm mt-1">Add your first bill to start tracking</p>
            </Card>
          ) : (
            sortedBills.map((bill) => {
              const Icon = iconMap[bill.category] || Zap;
              const daysUntil = getDaysUntil(bill.dueDate);
              const statusClass = getStatusColor(bill.status, daysUntil);
              const statusText = getStatusText(bill.status, daysUntil);
              const StatusIcon = getStatusIcon(bill.status, daysUntil);
              const isPaid = bill.status === 'paid';

              return (
                <Card 
                  key={bill.id} 
                  className={`
                    bg-finance-surface border-finance-text-secondary/10 p-4 card-lift
                    ${isPaid ? 'opacity-60' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Date Circle */}
                      <div 
                        className={`
                          w-14 h-14 rounded-full flex flex-col items-center justify-center border
                          ${daysUntil < 0 && !isPaid ? 'border-finance-expense/30 bg-finance-expense/10' : ''}
                          ${daysUntil === 0 && !isPaid ? 'border-finance-primary/30 bg-finance-primary/10' : ''}
                          ${isPaid ? 'border-finance-income/30 bg-finance-income/10' : ''}
                          ${daysUntil > 0 && !isPaid ? 'border-finance-text-secondary/10 bg-finance-bg' : ''}
                        `}
                      >
                        <span className="text-xs text-finance-text-secondary uppercase">
                          {new Date(bill.dueDate).toLocaleDateString('en-US', { month: 'short' })}
                        </span>
                        <span className={`font-semibold text-lg ${
                          daysUntil < 0 && !isPaid ? 'text-finance-expense' :
                          daysUntil === 0 && !isPaid ? 'text-finance-primary' :
                          isPaid ? 'text-finance-income' : 'text-finance-text'
                        }`}>
                          {new Date(bill.dueDate).getDate()}
                        </span>
                      </div>

                      {/* Bill Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-finance-text-secondary" />
                          <p className="text-finance-text font-medium">{bill.name}</p>
                        </div>
                        <p className="text-finance-text-secondary text-sm">{bill.category}</p>
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs mt-1 ${statusClass}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusText}
                        </div>
                      </div>
                    </div>

                    {/* Amount & Action */}
                    <div className="text-right">
                      <p className={`font-semibold text-lg tabular-nums ${isPaid ? 'text-finance-income' : 'text-finance-text'}`}>
                        {formatCurrency(bill.amount)}
                      </p>
                      <p className="text-finance-text-secondary text-xs">{bill.frequency}</p>
                      <Button
                        size="sm"
                        onClick={() => handleTogglePaid(bill.id, bill.status)}
                        disabled={togglingId === bill.id}
                        className={`
                          mt-2 text-xs px-3 py-1 h-auto
                          ${isPaid 
                            ? 'bg-finance-text-secondary/20 text-finance-text-secondary hover:bg-finance-text-secondary/30' 
                            : 'bg-finance-primary/10 text-finance-primary hover:bg-finance-primary/20 border border-finance-primary/30'
                          }
                        `}
                        style={isPaid ? {} : { backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                      >
                        {togglingId === bill.id ? (
                          <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          isPaid ? 'Mark Unpaid' : 'Mark Paid'
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      <AddBillDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  );
}
