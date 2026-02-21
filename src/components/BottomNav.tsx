import { LayoutDashboard, PlusCircle, Receipt, CalendarClock, BarChart3 } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'add', label: 'Add', icon: PlusCircle },
  { id: 'transactions', label: 'History', icon: Receipt },
  { id: 'bills', label: 'Bills', icon: CalendarClock },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
];

export function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-ledger-surface/95 backdrop-blur-md border-t border-ledger-border safe-area-pb">
      {/* Gold glow for active item */}
      <div 
        className="absolute top-0 left-0 right-0 h-px opacity-50"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(201, 162, 39, 0.3) 50%, transparent 100%)',
        }}
      />
      
      <div className="flex items-center justify-around py-2 px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`
                flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'text-gold' 
                  : 'text-ledger-text-secondary hover:text-ledger-text'
                }
              `}
            >
              <div className="relative">
                <Icon 
                  className={`w-5 h-5 transition-all duration-200 ${isActive ? 'stroke-[2px]' : 'stroke-[1.5px]'}`} 
                />
                {isActive && (
                  <div 
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold"
                    style={{ boxShadow: '0 0 8px rgba(201, 162, 39, 0.6)' }}
                  />
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-gold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
