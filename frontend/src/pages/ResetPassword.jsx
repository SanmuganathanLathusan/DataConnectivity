import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { DatabaseZap, Lock, Loader2, AlertCircle, CheckCircle2, ShieldCheck, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import Button from '../components/ui/Button';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', {
        token: token,
        new_password: password
      });
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070a] relative overflow-hidden font-sans">
      
      {/* Tech Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glow behind the card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full bg-yellow-500/10 blur-[120px]" />
        
        {/* Abstract "Cloud" SVG Pattern */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
          <svg width="1200" height="800" viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M600 100C300 100 100 300 100 500C100 700 300 700 600 700C900 700 1100 500 1100 300C1100 100 900 100 600 100Z" stroke="#FFEC00" strokeWidth="0.5" strokeDasharray="10 20" />
            <circle cx="600" cy="400" r="300" stroke="#FFEC00" strokeWidth="0.5" opacity="0.3" strokeDasharray="5 15" />
            <path d="M200 400H1000M600 0V800" stroke="#FFEC00" strokeWidth="0.2" opacity="0.2" />
            {/* Mock Circuitry lines */}
            <path d="M100 100L200 100L250 150H400" stroke="#FFEC00" strokeWidth="1" opacity="0.4" />
            <path d="M1100 700L1000 700L950 650H800" stroke="#FFEC00" strokeWidth="1" opacity="0.4" />
          </svg>
        </div>

        {/* Digital Blocks / Pixels (Corners) */}
        <div className="absolute top-0 left-0 p-8 flex flex-wrap w-48 gap-px opacity-40">
           {Array.from({length: 12}).map((_, i) => (
             <div key={i} className={`w-10 h-10 ${i === 0 || i === 4 || i === 9 ? 'bg-[#FFEC00]' : 'bg-yellow-900/20'}`} />
           ))}
        </div>
        <div className="absolute bottom-0 right-0 p-8 flex flex-wrap w-48 gap-px opacity-40 rotate-180">
           {Array.from({length: 12}).map((_, i) => (
             <div key={i} className={`w-10 h-10 ${i === 0 || i === 4 || i === 9 ? 'bg-[#FFEC00]' : 'bg-yellow-900/20'}`} />
           ))}
        </div>
      </div>

      {/* Auth Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-[480px] bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="p-10 flex flex-col items-center">
          
          {/* Logo Section */}
          <div className="mb-12">
            <div className="w-32 h-24 bg-[#FFEC00] rounded-xl flex items-center justify-center p-2">
              <div className="flex flex-col items-center">
                <span className="text-xl font-black text-[#05070a] tracking-tight leading-none">DATA</span>
                <span className="text-[10px] font-black text-[#05070a] tracking-[0.2em] uppercase opacity-70 leading-none mt-1">CONNECTIVITY</span>
              </div>
            </div>
          </div>

          <div className="w-full">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-gray-900">Set New Password</h2>
              <p className="text-sm text-gray-500 mt-2">Almost there! Choose a strong password for your account.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-medium flex items-center gap-3"
                  >
                    <AlertCircle size={16} className="text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
                {isSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-medium flex items-center gap-3"
                  >
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Password updated! Redirecting to login...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">New Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border-2 border-gray-100 rounded-xl py-3.5 px-4 text-sm font-medium text-gray-900 outline-none focus:border-[#FFEC00] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border-2 border-gray-100 rounded-xl py-3.5 px-4 text-sm font-medium text-gray-900 outline-none focus:border-[#FFEC00] transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !token || isSuccess}
                className="w-full relative group h-14 rounded-full overflow-hidden transition-all duration-500 active:scale-[0.96] disabled:opacity-70"
              >
                {/* Neon Glow Outer */}
                <div className="absolute inset-0 bg-yellow-400 group-hover:bg-[#FFEC00] transition-colors duration-300" />
                
                {/* Surface Shine (Glass Effect) */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-50" />
                
                {/* Interactive Liquid Wave */}
                <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[30deg] -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

                <div className="relative flex items-center justify-center gap-3 text-[#020408] font-black text-sm uppercase tracking-[0.15em] z-10">
                  {isLoading ? (
                    <RefreshCw size={20} className="animate-spin" />
                  ) : (
                    <>
                      <span>Update Password</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                    </>
                  )}
                </div>

                {/* Bottom Shadow Depth */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10" />
              </button>

              <div className="text-center pt-4">
                 <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#05070a] transition-colors group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span>Cancel and return</span>
                 </Link>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
