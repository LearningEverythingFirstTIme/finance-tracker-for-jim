import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Check, AlertCircle, X } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { toast } from 'sonner';
import type { ViewState } from '@/types';

interface ImportCSVProps {
  onNavigate: (view: ViewState) => void;
}

interface ParsedRow {
  date: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
}

export function ImportCSV({ onNavigate }: ImportCSVProps) {
  const { importTransactions } = useData();
  const [isVisible, setIsVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const autoCategorize = (description: string): { category: string; type: 'income' | 'expense' } => {
    const desc = description.toLowerCase();
    
    // Income patterns
    if (desc.includes('salary') || desc.includes('payroll') || desc.includes('deposit')) {
      return { category: 'Salary', type: 'income' };
    }
    if (desc.includes('freelance') || desc.includes('consulting') || desc.includes('contract')) {
      return { category: 'Freelance', type: 'income' };
    }
    if (desc.includes('dividend') || desc.includes('interest') || desc.includes('investment')) {
      return { category: 'Investments', type: 'income' };
    }
    
    // Expense patterns
    if (desc.includes('grocery') || desc.includes('supermarket') || desc.includes('food')) {
      return { category: 'Groceries', type: 'expense' };
    }
    if (desc.includes('restaurant') || desc.includes('dining') || desc.includes('cafe')) {
      return { category: 'Dining', type: 'expense' };
    }
    if (desc.includes('gas') || desc.includes('uber') || desc.includes('lyft') || desc.includes('transit')) {
      return { category: 'Transport', type: 'expense' };
    }
    if (desc.includes('electric') || desc.includes('water') || desc.includes('utility')) {
      return { category: 'Utilities', type: 'expense' };
    }
    if (desc.includes('rent') || desc.includes('mortgage') || desc.includes('housing')) {
      return { category: 'Rent', type: 'expense' };
    }
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('entertainment') || desc.includes('movie')) {
      return { category: 'Entertainment', type: 'expense' };
    }
    if (desc.includes('doctor') || desc.includes('pharmacy') || desc.includes('health') || desc.includes('medical')) {
      return { category: 'Healthcare', type: 'expense' };
    }
    if (desc.includes('amazon') || desc.includes('shopping') || desc.includes('retail')) {
      return { category: 'Shopping', type: 'expense' };
    }
    
    return { category: 'Other', type: 'expense' };
  };

  const parseCSV = (content: string): ParsedRow[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const rows: ParsedRow[] = [];
    
    // Skip header if present
    const startIndex = lines[0].toLowerCase().includes('date') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const columns = lines[i].split(',').map(col => col.trim().replace(/^"|"$/g, ''));
      if (columns.length >= 2) {
        const date = columns[0];
        const amountStr = columns.find(col => col.match(/^-?\$?\d+\.?\d*$/)) || columns[1];
        const description = columns.find(col => col.length > 5 && !col.match(/^-?\$?\d+\.?\d*$/)) || columns[2] || 'Unknown';
        
        const amount = parseFloat(amountStr.replace(/[$,]/g, '')) || 0;
        const { category, type } = autoCategorize(description);
        
        rows.push({
          date: date.match(/^\d{4}-\d{2}-\d{2}$/) ? date : new Date().toISOString().split('T')[0],
          amount: Math.abs(amount),
          description,
          category,
          type,
        });
      }
    }
    
    return rows;
  };

  const handleFile = (file: File) => {
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }
    
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseCSV(content);
      setParsedData(parsed);
      toast.success(`Found ${parsed.length} transactions`);
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleImport = async () => {
    if (parsedData.length === 0) return;
    
    setIsImporting(true);
    
    try {
      const transactions = parsedData.map(row => ({
        date: row.date,
        amount: row.amount,
        category: row.category,
        categoryId: '', // Will be set by backend or left empty
        type: row.type,
        notes: row.description,
      }));
      
      await importTransactions(transactions);
      setIsImporting(false);
      onNavigate('transactions');
    } catch (error) {
      console.error('Import error:', error);
      setIsImporting(false);
    }
  };

  const clearFile = () => {
    setFileName('');
    setParsedData([]);
  };

  return (
    <div className="min-h-screen pb-24 pt-6 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div 
          className={`
            mb-8 transition-all duration-700 ease-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <h1 className="font-semibold text-2xl md:text-3xl text-finance-text tracking-tight mb-2">
            Import CSV
          </h1>
          <p className="text-finance-text-secondary text-sm">
            Upload your bank statement or export file
          </p>
        </div>

        {/* Upload Area */}
        <div 
          className={`
            transition-all duration-700 ease-out delay-100
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          {!fileName ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
                ${isDragging 
                  ? 'border-finance-primary bg-finance-primary/5' 
                  : 'border-finance-text-secondary/10 bg-finance-surface hover:border-finance-text-secondary/30'
                }
              `}
            >
              <div className="w-16 h-16 rounded-full bg-finance-bg flex items-center justify-center mx-auto mb-4">
                <Upload className="w-6 h-6 text-finance-primary" />
              </div>
              <p className="text-finance-text font-medium mb-2">
                Drop your CSV file here
              </p>
              <p className="text-finance-text-secondary text-sm mb-4">
                or click to browse
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
                id="csv-input"
              />
              <label htmlFor="csv-input">
                <Button
                  asChild
                  className="cursor-pointer"
                  style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
                >
                  <span>Select File</span>
                </Button>
              </label>
            </div>
          ) : (
            <Card className="bg-finance-surface border-finance-text-secondary/10 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-finance-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-finance-primary" />
                  </div>
                  <div>
                    <p className="text-finance-text font-medium">{fileName}</p>
                    <p className="text-finance-text-secondary text-sm">
                      {parsedData.length} transactions found
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearFile}
                  className="p-2 text-finance-text-secondary hover:text-finance-expense transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Preview */}
              {parsedData.length > 0 && (
                <div className="mb-6">
                  <p className="text-finance-text-secondary text-xs uppercase tracking-wider mb-3">
                    Preview
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {parsedData.slice(0, 5).map((row, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-finance-bg rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${row.type === 'income' ? 'bg-finance-income' : 'bg-finance-expense'}`} />
                          <div>
                            <p className="text-finance-text text-sm">{row.category}</p>
                            <p className="text-finance-text-secondary text-xs truncate max-w-[150px]">{row.description}</p>
                          </div>
                        </div>
                        <p className={`tabular-nums text-sm ${row.type === 'income' ? 'text-finance-income' : 'text-finance-expense'}`}>
                          {row.type === 'income' ? '+' : '-'}${row.amount.toFixed(2)}
                        </p>
                      </div>
                    ))}
                    {parsedData.length > 5 && (
                      <p className="text-finance-text-secondary text-xs text-center py-2">
                        +{parsedData.length - 5} more transactions
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Auto-categorize notice */}
              <div className="flex items-start gap-2 p-3 bg-finance-primary/5 border border-finance-primary/20 rounded-lg mb-6">
                <Check className="w-4 h-4 text-finance-primary mt-0.5 flex-shrink-0" />
                <p className="text-finance-text-secondary text-sm">
                  Transactions will be auto-categorized based on description. You can edit them later.
                </p>
              </div>

              {/* Import Button */}
              <Button
                onClick={handleImport}
                disabled={isImporting || parsedData.length === 0}
                className="w-full"
                style={{ 
                  backgroundColor: isImporting || parsedData.length === 0 ? 'rgba(59, 130, 246, 0.3)' : '#3b82f6',
                  color: '#ffffff'
                }}
              >
                {isImporting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Importing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Import {parsedData.length} Transactions
                  </span>
                )}
              </Button>
            </Card>
          )}
        </div>

        {/* Format Help */}
        <div 
          className={`
            mt-8 transition-all duration-700 ease-out delay-200
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}
        >
          <Card className="bg-finance-surface border-finance-text-secondary/10 p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-finance-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-finance-text font-medium mb-2">Expected CSV Format</p>
                <p className="text-finance-text-secondary text-sm mb-3">
                  Your CSV should include columns for date, amount, and description. 
                  Most bank exports work automatically.
                </p>
                <code className="block bg-finance-bg p-3 rounded-lg text-finance-text-secondary text-xs">
                  Date,Amount,Description<br/>
                  2026-02-20,-45.50,Grocery Store<br/>
                  2026-02-19,1200.00,Freelance Payment
                </code>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
