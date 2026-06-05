import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  History as HistoryIcon, CheckCircle2, XCircle, Clock,
  Search, ArrowRight, Download, Activity, ArrowUpRight,
  RefreshCw, Trash2, X, AlertTriangle, Layers, Calendar,
  StopCircle, Info, ChevronLeft, ChevronRight, Database
} from 'lucide-react';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { cn } from '../utils/cn';

const PAGE_SIZE = 10;

// ─── Status Badge ─────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    success: { variant: 'success', icon: CheckCircle2, label: 'Success' },
    failed:  { variant: 'error',   icon: XCircle,      label: 'Failed'  },
    running: { variant: 'info',    icon: RefreshCw,    label: 'Processing' },
  };
  const cfg = map[status] || { variant: 'slate', icon: Info, label: status };
  const Icon = cfg.icon;
  return (
    <Badge variant={cfg.variant} className="px-2 py-0.5 rounded-md gap-1.5 border">
      <Icon size={12} className={status === 'running' ? 'animate-spin' : ''} />
      <span className="font-semibold text-[10px] uppercase tracking-wider">{cfg.label}</span>
    </Badge>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────
const DetailModal = ({ transfer, onClose, onDelete, onCancel }) => {
  if (!transfer) return null;
  const duration = transfer.execution_time != null
    ? `${transfer.execution_time}s`
    : transfer.completed_at
      ? `${Math.round((new Date(transfer.completed_at) - new Date(transfer.started_at)) / 1000)}s`
      : '—';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.98, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.98, opacity: 0, y: 10 }}
          className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">Transfer Details</h2>
              <StatusBadge status={transfer.status} />
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              {[
                { label: 'Table Name', value: transfer.table_name, icon: Database },
                { label: 'Job Hash', value: `JOB-${String(transfer.id).padStart(4, '0')}`, icon: Info },
                { label: 'Source', value: transfer.source_connection_name || '—', icon: Database },
                { label: 'Destination', value: transfer.destination_connection_name || '—', icon: ArrowUpRight },
                { label: 'Execution', value: duration, icon: Clock },
                { label: 'Rows Handled', value: (transfer.rows_transferred || 0).toLocaleString(), icon: Layers },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{label}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-slate-100">
               <div className="grid grid-cols-2 gap-8">
                 <div>
                   <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Started At</p>
                   <p className="text-sm font-medium text-slate-900">{new Date(transfer.started_at).toLocaleString()}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Completed At</p>
                   <p className="text-sm font-medium text-slate-900">{transfer.completed_at ? new Date(transfer.completed_at).toLocaleString() : '—'}</p>
                 </div>
               </div>
            </div>

            {transfer.error_message && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-lg">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle size={14} className="text-rose-600" />
                  <p className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider">Error Message</p>
                </div>
                <p className="text-sm text-rose-700 leading-relaxed">{transfer.error_message}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/20">
            <button
              onClick={() => { onDelete(transfer.id); onClose(); }}
              className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 size={14} /> Remove Entry
            </button>
            <div className="flex gap-2">
              {transfer.status === 'running' && (
                <Button variant="outline" size="sm" onClick={() => { onCancel(transfer.id); onClose(); }} className="text-rose-600 border-rose-200 hover:bg-rose-50">
                  Stop Transfer
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={onClose}>Close</Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ─── Confirm Delete Modal ─────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onCancel} />
    <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-6">
      <div className="w-10 h-10 bg-rose-50 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
        <Trash2 size={20} className="text-rose-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">Are you sure?</h3>
      <p className="text-sm text-slate-500 mb-6">{message}</p>
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={onConfirm}>Confirm</Button>
      </div>
    </motion.div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────
const History = () => {
  const location = useLocation();
  const initialStatus = new URLSearchParams(location.search).get('status') || 'all';

  const [transfers, setTransfers]       = useState([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm]     = useState('');
  const [filterStatus, setFilterStatus] = useState(initialStatus);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [confirmDelete, setConfirmDelete]       = useState(null);
  const [page, setPage]                         = useState(1);
  const [toast, setToast]                       = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTransfers = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);
    try {
      const res = await api.get('/transfers/');
      setTransfers(res.data);
    } catch (err) {
      showToast('Failed to load transfers', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchTransfers(); }, [fetchTransfers]);

  useEffect(() => {
    const hasRunning = transfers.some(t => t.status === 'running');
    if (!hasRunning) return;
    const id = setInterval(() => fetchTransfers(true), 8000);
    return () => clearInterval(id);
  }, [transfers, fetchTransfers]);

  const filtered = transfers.filter(t => {
    const s = searchTerm.toLowerCase();
    const matchSearch =
      (t.table_name || '').toLowerCase().includes(s) ||
      (t.source_connection_name || '').toLowerCase().includes(s) ||
      (t.destination_connection_name || '').toLowerCase().includes(s);
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => setPage(1), [searchTerm, filterStatus]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transfers/${id}`);
      setTransfers(prev => prev.filter(t => t.id !== id));
      showToast('Record deleted');
    } catch { showToast('Delete failed', 'error'); }
    setConfirmDelete(null);
  };

  const handleCancel = async (id) => {
    try {
      await api.patch(`/transfers/${id}/cancel`);
      fetchTransfers(true);
      showToast('Transfer stopped');
    } catch { showToast('Cancel failed', 'error'); }
  };

  const handleDeleteAll = async () => {
    try {
      await Promise.all(filtered.map(t => api.delete(`/transfers/${t.id}`)));
      setTransfers(prev => prev.filter(t => !filtered.find(f => f.id === t.id)));
      showToast(`${filtered.length} entries removed`);
    } catch { showToast('Bulk delete failed', 'error'); }
    setConfirmDelete(null);
  };

  const handleExport = () => {
    const headers = ['ID', 'Table', 'Source', 'Destination', 'Status', 'Rows', 'Duration', 'Started', 'Completed', 'Error'];
    const rows = filtered.map(t => [
      t.id,
      t.table_name,
      t.source_connection_name || '',
      t.destination_connection_name || '',
      t.status,
      t.rows_transferred || 0,
      t.execution_time || '',
      new Date(t.started_at).toISOString(),
      t.completed_at ? new Date(t.completed_at).toISOString() : '',
      (t.error_message || '').replace(/,/g, ';'),
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `transfer_history_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    showToast('Registry exported');
  };

  const total   = transfers.length;
  const success = transfers.filter(t => t.status === 'success').length;
  const failed  = transfers.filter(t => t.status === 'failed').length;
  const running = transfers.filter(t => t.status === 'running').length;
  const totalRows = transfers.reduce((a, t) => a + (t.rows_transferred || 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Transfer Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Audit trail of all data movement across your connected nodes.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => fetchTransfers(true)} isLoading={isRefreshing} icon={RefreshCw} className="h-10">
            Refresh
          </Button>
          <Button variant="default" onClick={handleExport} icon={Download} className="h-10 px-5">
            Export Logs
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Jobs', val: total, icon: HistoryIcon, color: 'text-slate-600' },
          { label: 'Completed', val: success, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Failed', val: failed, icon: XCircle, color: 'text-rose-600' },
          { label: 'Active', val: running, icon: RefreshCw, color: 'text-blue-600', spin: true },
        ].map(({ label, val, icon: Icon, color, spin }) => (
          <Card key={label} className="py-4 px-5 border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-slate-50 dark:bg-slate-800 ${color}`}>
                <Icon size={18} className={spin && val > 0 ? 'animate-spin' : ''} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">{val}</p>
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-1">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500/30 transition-all placeholder:text-slate-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-4 text-sm font-medium text-slate-600 dark:text-slate-300 outline-none focus:border-brand-500/30 transition-all cursor-pointer h-10"
        >
          <option value="all">All States</option>
          <option value="success">Success Only</option>
          <option value="failed">Failures Only</option>
          <option value="running">In Progress</option>
        </select>
        {filtered.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => setConfirmDelete({ bulk: true })}
            className="text-rose-600 hover:bg-rose-50 h-10 px-4 text-xs font-semibold"
            icon={Trash2}
          >
            Clear List
          </Button>
        )}
      </div>

      {/* Table */}
      <Card padding="none" className="border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-sm bg-white dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <tr className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Job Reference</th>
                <th className="px-6 py-4">Data Route</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Records</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="7" className="px-6 py-5">
                      <div className="h-4 bg-slate-50 rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : paginated.length > 0 ? (
                paginated.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                    onClick={() => setSelectedTransfer(item)}
                  >
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-slate-500">
                        #{String(item.id).padStart(4, '0')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">{item.table_name}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium mt-0.5">
                        <span>{item.source_connection_name}</span>
                        <ArrowRight size={10} className="text-slate-300" />
                        <span>{item.destination_connection_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700">
                        {item.rows_transferred?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {item.execution_time ? `${item.execution_time}s` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-slate-900">
                        {new Date(item.started_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(item.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.status === 'running' && (
                          <button onClick={(e) => { e.stopPropagation(); handleCancel(item.id); }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                            <StopCircle size={15} />
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setConfirmDelete({ id: item.id }); }} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
                    <div className="max-w-xs mx-auto">
                      <HistoryIcon size={32} className="mx-auto text-slate-200 mb-3" />
                      <p className="text-sm font-semibold text-slate-900">No transfer records</p>
                      <p className="text-xs text-slate-500 mt-1">There are no transfer logs matching your current filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && filtered.length > PAGE_SIZE && (
           <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 flex items-center justify-between">
             <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
               Page {page} of {totalPages}
             </p>
             <div className="flex gap-2">
               <button
                 disabled={page === 1}
                 onClick={() => setPage(p => p - 1)}
                 className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 disabled:opacity-40 transition-opacity"
               >
                 <ChevronLeft size={16} className="text-slate-600" />
               </button>
               <button
                 disabled={page === totalPages}
                 onClick={() => setPage(p => p + 1)}
                 className="p-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-40 transition-opacity"
               >
                 <ChevronRight size={16} className="text-slate-600" />
               </button>
             </div>
           </div>
        )}
      </Card>

      {/* Detail Modal */}
      {selectedTransfer && (
        <DetailModal
          transfer={selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
          onDelete={(id) => setConfirmDelete({ id })}
          onCancel={handleCancel}
        />
      )}

      {/* Confirm Modal */}
      {confirmDelete && (
        <ConfirmModal
          message={
            confirmDelete.bulk
              ? `Remove ${filtered.length} transfer records from your audit log permanently?`
              : 'Permanently remove this transfer record from the history log?'
          }
          onConfirm={() => confirmDelete.bulk ? handleDeleteAll() : handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed bottom-6 right-6 z-[200] px-4 py-2.5 rounded-lg shadow-lg border text-xs font-semibold flex items-center gap-2 ${
              toast.type === 'error' ? 'bg-white border-rose-100 text-rose-800' : 'bg-white border-emerald-100 text-emerald-800'
            }`}
          >
            {toast.type === 'error' ? <AlertTriangle size={14} className="text-rose-500" /> : <CheckCircle2 size={14} className="text-emerald-500" />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default History;
