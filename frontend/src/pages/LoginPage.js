import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md p-8 space-y-6 border-2 border-border rounded-xl">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold text-primary mb-2">Chalboo</h1>
          <h2 className="text-2xl font-heading font-semibold">Welcome Back</h2>
          <p className="text-muted-foreground mt-2">Login to find your travel companions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              data-testid="login-email-input"
              className="mt-1 border-2 focus:border-primary"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              data-testid="login-password-input"
              className="mt-1 border-2 focus:border-primary"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            data-testid="login-submit-btn"
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 font-bold shadow-[4px_4px_0px_0px_#0F172A] hover:translate-y-[-2px] transition-all"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-center text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary font-semibold hover:underline" data-testid="login-signup-link">
            Sign up
          </Link>
        </p>
      </Card>
    </div>
  );
}