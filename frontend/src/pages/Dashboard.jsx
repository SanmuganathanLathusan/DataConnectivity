import { useState, useEffect } from 'react';
import { 
  Database, 
  ArrowRightLeft, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  ExternalLink,
  Plus,
  Zap,
  Activity,
  Server
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, subtitle, link }) => {
  const CardContent = (
    <Card hover className="h-full border-slate-200 dark:border-slate-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium italic">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${color} shadow-sm`}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="h-full">
      {link ? (
        <Link to={link} className="block h-full transition-transform hover:-translate-y-1">
          {CardContent}
        </Link>
      ) : CardContent}
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/');
      setStats(response.data);
    } catch (err) {
      console.error("Failed to fetch statistics", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return (
    <div className="animate-pulse space-y-8">
      <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-xl border border-slate-200"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[400px] bg-white rounded-xl border border-slate-200"></div>
        <div className="h-[400px] bg-white rounded-xl border border-slate-200"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Monitor your database health and transfer activity.
          </p>
        </div>
        <Link to="/transfer">
          <Button icon={Plus} size="md">
            New Transfer
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Connections" 
          value={stats?.total_connections ?? 0} 
          icon={Server} 
          color="bg-slate-100 text-slate-600"
          subtitle="Configured nodes"
          link="/connections"
        />
        <StatCard 
          title="Active Transfers" 
          value={stats?.active_transfers ?? 0} 
          icon={Activity} 
          color="bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
          subtitle="Currently running"
          link="/history?status=running"
        />
        <StatCard 
          title="Records Moved" 
          value={(stats?.total_rows_transferred ?? 0).toLocaleString()} 
          icon={Zap} 
          color="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
          subtitle="Successfully synced"
          link="/history"
        />
        <StatCard 
          title="Failed Tasks" 
          value={stats?.failed_transfers_count ?? 0} 
          icon={AlertTriangle} 
          color={(stats?.failed_transfers_count ?? 0) > 0 ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400" : "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500"}
          subtitle="Action required"
          link="/history?status=failed"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card padding="none" className="h-full border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest data synchronization tasks</p>
              </div>
              <Link to="/history">
                <Button variant="ghost" size="sm" icon={ExternalLink}>View All</Button>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider bg-slate-50/50">
                    <th className="px-6 py-4">Resource</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Progress</th>
                    <th className="px-6 py-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats?.recent_transfers?.length > 0 ? stats.recent_transfers.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                            <Database size={14} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.table_name}</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                              {item.source_connection_name} ➔ {item.destination_connection_name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={item.status === 'success' ? 'success' : item.status === 'failed' ? 'error' : 'info'}
                          size="sm"
                          className="font-medium"
                        >
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {(item.rows_transferred ?? 0).toLocaleString()} records
                          </span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            {item.execution_time || 0}s duration
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-medium text-slate-900 dark:text-white">{new Date(item.started_at).toLocaleDateString()}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {new Date(item.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-400 text-sm">
                        No recent activity recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div>
          <Card className="bg-[#05070a] text-white border-transparent h-full flex flex-col justify-between py-8 px-6 relative overflow-hidden group">
            {/* Subtle background glow for the card */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl transition-all duration-700 group-hover:bg-yellow-500/20" />
            
            <div className="relative z-10">
              <div className="w-12 h-10 bg-[#FFEC00] rounded-xl flex flex-col items-center justify-center mb-6 shadow-xl shadow-yellow-500/10 p-1">
                 <span className="text-[10px] font-black text-[#05070a] leading-none">DATA</span>
                 <span className="text-[5px] font-black text-[#05070a] leading-none mt-1 tracking-tighter">CONNECTIVITY</span>
              </div>
              <h2 className="text-xl font-bold mb-2 tracking-tight">Automate Pipelines</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connect your nodes and start migrating data securely with optimized, SSL-encrypted tunnels.
              </p>
            </div>
            
            <div className="mt-8 space-y-4">
              <Link to="/transfer">
                <Button className="w-full bg-[#FFEC00] text-[#05070a] hover:bg-[#ffe000] font-black uppercase tracking-wider text-xs py-3.5">
                  New Migration Task
                </Button>
              </Link>
              <div className="flex items-center justify-center gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                Secure SSL Encryption
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
