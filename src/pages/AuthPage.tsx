import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/Logo';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Store, Truck, Mail, Lock, User, Phone, MapPin, ArrowLeft } from 'lucide-react';

type AuthMode = 'select' | 'login' | 'signup';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>('select');
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    location: '',
  });

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setMode('login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;
    
    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(formData.email, formData.password, role);
      } else {
        await signup({ ...formData, role });
      }
      navigate(role === 'seller' ? '/seller' : '/partner');
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (mode === 'login' || mode === 'signup') {
      setMode('select');
      setRole(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        {/* Role Selection */}
        {mode === 'select' && (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">Welcome to QuilBox Partners</h1>
              <p className="text-muted-foreground">Choose your role to continue</p>
            </div>

            <button
              onClick={() => handleRoleSelect('seller')}
              className="w-full p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Store className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">I'm a Seller</h3>
                  <p className="text-sm text-muted-foreground">Manage inventory & track orders</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('delivery_partner')}
              className="w-full p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Truck className="w-7 h-7 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">I'm a Delivery Partner</h3>
                  <p className="text-sm text-muted-foreground">Track earnings & deliveries</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Login/Signup Form */}
        {(mode === 'login' || mode === 'signup') && (
          <div className="space-y-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="text-center">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                {role === 'seller' ? (
                  <Store className="w-7 h-7 text-primary" />
                ) : (
                  <Truck className="w-7 h-7 text-primary" />
                )}
              </div>
              <h1 className="text-2xl font-bold mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-muted-foreground">
                {role === 'seller' ? 'Seller Portal' : 'Delivery Partner Portal'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {role === 'seller' && (
                    <div className="space-y-2">
                      <Label htmlFor="location">Store Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="location"
                          placeholder="New Delhi, India"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email or Phone</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => setMode('signup')} className="text-primary hover:underline">
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="text-primary hover:underline">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
