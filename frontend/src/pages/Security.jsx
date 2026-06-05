import { useState } from 'react';
import { Shield, Key, Lock, Fingerprint, Eye, EyeOff, AlertTriangle, ShieldCheck, CheckCircle2, ShieldAlert, RefreshCw } from 'lucide-react';
import api from '../api/api';
import { cn } from '../utils/cn';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';

const Security = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [passwords, setPasswords] = useState({
    old: '',
    new: '',
    confirm: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleUpdatePassword = async () => {
    if (!passwords.old || !passwords.new || !passwords.confirm) {
      setStatus({ type: 'error', message: 'Please fill all password fields.' });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setStatus({ type: 'error', message: 'The new passwords do not match.' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await api.post('/auth/change-password', {
        old_password: passwords.old,
        new_password: passwords.new
      });
      setStatus({ type: 'success', message: 'Your password has been updated.' });
      setPasswords({ old: '', new: '', confirm: '' });
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.detail || 'Failed to update password.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure? This action is permanent and you will be signed out immediately.")) {
      return;
    }

    try {
      await api.delete('/auth/account');
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    } catch (err) {
      setStatus({ type: 'error', message: 'Could not delete account. Please try again.' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your authentication credentials and account security.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
           <ShieldCheck size={14} className="text-emerald-600" />
           <span className="text-xs font-semibold text-emerald-700">Encrypted</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Security Area */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-slate-200/60 shadow-sm p-0 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400">
                <Key size={16} />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Password & Authentication</h2>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="md:col-span-2">
                    <Input 
                      label="Current Password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      icon={Lock}
                      value={passwords.old}
                      onChange={(e) => setPasswords({...passwords, old: e.target.value})}
                      className="h-10 text-sm"
                    />
                 </div>
                 <div className="relative">
                    <Input 
                      label="New Password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      icon={Shield}
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      className="h-10 text-sm"
                    />
                 </div>
                 <div className="relative">
                    <Input 
                      label="Confirm New Password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••"
                      icon={ShieldCheck}
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      className="h-10 text-sm"
                    />
                    <button 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-[34px] text-slate-400 hover:text-brand-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                 </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                 <div className="flex items-center gap-3">
                    <Fingerprint className="text-slate-400" size={18} />
                    <span className="text-xs font-semibold text-slate-700">Multi-Factor Authentication (MFA)</span>
                 </div>
                 <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">Always On</span>
              </div>

              <AnimatePresence>
                {status.message && (
                   <motion.div 
                     initial={{ opacity: 0, y: -8 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0 }}
                     className={cn(
                       "p-3.5 rounded-lg flex items-center gap-3 text-xs font-semibold border",
                       status.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'
                     )}
                   >
                     {status.type === 'success' ? <CheckCircle2 size={14} className="shrink-0" /> : <AlertTriangle size={14} className="shrink-0" />}
                     {status.message}
                   </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                 <Button 
                   onClick={handleUpdatePassword} 
                   isLoading={isLoading} 
                   icon={RefreshCw}
                   className="h-10 px-6 rounded-lg text-sm"
                 >
                    Save Password
                 </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Actions */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-slate-900 border-none p-6 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 text-white/[0.03] group-hover:scale-110 transition-transform duration-700">
              <ShieldAlert size={140} />
            </div>
            <div className="relative z-10">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center mb-6 shadow-lg shadow-amber-500/20">
                 <ShieldAlert className="text-white" size={20} />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight mb-2">Account Health</h3>
              <p className="text-slate-400 text-[13px] leading-relaxed mb-8">Run a deep scan to detect potential credential leaks or weak access patterns.</p>
              <button className="w-full bg-white hover:bg-slate-50 text-slate-950 px-4 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all">Run Security Audit</button>
            </div>
          </Card>

          <Card className="border-rose-100/60 bg-white p-6 shadow-sm">
             <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={15} className="text-rose-500" />
                <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider">Danger Zone</h3>
             </div>
             <p className="text-slate-500 text-[13px] font-medium mb-6 leading-relaxed">Deletions are permanent. All your connection profiles and history will be scrubbed.</p>
             <button 
              onClick={handleDeleteAccount}
              className="w-full text-rose-600 hover:text-white border border-rose-200 hover:bg-rose-600 px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all"
             >
               Delete My Account
             </button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Security;
