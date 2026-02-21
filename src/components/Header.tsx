import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onAddClick: () => void;
}

export function Header({ onAddClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-ledger-bg/80 backdrop-blur-md border-b border-ledger-border">
      <div className="flex items-center justify-between h-14 px-4 md:px-6 max-w-6xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.15) 0%, rgba(201, 162, 39, 0.05) 100%)',
              border: '1px solid rgba(201, 162, 39, 0.3)',
            }}
          >
            <span className="font-serif text-sm text-gold font-semibold">J</span>
          </div>
          <span className="font-serif text-sm text-ledger-text tracking-wider hidden sm:inline">
            JIM'S FINANCE
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={onAddClick}
            variant="outline"
            size="sm"
            className="border-gold/50 text-gold hover:bg-gold/10 hover:text-gold text-xs"
          >
            Add Entry
          </Button>
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center bg-ledger-surface border border-ledger-border"
          >
            <User className="w-4 h-4 text-ledger-text-secondary" />
          </div>
        </div>
      </div>
    </header>
  );
}
