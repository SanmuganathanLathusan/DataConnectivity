import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { DatabaseZap, Mail, Lock, User, AlertCircle, CheckCircle2, ArrowRight, RefreshCw, HelpCircle, Unlock, Globe, Cpu, Zap } from 'lucide-react';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = ({ onLogin, mode: initialMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const googleButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: "138943787910-qrlmr7jnggda1reba75nrglif3a0ss94.apps.googleusercontent.com",
        callback: handleGoogleResponse
      });

      if (googleButtonRef.current) {
        google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          width: 320,
          text: "continue_with"
        });
      }
    }
  }, [isSignUp]); // Re-render when switching modes to ensure ref exists

  const handleGoogleResponse = async (response) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/google', {
        id_token: response.credential
      });
      onLogin(res.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError('Google authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerGoogleLogin = () => {
    if (window.google) {
      google.accounts.id.prompt(); // One tap
      // Also trigger the standard picker if available
      // For now, just prompt is fine, but usually we'd have a custom button 
      // with a real Google Sign In call.
      // Since we want a custom styled button, we can use google.accounts.id.renderButton 
      // or use the prompt API.
    }
  };

  useEffect(() => {
    if (initialMode === 'signup') {
      setIsSignUp(true);
    } else {
      const params = new URLSearchParams(location.search);
      const m = params.get('mode');
      if (m === 'signup') setIsSignUp(true);
    }
  }, [location, initialMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!isSignUp) {
        const loginData = new FormData();
        loginData.append('username', formData.email);
        loginData.append('password', formData.password);
        
        const response = await api.post('/auth/login', loginData);
        onLogin(response.data.access_token);
        navigate('/dashboard');
      } else {
        await api.post('/auth/register', formData);
        setIsSuccess(true);
        setTimeout(() => {
          setIsSignUp(false);
          setIsSuccess(false);
          setFormData({ ...formData, password: '' });
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020408] relative overflow-hidden font-sans selection:bg-yellow-500/30">
      
      {/* ELITE BACKGROUND SYSTEM */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        
        {/* Animated Grid Foundation */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0a0c10_1px,transparent_1px),linear-gradient(to_bottom,#0a0c10_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

        {/* Dynamic Glowing Orbs */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-yellow-500/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 60, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] bg-yellow-600/10 rounded-full blur-[140px]" 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] bg-yellow-500/[0.03] rounded-full blur-[100px]" />

        {/* Advanced Circuitry SVG - Animated Path */}
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.15]" width="1000" height="1000" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="500" cy="500" r="300" stroke="#FFEC00" strokeWidth="0.5" strokeDasharray="4 8" />
          <circle cx="500" cy="500" r="450" stroke="#FFEC00" strokeWidth="0.2" opacity="0.5" />
          
          {/* Animated Circuit Path */}
          <motion.path 
            d="M500 50L500 150M950 500L850 500M500 950L500 850M50 500L150 500" 
            stroke="#FFEC00" strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />

          <path d="M200 200L350 350M800 800L650 650M800 200L650 350M200 800L350 650" stroke="#FFEC00" strokeWidth="0.5" opacity="0.3" />
        </svg>

        {/* Digital Corner Elements */}
        <div className="absolute top-0 left-0 p-12">
          <div className="grid grid-cols-4 gap-1">
            {[...Array(16)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0.1 }}
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 3, delay: i * 0.1, repeat: Infinity }}
                className={`w-4 h-4 rounded-sm ${i % 5 === 0 ? 'bg-[#FFEC00]' : 'bg-yellow-900/20'}`} 
              />
            ))}
          </div>
        </div>
        <div className="absolute bottom-0 right-0 p-12 rotate-180">
          <div className="grid grid-cols-4 gap-1">
            {[...Array(16)].map((_, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0.1 }}
                animate={{ opacity: [0.1, 0.4, 0.1] }}
                transition={{ duration: 3, delay: i * 0.1, repeat: Infinity }}
                className={`w-4 h-4 rounded-sm ${i % 3 === 0 ? 'bg-[#FFEC00]' : 'bg-yellow-900/20'}`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* GLASSMORPHIC AUTH CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[580px] p-[1.5px] rounded-[32px] bg-gradient-to-b from-yellow-500/20 to-transparent shadow-2xl overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/[0.95] backdrop-blur-3xl rounded-[32px]" />
        
        <div className="relative p-6 sm:p-8 flex flex-col items-center">
          
          {/* Elite Logo Presentation */}
          <div className="relative mb-6 group/logo">
            <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500" />
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="w-28 h-12 bg-[#FFEC00] rounded-xl flex items-center justify-center p-1 shadow-[0_8px_20px_rgba(255,236,0,0.15)]"
            >
              <div className="flex flex-col items-center">
                <span className="text-sm font-black text-[#020408] tracking-tight leading-none">DATA</span>
                <span className="text-[7px] font-black text-[#020408] tracking-[0.15em] uppercase opacity-60 leading-none mt-1">CONNECTIVITY</span>
              </div>
            </motion.div>
          </div>

          <div className="w-full">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 bg-rose-50 border border-rose-100/50 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-3"
                >
                  <AlertCircle size={14} className="text-rose-600 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isSignUp && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Name</label>
                  <div className="relative group/input">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-[#FFEC00] transition-colors" />
                    <input
                      type="text"
                      required={isSignUp}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Full Name"
                      className="w-full bg-gray-50/50 border-2 border-gray-100/50 rounded-xl py-2.5 pl-11 pr-4 text-sm font-semibold text-gray-900 outline-none focus:bg-white focus:border-[#FFEC00] transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email / Identity</label>
                <div className="relative group/input">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-[#FFEC00] transition-colors" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="name@company.system"
                    className="w-full bg-gray-50/50 border-2 border-gray-100/50 rounded-xl py-2.5 pl-11 pr-4 text-sm font-semibold text-gray-900 outline-none focus:bg-white focus:border-[#FFEC00] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  {isSignUp ? 'Set Access' : 'Access Protocol'}
                </label>
                <div className="relative group/input">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-[#FFEC00] transition-colors" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder={isSignUp ? "Define Password" : "Enter Password"}
                    className="w-full bg-gray-50/50 border-2 border-gray-100/50 rounded-xl py-2.5 pl-11 pr-4 text-sm font-semibold text-gray-900 outline-none focus:bg-white focus:border-[#FFEC00] transition-all"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full relative group h-12 rounded-full overflow-hidden transition-all duration-500 active:scale-[0.96] disabled:opacity-70"
                >
                  {/* Neon Glow Outer */}
                  <div className="absolute inset-0 bg-yellow-400 group-hover:bg-[#FFEC00] transition-colors duration-300" />
                  
                  {/* Surface Shine (Glass Effect) */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent opacity-50" />
                  
                  {/* Interactive Liquid Wave */}
                  <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[30deg] -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />

                  <div className="relative flex items-center justify-center gap-2 text-[#020408] font-black text-xs uppercase tracking-[0.15em] z-10">
                    {isLoading ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <>
                        <span>{isSignUp ? 'Initialize' : 'Authenticate System'}</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/10" />
                </button>

                <div className="relative py-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100/50" />
                  </div>
                  <div className="relative flex justify-center text-[8px] uppercase tracking-[0.2em] font-black text-gray-300 bg-white px-2">
                    External
                  </div>
                </div>

                {/* Google Standard Button Container */}
                <div className="flex justify-center h-10 overflow-hidden rounded-full">
                  <div ref={googleButtonRef} />
                </div>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100/80 flex flex-col items-center gap-4">
              {!isSignUp ? (
                <>
                  <div className="flex w-full justify-between items-center px-2">
                    <Link to="/forgot-password" strokeWidth={2.5} className="text-[11px] font-black text-gray-400 hover:text-[#020408] uppercase tracking-widest transition-all flex items-center gap-2">
                      <Unlock size={12} />
                      Access Recovery
                    </Link>
                    <button type="button" className="text-[11px] font-black text-gray-400 hover:text-[#020408] uppercase tracking-widest transition-all flex items-center gap-2">
                      <HelpCircle size={12} />
                      Central Support
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsSignUp(true)}
                    className="text-xs font-black text-gray-500 hover:text-yellow-600 transition-colors bg-gray-50 px-6 py-2 rounded-full border border-gray-100 hover:border-yellow-200"
                  >
                    DEPLOY NEW ACCOUNT
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => setIsSignUp(false)}
                  className="text-xs font-black text-gray-500 hover:text-yellow-600 transition-colors uppercase tracking-widest"
                >
                  Return to Authentication
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Nano-Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: Math.random() * 1000, x: Math.random() * 2000 }}
            animate={{ 
              opacity: [0, 0.4, 0],
              y: [null, Math.random() * -200],
              x: [null, Math.random() * 50]
            }}
            transition={{
              duration: 8 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              backgroundColor: i % 2 === 0 ? '#FFEC00' : '#475569',
              boxShadow: i % 2 === 0 ? '0 0 10px #FFEC00' : 'none'
            }}
          />
        ))}
      </div>

      {/* Visual Status indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-30 select-none">
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Global Nodes: Active</span>
        </div>
        <div className="flex items-center gap-2">
          <Cpu size={14} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Compute Status: 100%</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-gray-400" />
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Latency: 2ms</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;

