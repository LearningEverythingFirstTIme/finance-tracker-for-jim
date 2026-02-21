import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onAddClick: () => void;
}

export function Header({ onAddClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-finance-bg/80 backdrop-blur-md border-b border-finance-text-secondary/10">
      <div className="flex items-center justify-between h-14 px-4 md:px-6 max-w-6xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <span className="font-semibold text-sm text-finance-primary font-sans">J</span>
          </div>
          <span className="font-semibold text-sm text-finance-text tracking-tight hidden sm:inline">
            Jim's Finance
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={onAddClick}
            variant="outline"
            size="sm"
            className="border-finance-primary/50 text-finance-primary hover:bg-finance-primary/10 hover:text-finance-primary-bright text-xs"
          >
            Add Entry
          </Button>
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center bg-finance-surface border border-finance-text-secondary/10"
          >
            <User className="w-4 h-4 text-finance-text-secondary" />
          </div>
        </div>
      </div>
    </header>
  );
}
