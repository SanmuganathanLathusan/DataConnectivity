import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Search, 
  ArrowRightLeft, 
  History, 
  LogOut,
  Menu,
  X,
  Bell,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  Search as SearchIcon,
  HelpCircle,
  Settings,
  Shield,
  Activity,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/api';
import Badge from './ui/Badge';
import { cn } from '../utils/cn';

const NavLink = ({ to, icon: Icon, children, onClick, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative",
        isActive 
          ? "bg-[#FFEC00] text-[#05070a] shadow-lg shadow-yellow-500/20" 
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
      )}
    >
      <Icon size={18} className={cn(isActive ? "text-[#05070a]" : "text-slate-400 group-hover:text-slate-600 transition-colors")} />
      {!isCollapsed && <span className="text-sm font-medium">{children}</span>}
      {isCollapsed && (
        <div className="absolute left-14 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-1 group-hover:translate-x-2 whitespace-nowrap z-[100] shadow-lg">
          {children}
        </div>
      )}
    </Link>
  );
};

const Layout = ({ onLogout }) => {
  const [profileImage, setProfileImage] = useState(localStorage.getItem('profileImage') || null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isHelpOpen, setHelpOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userProfile, setUserProfile] = useState({
    name: localStorage.getItem('settings_name') || 'User',
    email: ''
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolling(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    
    // Initialize Theme
    const savedTheme = localStorage.getItem('settings_theme') || 'Light';
    const root = window.document.documentElement;
    if (savedTheme === 'Dark') {
      root.classList.add('dark');
    } else if (savedTheme === 'Light') {
      root.classList.remove('dark');
    } else if (savedTheme === 'System') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemDark);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/dashboard/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setUserProfile(prev => ({
        ...prev,
        ...response.data
      }));
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchProfile();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname.slice(1);
    if (!path || path === 'dashboard') return 'Dashboard';
    const title = path.split('/')[0];
    return title.charAt(0).toUpperCase() + title.slice(1).replace('-', ' ');
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-['Inter',_sans-serif] transition-colors duration-200">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-[60] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-8 bg-[#FFEC00] rounded-lg flex flex-col items-center justify-center p-1">
             <span className="text-[8px] font-black text-[#05070a] leading-none">DATA</span>
             <span className="text-[4px] font-black text-[#05070a] leading-none mt-0.5 tracking-tighter">CONNECTIVITY</span>
          </div>
          <span className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase">Data Connectivity</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[70] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-[80] lg:z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out",
          isSidebarOpen ? "w-64" : "w-20",
          !isMobileMenuOpen && "hidden lg:flex",
          isMobileMenuOpen && "flex w-[280px]"
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex-shrink-0 w-10 h-8 bg-[#FFEC00] rounded-lg flex flex-col items-center justify-center p-1 shadow-sm">
                <span className="text-[8px] font-black text-[#05070a] leading-none">DATA</span>
                <span className="text-[4px] font-black text-[#05070a] leading-none mt-0.5 tracking-tighter">CONNECTIVITY</span>
            </div>
            {(isSidebarOpen || isMobileMenuOpen) && (
              <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white whitespace-nowrap uppercase">
                Data Connectivity
              </span>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <NavLink to="/dashboard" icon={LayoutDashboard} isCollapsed={!isSidebarOpen && !isMobileMenuOpen}>Overview</NavLink>
          <NavLink to="/connections" icon={Database} isCollapsed={!isSidebarOpen && !isMobileMenuOpen}>Connections</NavLink>
          <NavLink to="/explorer" icon={Search} isCollapsed={!isSidebarOpen && !isMobileMenuOpen}>Explorer</NavLink>
          <NavLink to="/transfer" icon={ArrowRightLeft} isCollapsed={!isSidebarOpen && !isMobileMenuOpen}>Transfer</NavLink>
          <NavLink to="/history" icon={History} isCollapsed={!isSidebarOpen && !isMobileMenuOpen}>History</NavLink>
          
          <div className="pt-4 pb-2 px-4">
            <div className={cn("h-px bg-slate-100", (!isSidebarOpen && !isMobileMenuOpen) && "mx-auto w-8")} />
          </div>

          <NavLink to="/settings" icon={Settings} isCollapsed={!isSidebarOpen && !isMobileMenuOpen}>Settings</NavLink>
          <NavLink to="/security" icon={Shield} isCollapsed={!isSidebarOpen && !isMobileMenuOpen}>Security</NavLink>
        </nav>

        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl w-full transition-all group font-medium text-sm",
              (!isSidebarOpen && !isMobileMenuOpen) && "justify-center px-0"
            )}
          >
            <LogOut size={18} />
            {(isSidebarOpen || isMobileMenuOpen) && <span>Sign Out</span>}
          </button>
        </div>
        
        <button 
           onClick={() => setSidebarOpen(!isSidebarOpen)}
           className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all z-50 shadow-sm lg:flex hidden"
        >
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isSidebarOpen ? "lg:ml-64" : "lg:ml-20",
        "mt-16 lg:mt-0"
      )}>
        {/* Top Header */}
        <header className={cn(
          "h-16 hidden lg:flex items-center justify-between px-8 sticky top-0 z-40 transition-all border-b border-transparent",
          isScrolling ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-200 dark:border-slate-800 shadow-sm" : "bg-transparent"
        )}>
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">{getPageTitle()}</h2>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 font-medium">
              System Online
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FFEC00] transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent rounded-lg py-1.5 pl-9 pr-4 text-sm w-64 focus:bg-white dark:focus:bg-slate-900 focus:border-[#FFEC00] transition-all outline-none text-slate-900 dark:text-white"
              />
            </div>
            
            <button className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative">
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900" />
              )}
            </button>

            <button className="w-10 h-10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <HelpCircle size={20} />
            </button>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
            
            <Link to="/settings" className="flex items-center gap-2 p-1 pl-1 pr-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
               <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 overflow-hidden border border-slate-300 dark:border-slate-700">
                 {profileImage ? (
                   <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <UserIcon size={16} />
                 )}
               </div>
               <div className="text-left hidden xl:block">
                 <p className="text-xs font-semibold text-slate-900 dark:text-white leading-none">{userProfile.name}</p>
                 <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-tight">Account</p>
               </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Content Area with Subtle Tech Theme */}
        <div className="relative p-6 lg:p-8 max-w-[1600px] mx-auto w-full flex-1">
          {/* Subtle Lite Grid Background */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] overflow-hidden">
             <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
            >
              <Outlet context={{ profileImage, setProfileImage }} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="px-8 py-6 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
           <p className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
             &copy; 2025 Data Connectivity Platform. All rights reserved.
           </p>
           <div className="flex items-center gap-6">
              {['Privacy Policy', 'Terms of Service', 'Support', 'API Docs'].map((link) => (
                <a key={link} href="#" className="text-xs text-slate-400 dark:text-slate-500 hover:text-brand-600 transition-colors font-medium">{link}</a>
              ))}
           </div>
        </footer>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg">
        {[
          { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
          { to: '/connections', icon: Database, label: 'Connect' },
          { to: '/transfer', icon: ArrowRightLeft, label: 'Transfer' },
          { to: '/history', icon: History, label: 'History' },
        ].map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors",
                isActive ? "text-brand-600 bg-brand-50" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
