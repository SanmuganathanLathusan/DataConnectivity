import { useState, useEffect } from 'react';
import { 
  Database, 
  Plus, 
  Trash2, 
  RefreshCw,
  Server,
  Key,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Globe,
  Network,
  Activity,
  Plus as PlusIcon
} from 'lucide-react';
import api from '../api/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { cn } from '../utils/cn';

const ConnectionCard = ({ conn, onTest, onDelete, isTesting }) => (
  <Card hover className="flex flex-col h-full group border-slate-200 dark:border-slate-800">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={cn(
          "p-2.5 rounded-lg shadow-sm transition-colors",
          "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
        )}>
          <Database size={20} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-tight truncate">{conn.name}</h3>
          <div className="flex items-center gap-2 mt-1">
             <Badge variant={conn.db_type === 'postgresql' ? 'info' : 'warning'} size="sm">
               {conn.db_type}
             </Badge>
             <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider flex items-center gap-1">
               <ShieldCheck size={10} />
               SSL
             </span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-1">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onTest(conn.id)}
          disabled={isTesting}
          className="h-8 w-8 p-0"
        >
          {isTesting ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} className="text-slate-400" />}
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onDelete(conn.id)}
          className="h-8 w-8 p-0 hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 size={14} className="text-slate-400" />
        </Button>
      </div>
    </div>

    <div className="space-y-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">Host</span>
        <span className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-[150px]">{conn.host}</span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">Port</span>
        <span className="text-slate-900 dark:text-slate-100 font-semibold">{conn.port}</span>
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">Database</span>
        <span className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-[150px]">{conn.database_name}</span>
      </div>
    </div>

    <div className="mt-auto pt-4">
      <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
        <Key size={10} />
        <span>Connected as {conn.username}</span>
      </div>
    </div>
  </Card>
);

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [newConn, setNewConn] = useState({
    name: '',
    db_type: 'postgresql',
    host: 'localhost',
    port: 5432,
    username: '',
    password: '',
    database_name: ''
  });

  const fetchConnections = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/connections/');
      setConnections(response.data);
    } catch (err) {
      console.error("Failed to fetch connections", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/connections/', newConn);
      setModalOpen(false);
      setNewConn({
        name: '',
        db_type: 'postgresql',
        host: 'localhost',
        port: 5432,
        username: '',
        password: '',
        database_name: ''
      });
      fetchConnections();
    } catch (err) {
      alert("Error: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this connection?")) return;
    try {
      await api.delete(`/connections/${id}`);
      fetchConnections();
    } catch (err) {
      alert("Failed to remove connection");
    }
  };

  const testConnection = async (id) => {
    setTestingId(id);
    try {
      await api.post(`/connections/${id}/test`);
      alert("Connection test successful");
    } catch (err) {
      alert("Test failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Connections</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage your database nodes and credentials.
          </p>
        </div>
        <Button 
          size="md"
          onClick={() => setModalOpen(true)}
          icon={PlusIcon}
        >
          Add Connection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? [1,2,3].map(i => (
          <div key={i} className="h-64 bg-white rounded-xl border border-slate-200 animate-pulse"></div>
        )) : connections.map((conn) => (
          <ConnectionCard 
            key={conn.id}
            conn={conn} 
            isTesting={testingId === conn.id}
            onTest={testConnection}
            onDelete={handleDelete}
          />
        ))}
        
        {!isLoading && connections.length === 0 && (
          <div 
             onClick={() => setModalOpen(true)}
             className="col-span-full py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
          >
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
              <Database size={24} />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No connections yet</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-xs">Start by adding a database to explore or migrate data.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Database"
        subtitle="Securely connect to your database instance."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreate} className="space-y-6">
          <Input
            label="Connection Name"
            required
            value={newConn.name}
            onChange={(e) => setNewConn({...newConn, name: e.target.value})}
            placeholder="Production Analytics DB"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</label>
              <select
                value={newConn.db_type}
                onChange={(e) => setNewConn({...newConn, db_type: e.target.value, port: e.target.value === 'postgresql' ? 5432 : 3306})}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-4 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all text-slate-900 dark:text-white text-sm font-medium"
              >
                <option value="postgresql">PostgreSQL</option>
                <option value="mysql">MySQL</option>
              </select>
            </div>

            <Input
              label="Host"
              required
              value={newConn.host}
              onChange={(e) => setNewConn({...newConn, host: e.target.value})}
              placeholder="localhost"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Database Name"
              required
              value={newConn.database_name}
              onChange={(e) => setNewConn({...newConn, database_name: e.target.value})}
              placeholder="main_db"
            />
            <Input
              label="Port"
              type="number"
              required
              value={newConn.port}
              onChange={(e) => setNewConn({...newConn, port: parseInt(e.target.value) || ''})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <Input
              label="Username"
              required
              value={newConn.username}
              onChange={(e) => setNewConn({...newConn, username: e.target.value})}
              placeholder="admin"
            />
            <Input
              label="Password"
              type="password"
              required
              value={newConn.password}
              onChange={(e) => setNewConn({...newConn, password: e.target.value})}
              placeholder="••••••••"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="flex-1"
              icon={PlusIcon}
            >
              Connect
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Connections;
