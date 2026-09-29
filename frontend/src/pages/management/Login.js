import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api, { DEMO_MODE } from '@/utils/api';
import { DEMO_MANAGER } from '@/utils/demoBackend';
import { setAuth } from '@/utils/auth';
import { toast } from 'sonner';

export default function ManagementLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  const handleDemoLogin = () => {
    setFormData(DEMO_MANAGER);
    login(DEMO_MANAGER);
  };

  const login = async (credentials) => {
    setLoading(true);

    try {
      const response = await api.post('/auth/management/login', credentials);
      setAuth(response.data.token, response.data.user);
      toast.success('Login successful!');
      navigate('/management/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <Utensils className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-white">Campus Bites</span>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Management Portal</h1>
            <p className="text-gray-300">Sign in to access analytics</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-white font-medium">Email</Label>
              <Input id="email" type="email" placeholder="manager@amrita.edu" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-2 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400" required data-testid="login-email-input" />
            </div>

            <div>
              <Label htmlFor="password" className="text-white font-medium">Password</Label>
              <Input id="password" type="password" placeholder="Enter password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="mt-2 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-gray-400" required data-testid="login-password-input" />
            </div>

            <Button type="submit" disabled={loading} className="w-full rounded-xl py-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg" data-testid="login-submit-btn">
              {loading ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Logging in...</>) : ('Login')}
            </Button>
          </form>

          {DEMO_MODE && (
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="mt-4 w-full rounded-xl border-2 border-dashed border-white/20 bg-white/5 px-4 py-3 text-left transition-colors hover:border-orange-400 hover:bg-white/10 disabled:opacity-60"
              data-testid="demo-login-btn"
            >
              <span className="flex items-center gap-2 font-semibold text-orange-400">
                <Sparkles className="w-4 h-4" /> Try the demo admin account
              </span>
              <span className="mt-1 block font-mono text-xs text-gray-400">
                {DEMO_MANAGER.email} · {DEMO_MANAGER.password}
              </span>
            </button>
          )}

          <div className="mt-6 pt-6 border-t border-white/20 text-center">
            <Link to="/" className="text-sm text-gray-300 hover:text-white" data-testid="back-home-link">Back to Home</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
