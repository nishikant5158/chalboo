import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    city: '',
    age: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup({ ...formData, age: parseInt(formData.age) });
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md p-8 space-y-6 border-2 border-border rounded-xl">
        <div className="text-center">
          <h1 className="text-4xl font-heading font-bold text-primary mb-2">Chalboo</h1>
          <h2 className="text-2xl font-heading font-semibold">Create Account</h2>
          <p className="text-muted-foreground mt-2">Join the travel community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" data-testid="signup-form">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              data-testid="signup-name-input"
              className="mt-1 border-2 focus:border-primary"
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              data-testid="signup-email-input"
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
              data-testid="signup-password-input"
              className="mt-1 border-2 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
                data-testid="signup-city-input"
                className="mt-1 border-2 focus:border-primary"
              />
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
                data-testid="signup-age-input"
                className="mt-1 border-2 focus:border-primary"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            data-testid="signup-submit-btn"
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 font-bold shadow-[4px_4px_0px_0px_#0F172A] hover:translate-y-[-2px] transition-all"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="text-center text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline" data-testid="signup-login-link">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}