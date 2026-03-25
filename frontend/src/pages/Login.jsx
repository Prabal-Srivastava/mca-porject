import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Terminal, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-card p-10 md:p-12 relative z-10"
      >
        <div className="text-center mb-10 space-y-3">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/20 mb-6">
            <Terminal className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase">Welcome Back</h1>
          <p className="text-zinc-500 font-medium">Continue your coding journey</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm font-bold"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Username</label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="text"
                required
                className="input-field pl-14"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="password"
                required
                className="input-field pl-14"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-5 text-sm"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Sign In
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="mt-10 text-center text-zinc-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:text-primary-hover font-black uppercase tracking-tighter">
            Register Now
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
