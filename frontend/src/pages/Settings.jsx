import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  User, Bell, Palette, Globe, Save, Camera,
  CheckCircle2, Mail, BellRing, ArrowRightLeft,
  AlertCircle, Monitor, Moon, Sun, Zap, Database,
  Clock, Languages, LayoutGrid, Download, Trash2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';

// ─── Toggle Switch ────────────────────────────────────────────────
const Toggle = ({ checked, onChange, id }) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
      checked ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'
    }`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
        checked ? 'translate-x-[18px]' : 'translate-x-0.5'
      }`}
    />
  </button>
);

// ─── Setting Row ──────────────────────────────────────────────────
const SettingRow = ({ icon: Icon, iconColor = 'text-slate-500', title, desc, children }) => (
  <div className="flex items-center justify-between gap-6 py-5 border-b border-slate-100 last:border-0">
    <div className="flex items-center gap-4 min-w-0">
      <div className={`shrink-0 w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center ${iconColor}`}>
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5 leading-normal">{desc}</p>
      </div>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

// ─── Toast ────────────────────────────────────────────────────────
const Toast = ({ message, type }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${
      type === 'success'
        ? 'bg-white border-emerald-100 text-emerald-800 shadow-emerald-500/5'
        : 'bg-white border-rose-100 text-rose-800 shadow-rose-500/5'
    }`}
  >
    <div className={`p-1 rounded-md ${type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
      {type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
    </div>
    {message}
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────
const Settings = () => {
  const { profileImage, setProfileImage } = useOutletContext();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [tempImage, setTempImage] = useState(profileImage);

  const [profile, setProfile] = useState({
    name:        localStorage.getItem('settings_name')        || 'Active User',
    email:       localStorage.getItem('settings_email')       || 'user@dataconnectivity.io',
    designation: localStorage.getItem('settings_designation') || 'Administrator',
    region:      localStorage.getItem('settings_region')      || 'North America (AWS)',
    joinDate:    '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        const userData = response.data;
        setProfile(prev => ({
          ...prev,
          name: userData.name || prev.name,
          email: userData.email || prev.email,
          joinDate: userData.created_at,
        }));
        
        localStorage.setItem('settings_name', userData.name);
        localStorage.setItem('settings_email', userData.email);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const [notifs, setNotifs] = useState(() => ({
    emailAlerts:     JSON.parse(localStorage.getItem('notif_emailAlerts')     ?? 'true'),
    transferUpdates: JSON.parse(localStorage.getItem('notif_transferUpdates') ?? 'true'),
    errorAlerts:     JSON.parse(localStorage.getItem('notif_errorAlerts')     ?? 'true'),
    weeklyDigest:    JSON.parse(localStorage.getItem('notif_weeklyDigest')    ?? 'false'),
    connectionAlerts:JSON.parse(localStorage.getItem('notif_connectionAlerts')?? 'true'),
  }));

  const [theme, setTheme] = useState(() => localStorage.getItem('settings_theme') || 'Light');

  // Apply and Persist theme immediately
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'Dark') {
      root.classList.add('dark');
    } else if (theme === 'Light') {
      root.classList.remove('dark');
    } else if (theme === 'System') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemDark);
    }
    localStorage.setItem('settings_theme', theme);
  }, [theme]);

  const [sys, setSys] = useState(() => ({
    autoSave:      JSON.parse(localStorage.getItem('sys_autoSave')      ?? 'true'),
    compactMode:   JSON.parse(localStorage.getItem('sys_compactMode')   ?? 'false'),
    animations:    JSON.parse(localStorage.getItem('sys_animations')    ?? 'true'),
    autoTimeout:   JSON.parse(localStorage.getItem('sys_autoTimeout')   ?? 'true'),
    dataCompression:JSON.parse(localStorage.getItem('sys_dataCompression')?? 'false'),
    language:      localStorage.getItem('sys_language') || 'English',
    timezone:      localStorage.getItem('sys_timezone') || 'UTC+05:30 (IST)',
  }));

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await api.patch('/auth/me', { name: profile.name.trim() });
      const updatedProfile = response.data;

      localStorage.setItem('settings_name', updatedProfile.name);
      localStorage.setItem('settings_email', profile.email);
      localStorage.setItem('settings_designation', profile.designation);
      localStorage.setItem('settings_region', profile.region);
      Object.entries(notifs).forEach(([k, v]) => localStorage.setItem(`notif_${k}`, JSON.stringify(v)));
      localStorage.setItem('settings_theme', theme);
      Object.entries(sys).forEach(([k, v]) => localStorage.setItem(`sys_${k}`, typeof v === 'boolean' ? JSON.stringify(v) : v));
      setProfileImage(tempImage);
      if (tempImage) {
        localStorage.setItem('profileImage', tempImage);
      } else {
        localStorage.removeItem('profileImage');
      }

      window.dispatchEvent(new Event('profile-updated'));
      setProfile((prev) => ({ ...prev, name: updatedProfile.name }));
      showToast('Settings successfully updated');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('Failed to update settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2MB', 'error'); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      setTempImage(reader.result);
      showToast('New avatar selected');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setTempImage(null);
    showToast('Avatar removed');
  };

  const tabs = [
    { id: 'profile',       label: 'Profile',       icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance',    label: 'Appearance',    icon: Palette },
    { id: 'system',        label: 'System',        icon: Globe },
  ];

  const themeOptions = [
    { label: 'Light',  icon: Sun,     preview: 'bg-white border-slate-200'  },
    { label: 'Dark',   icon: Moon,    preview: 'bg-slate-950 border-slate-800' },
    { label: 'System', icon: Monitor, preview: 'bg-gradient-to-br from-slate-100 to-slate-950 border-slate-200 dark:border-slate-800' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your account and interface preferences.
          </p>
        </div>
        <Button onClick={handleSave} isLoading={isSaving} icon={Save} className="px-6">
          Save Preferences
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Navigation Tabs */}
        <div className="w-full lg:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-brand-600' : 'text-slate-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Form Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              <Card className="border-slate-200 dark:border-slate-800">
                {/* ── PROFILE ── */}
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-bold overflow-hidden border border-slate-200">
                          {tempImage
                            ? <img src={tempImage} alt="Profile" className="w-full h-full object-cover" />
                            : <User size={32} />
                          }
                        </div>
                        <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-50 shadow-sm transition-colors text-slate-500">
                          <Camera size={14} />
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{profile.name}</h3>
                        <p className="text-sm text-slate-500 mt-0.5">{profile.email}</p>
                        <div className="flex items-center gap-3 mt-4">
                          <label className="cursor-pointer">
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            <span className="text-xs font-semibold text-brand-600 hover:text-brand-700">Change Photo</span>
                          </label>
                          {tempImage && (
                            <button onClick={handleRemoveAvatar} className="text-xs font-semibold text-rose-500 hover:text-rose-600 border-l border-slate-200 pl-3">
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                      <Input
                        label="Display Name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder="Active User"
                      />
                       <Input
                        label="Email"
                        type="email"
                        value={profile.email}
                        disabled
                        placeholder="user@example.com"
                      />
                      <Input
                        label="Role / Title"
                        value={profile.designation}
                        onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                        placeholder="Administrator"
                      />
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Region</label>
                        <select
                          value={profile.region}
                          onChange={(e) => setProfile({ ...profile, region: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-sm font-medium text-slate-900"
                        >
                          {['North America (AWS)', 'Europe (EU-WEST)', 'Asia Pacific (AP)', 'South Asia (IN)', 'Sri Lanka (LK)', 'Middle East (ME)'].map(r => (
                            <option key={r}>{r}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── NOTIFICATIONS ── */}
                {activeTab === 'notifications' && (
                  <div className="divide-y divide-slate-100 -my-5">
                    <SettingRow icon={Mail} iconColor="text-slate-400" title="System Emails" desc="Receive service notifications and account balance reports">
                      <Toggle id="emailAlerts" checked={notifs.emailAlerts} onChange={(v) => setNotifs({ ...notifs, emailAlerts: v })} />
                    </SettingRow>

                    <SettingRow icon={ArrowRightLeft} iconColor="text-slate-400" title="Job Status" desc="Get notified when a data transfer starts, completes or encounters issues">
                      <Toggle id="transferUpdates" checked={notifs.transferUpdates} onChange={(v) => setNotifs({ ...notifs, transferUpdates: v })} />
                    </SettingRow>

                    <SettingRow icon={AlertCircle} iconColor="text-rose-400" title="Failure Alerts" desc="Immediate escalation for critical connection or transfer failures">
                      <Toggle id="errorAlerts" checked={notifs.errorAlerts} onChange={(v) => setNotifs({ ...notifs, errorAlerts: v })} />
                    </SettingRow>

                    <SettingRow icon={Database} iconColor="text-slate-400" title="Node Monitoring" desc="Updates regarding node availability and latency changes">
                      <Toggle id="connectionAlerts" checked={notifs.connectionAlerts} onChange={(v) => setNotifs({ ...notifs, connectionAlerts: v })} />
                    </SettingRow>

                    <SettingRow icon={BellRing} iconColor="text-slate-400" title="Performance Digest" desc="Weekly summary of platform metrics and health scorecard">
                      <Toggle id="weeklyDigest" checked={notifs.weeklyDigest} onChange={(v) => setNotifs({ ...notifs, weeklyDigest: v })} />
                    </SettingRow>
                  </div>
                )}

                {/* ── APPEARANCE ── */}
                {activeTab === 'appearance' && (
                  <div className="space-y-8">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Interface Theme</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {themeOptions.map(({ label, icon: Icon, preview }) => {
                          const isActive = theme === label;
                          return (
                            <button
                              key={label}
                              onClick={() => setTheme(label)}
                              className={`flex flex-col items-start gap-3 p-3 rounded-xl border transition-all ${
                                isActive
                                  ? 'bg-brand-50/50 dark:bg-brand-500/5 border-brand-200 dark:border-brand-500/30'
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              }`}
                            >
                              <div className={`w-full h-24 rounded-lg border ${preview} shadow-sm`} />
                              <div className="flex items-center gap-2 px-1">
                                <Icon size={14} className={isActive ? 'text-brand-600' : 'text-slate-400'} />
                                <span className={`text-sm font-semibold ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>{label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Brand Accent</p>
                      <div className="flex items-center gap-4">
                        {[
                          { name: 'Default', color: 'bg-rose-600', active: true },
                          { name: 'Indigo',  color: 'bg-indigo-600', active: false },
                          { name: 'Emerald', color: 'bg-emerald-600', active: false },
                          { name: 'Amber',   color: 'bg-amber-500',  active: false },
                        ].map(({ name, color, active }) => (
                          <div key={name} className="flex flex-col items-center gap-2">
                            <div className={`w-8 h-8 rounded-full ${color} cursor-pointer border-2 border-white ring-1 ${active ? 'ring-slate-900' : 'ring-slate-200'}`} />
                            <span className="text-[10px] font-semibold text-slate-400">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SYSTEM ── */}
                {activeTab === 'system' && (
                  <div className="space-y-8">
                    <div className="divide-y divide-slate-100 -my-5">
                      <SettingRow icon={Zap} title="Live Synchronization" desc="Automatically persist changes across your connected nodes">
                        <Toggle id="autoSave" checked={sys.autoSave} onChange={(v) => setSys({ ...sys, autoSave: v })} />
                      </SettingRow>

                      <SettingRow icon={LayoutGrid} title="High Density Mode" desc="Optimize screen real estate by reducing component padding">
                        <Toggle id="compactMode" checked={sys.compactMode} onChange={(v) => setSys({ ...sys, compactMode: v })} />
                      </SettingRow>

                      <SettingRow icon={Clock} title="Auto-Termination" desc="Securely sign out after 30 minutes of inactivity">
                        <Toggle id="autoTimeout" checked={sys.autoTimeout} onChange={(v) => setSys({ ...sys, autoTimeout: v })} />
                      </SettingRow>

                      <SettingRow icon={Download} title="Network Compression" desc="Enable payload compression for slow network conditions">
                        <Toggle id="dataCompression" checked={sys.dataCompression} onChange={(v) => setSys({ ...sys, dataCompression: v })} />
                      </SettingRow>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 border-t border-slate-100">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <Languages size={14} /> Language
                        </label>
                        <select
                          value={sys.language}
                          onChange={(e) => setSys({ ...sys, language: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 outline-none transition-all text-sm font-medium text-slate-900"
                        >
                          {['English', 'Spanish', 'French', 'German'].map(l => <option key={l}>{l}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                          <Clock size={14} /> Timezone
                        </label>
                        <select
                          value={sys.timezone}
                          onChange={(e) => setSys({ ...sys, timezone: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-4 outline-none transition-all text-sm font-medium text-slate-900"
                        >
                          {['UTC+00:00 (GMT)', 'UTC+05:30 (IST)', 'UTC-05:00 (EST)'].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="pt-8 mt-8 border-t border-slate-100 flex items-center justify-between">
                       <div>
                         <p className="text-sm font-semibold text-slate-900">Reset Defaults</p>
                         <p className="text-xs text-slate-500 mt-1">Revert all local preferences to platform defaults.</p>
                       </div>
                       <Button
                        variant="ghost"
                        icon={Trash2}
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50 px-4"
                        onClick={() => {
                          const keys = Object.keys(localStorage).filter(k => k.startsWith('settings_') || k.startsWith('notif_') || k.startsWith('sys_'));
                          keys.forEach(k => localStorage.removeItem(k));
                          showToast('Settings reset');
                          setTimeout(() => window.location.reload(), 800);
                        }}
                      >
                        Reset All
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
