import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface AddBillDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORIES = [
  'Housing',
  'Utilities',
  'Internet',
  'Phone',
  'Health',
  'Entertainment',
  'Insurance',
  'Other',
];

const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export function AddBillDialog({ open, onOpenChange }: AddBillDialogProps) {
  const { addBill } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    dueDate: '',
    category: '',
    frequency: 'monthly',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.amount || !formData.dueDate || !formData.category) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addBill({
        name: formData.name,
        amount: parseFloat(formData.amount),
        dueDate: formData.dueDate,
        category: formData.category,
        isRecurring: true,
        frequency: formData.frequency as 'weekly' | 'monthly' | 'yearly',
        status: 'pending',
      });
      
      toast.success('Bill added successfully');
      onOpenChange(false);
      setFormData({
        name: '',
        amount: '',
        dueDate: '',
        category: '',
        frequency: 'monthly',
      });
    } catch (error) {
      console.error('Error adding bill:', error);
      toast.error('Failed to add bill');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-ledger-surface border-ledger-border text-ledger-text max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl tracking-wider">ADD RECURRING BILL</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-ledger-text-secondary">Bill Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Rent, Electric, Netflix"
              className="bg-ledger-bg border-ledger-border text-ledger-text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-ledger-text-secondary">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="bg-ledger-bg border-ledger-border text-ledger-text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-ledger-text-secondary">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="bg-ledger-bg border-ledger-border text-ledger-text"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-ledger-text-secondary">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="bg-ledger-bg border-ledger-border text-ledger-text">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-ledger-surface border-ledger-border">
                {CATEGORIES.map((cat) => (
                  <SelectItem 
                    key={cat} 
                    value={cat}
                    className="text-ledger-text focus:bg-ledger-bg focus:text-ledger-text"
                  >
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-ledger-text-secondary">Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData({ ...formData, frequency: value })}
            >
              <SelectTrigger className="bg-ledger-bg border-ledger-border text-ledger-text">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent className="bg-ledger-surface border-ledger-border">
                {FREQUENCIES.map((freq) => (
                  <SelectItem 
                    key={freq.value} 
                    value={freq.value}
                    className="text-ledger-text focus:bg-ledger-bg focus:text-ledger-text"
                  >
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-ledger-border text-ledger-text hover:bg-ledger-bg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gold/10 text-gold hover:bg-gold/20 border border-gold/30"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                'Add Bill'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddBillButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="bg-gold/10 text-gold hover:bg-gold/20 border border-gold/30"
    >
      <Plus className="w-4 h-4 mr-2" />
      Add Bill
    </Button>
  );
}
