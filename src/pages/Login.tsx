import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
    onLogin();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 70% 20%, rgba(201, 162, 39, 0.08) 0%, transparent 50%)',
        }}
      />
      
      {/* Login Card */}
      <div 
        className={`
          relative w-full max-w-md mx-4 p-8 md:p-10
          bg-ledger-surface border border-ledger-border rounded-xl
          transition-all duration-700 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
        style={{
          borderTop: '2px solid #c9a227',
          boxShadow: '0 18px 50px rgba(0, 0, 0, 0.45), 0 0 40px rgba(201, 162, 39, 0.08)',
        }}
      >
        {/* J Monogram */}
        <div className="flex justify-center mb-8">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(201, 162, 39, 0.15) 0%, rgba(201, 162, 39, 0.05) 100%)',
              border: '1px solid rgba(201, 162, 39, 0.3)',
            }}
          >
            <span className="font-serif text-2xl text-gold font-semibold">J</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl md:text-3xl text-ledger-text tracking-wider mb-2">
            JIM'S FINANCE
          </h1>
          <p className="text-ledger-text-secondary text-sm">
            Your personal ledger
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-ledger-text-secondary text-xs uppercase tracking-wider">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ledger-text-secondary" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jim@example.com"
                className="pl-10 bg-ledger-bg border-ledger-border text-ledger-text placeholder:text-ledger-text-secondary/50 focus:border-gold focus:ring-gold/20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-ledger-text-secondary text-xs uppercase tracking-wider">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ledger-text-secondary" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 bg-ledger-bg border-ledger-border text-ledger-text placeholder:text-ledger-text-secondary/50 focus:border-gold focus:ring-gold/20"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-6 bg-gold text-ledger-bg font-medium hover:bg-ledger-gold-dim transition-colors"
            style={{ backgroundColor: '#c9a227', color: '#0c1412' }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-ledger-bg/30 border-t-ledger-bg rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-ledger-text-secondary text-xs">
            Secure. Private. Yours alone.
          </p>
        </div>
      </div>
    </div>
  );
}
