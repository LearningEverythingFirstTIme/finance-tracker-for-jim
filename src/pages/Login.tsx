import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function Login() {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;

    setIsLoading(true);
    
    try {
      const { error } = await login(password);
      
      if (error) {
        toast.error('Invalid password. Please try again.');
      } else {
        toast.success('Welcome back, Jim!');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 70% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 50%)',
        }}
      />
      
      {/* Login Card */}
      <div 
        className={`
          relative w-full max-w-md mx-4 p-8 md:p-10
          bg-finance-surface border border-finance-text-secondary/10 rounded-xl
          transition-all duration-700 ease-out
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
        style={{
          borderTop: '2px solid #3b82f6',
          boxShadow: '0 18px 50px rgba(0, 0, 0, 0.45), 0 0 40px rgba(59, 130, 246, 0.08)',
        }}
      >
        {/* J Monogram */}
        <div className="flex justify-center mb-8">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            <span className="font-semibold text-2xl text-finance-primary font-sans">J</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-semibold text-2xl md:text-3xl text-finance-text tracking-tight mb-2">
            Jim's Finance
          </h1>
          <p className="text-finance-text-secondary text-sm">
            Your personal ledger
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-finance-text-secondary text-xs uppercase tracking-wider">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-finance-text-secondary" />
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10 bg-finance-bg border-finance-text-secondary/10 text-finance-text placeholder:text-finance-text-secondary/50 focus:border-finance-primary focus:ring-finance-primary/20"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !password}
            className="w-full mt-6 font-medium hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#3b82f6', color: '#ffffff' }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-finance-text-secondary text-xs">
            Secure. Private. Yours alone.
          </p>
        </div>
      </div>
    </div>
  );
}
