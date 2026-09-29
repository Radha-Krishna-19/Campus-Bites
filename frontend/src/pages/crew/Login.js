import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Utensils, ChefHat, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api, { DEMO_MODE } from '@/utils/api';
import { setAuth } from '@/utils/auth';
import { CANTEENS } from '@/utils/demoData';
import { CREW_PASSWORD } from '@/utils/demoBackend';
import { toast } from 'sonner';

export default function CrewLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/crew/login', credentials);
      setAuth(response.data.token, response.data.user);
      toast.success(`Signed in to ${response.data.user.name}`);
      navigate('/crew/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  const handleCanteenLogin = (canteen) => {
    const credentials = { email: `crew.${canteen.canteen_id}@amrita.edu`, password: CREW_PASSWORD };
    setFormData(credentials);
    login(credentials);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-blue-100 p-8">
          <div className="text-center mb-8">
            <ChefHat className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Crew Portal</h1>
            <p className="text-gray-600">Sign in to manage your kitchen's orders</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-gray-700 font-medium">Crew Email</Label>
              <Input id="email" type="email" placeholder="crew.sopanam@amrita.edu" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="mt-2 rounded-xl border-gray-200 focus:border-blue-500" required data-testid="crew-email-input" />
            </div>
            <div>
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <Input id="password" type="password" placeholder="Enter password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="mt-2 rounded-xl border-gray-200 focus:border-blue-500" required data-testid="crew-password-input" />
            </div>
            <Button type="submit" disabled={loading} className="w-full py-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg" data-testid="crew-login-submit-btn">
              {loading ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Signing in...</>) : 'Sign in'}
            </Button>
          </form>

          {DEMO_MODE && (
            <div className="mt-8">
              <p className="mb-3 text-center text-sm font-medium text-gray-500">Or jump into a demo kitchen</p>
              <div className="space-y-3">
                {CANTEENS.map((canteen, i) => (
                  <motion.button
                    key={canteen.canteen_id}
                    type="button"
                    disabled={loading}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleCanteenLogin(canteen)}
                    className="group flex w-full items-center gap-4 rounded-2xl border border-blue-100 bg-white p-3 text-left shadow-sm transition-shadow hover:shadow-lg disabled:opacity-60"
                    data-testid={`crew-login-${canteen.canteen_id}`}
                  >
                    <img src={canteen.image_url} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    <span className="flex-1">
                      <span className="block font-bold text-gray-900">{canteen.name}</span>
                      <span className="block font-mono text-xs text-gray-500">crew.{canteen.canteen_id}@amrita.edu · {CREW_PASSWORD}</span>
                    </span>
                    <ArrowRight className="w-5 h-5 text-blue-400 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700" data-testid="back-home-link">
              <Utensils className="w-4 h-4" /> Back to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
