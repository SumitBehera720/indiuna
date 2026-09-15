import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@indiuna.com');
  const [password, setPassword] = useState('password321');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      const msg = 'Please enter your email and password';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    setLoading(true);
    try {
      await login(cleanEmail, password);
      toast.success('Welcome back to Indiuna Admin!');
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Invalid email or password. Please check your credentials.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 text-surface-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-900 border border-surface-800 shadow-2xl mb-4 text-primary-500">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-heading text-white">INDIUNA</h1>
          <p className="text-surface-400 mt-1 text-xs tracking-widest uppercase">Store Management Admin</p>
        </div>

        {/* Login Form Container */}
        <div className="bg-surface-900/90 border border-surface-800 p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
          {errorMessage && (
            <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-surface-300 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface-950/80 border border-surface-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white placeholder-surface-500 rounded-xl outline-none transition-colors text-sm"
                  placeholder="admin@indiuna.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-surface-300 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-surface-950/80 border border-surface-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-white placeholder-surface-500 rounded-xl outline-none transition-colors text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm font-semibold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Hint */}
          <div className="mt-6 pt-5 border-t border-surface-800/60 text-center">
            <p className="text-xs text-surface-400 mb-2">Default Admin Credentials (Click to Auto-fill):</p>
            <button 
              type="button"
              onClick={() => {
                setEmail('admin@indiuna.com');
                setPassword('password321');
                toast.success('Credentials filled!');
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-950 hover:bg-surface-800 border border-surface-800 text-xs font-mono text-surface-300 transition-colors cursor-pointer"
            >
              <span>admin@indiuna.com</span>
              <span className="text-surface-600">•</span>
              <span>password321</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-surface-500 mt-6 px-1">
          <a href="/" className="hover:text-primary-400 transition-colors flex items-center gap-1">
            &larr; Return to Storefront
          </a>
          <span>&copy; {new Date().getFullYear()} Indiuna Admin</span>
        </div>
      </div>
    </div>
  );
}
