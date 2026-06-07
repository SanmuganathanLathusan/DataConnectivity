import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  Database, 
  Table as TableIcon, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Layers,
  ChevronLeft,
  ShieldCheck,
  Zap,
  Rocket
} from 'lucide-react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { cn } from '../utils/cn';

const TransferWizard = () => {
  const [step, setStep] = useState(1);
  const [connections, setConnections] = useState([]);
  const [sourceId, setSourceId] = useState('');
  const [destId, setDestId] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [selectedSchema, setSelectedSchema] = useState('public');
  const [selectedTable, setSelectedTable] = useState('');
  const [sourceColumns, setSourceColumns] = useState([]);
  const [mapping, setMapping] = useState({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/connections/').then(res => setConnections(res.data));
  }, []);

  const handleSourceSelect = async (id) => {
    setSourceId(id);
    setMetadata(null);
    try {
      const res = await api.get(`/discovery/${id}/metadata`);
      setMetadata(res.data);
      setStep(2);
    } catch (err) {
      setError("Unable to retrieve database metadata.");
    }
  };

  const handleTableSelect = async (schema, table) => {
    setSelectedSchema(schema);
    setSelectedTable(table);
    try {
      const res = await api.get(`/discovery/${sourceId}/table-columns`, { params: { schema, table_name: table } });
      setSourceColumns(res.data);
      setStep(3);
    } catch (err) {
      setError("Unable to retrieve table columns.");
    }
  };

  const handleDestSelect = async (id) => {
    setDestId(id);
    setStep(4);
    const initialMapping = {};
    sourceColumns.forEach(c => {
      initialMapping[c.name] = c.name;
    });
    setMapping(initialMapping);
  };

  const formatApiError = (detail) => {
    if (Array.isArray(detail)) {
      return detail
        .map((item) => item?.msg || item?.message || 'Validation error')
        .join('; ');
    }

    if (typeof detail === 'string') {
      return detail;
    }

    if (detail && typeof detail === 'object') {
      return detail.msg || detail.message || 'The transfer task could not be started.';
    }

    return 'The transfer task could not be started.';
  };

  const executeTransfer = async () => {
    setIsExecuting(true);
    setError('');
    try {
      await api.post('/transfers/', {
        source_connection_id: sourceId,
        destination_connection_id: destId,
        table_name: selectedTable,
        source_schema: selectedSchema,
        dest_schema: 'public',
        column_mapping: mapping
      });
      navigate('/history');
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail || err.response?.data));
      setIsExecuting(false);
    }
  };

  const steps = [
    { n: 1, label: 'Source', icon: Database },
    { n: 2, label: 'Table',  icon: TableIcon },
    { n: 3, label: 'Destination', icon: ArrowRightLeft },
    { n: 4, label: 'Mapping',    icon: Layers },
    { n: 5, label: 'Confirm', icon: Rocket }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 tracking-tight">New Data Transfer</h1>
           <p className="text-slate-500 text-sm mt-1">Configure your migration pipeline in five easy steps.</p>
        </div>
        
        {/* Stepper */}
        <div className="flex items-center gap-2 p-1.5 bg-white rounded-xl border border-slate-200">
          {steps.map((s) => (
            <div key={s.n} className="flex items-center">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
                step === s.n ? 'bg-brand-600 text-white' : 
                step > s.n ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400'
              )}>
                <div className="w-5 h-5 flex items-center justify-center">
                  {step > s.n ? <CheckCircle2 size={14} /> : <s.icon size={14} />}
                </div>
                <span className="text-xs font-semibold hidden sm:inline">{s.label}</span>
              </div>
              {s.n < 5 && <ChevronRight size={14} className="text-slate-200 mx-1" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <Card padding="none" className="border-slate-200 min-h-[500px] flex flex-col relative overflow-hidden bg-white">
             {/* Progress Bar */}
             <div className="h-1 bg-slate-50">
               <motion.div 
                 className="h-full bg-brand-600"
                 animate={{ width: `${(step / 5) * 100}%` }}
               />
             </div>

             <div className="p-8 md:p-10 flex-1">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div 
                      key="step1"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Select Source Database</h2>
                        <p className="text-sm text-slate-500">Choose the database you want to extract data from.</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {connections.map(c => (
                          <button
                            key={c.id}
                            onClick={() => handleSourceSelect(c.id)}
                            className="group flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-brand-500 hover:bg-slate-50 transition-all text-left"
                          >
                            <div className="p-2.5 bg-slate-100 text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 rounded-lg transition-colors">
                              <Database size={20} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                              <p className="text-xs text-slate-500 uppercase tracking-tight">{c.db_type}</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-300" />
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div 
                      key="step2"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                         <div>
                            <h2 className="text-lg font-bold text-slate-900">Choose Table</h2>
                            <p className="text-sm text-slate-500">Select the specific table to be migrated.</p>
                         </div>
                         <Input
                           type="text"
                           placeholder="Filter tables..."
                           className="sm:w-48 py-2"
                           value={tableSearch}
                           onChange={(e) => setTableSearch(e.target.value)}
                         />
                      </div>

                      <div className="max-h-[350px] overflow-y-auto pr-2 space-y-6">
                        {metadata && Object.entries(metadata).map(([schema, data]) => {
                           const filteredTables = data.tables.filter(t => t.toLowerCase().includes(tableSearch.toLowerCase()));
                           if (tableSearch && filteredTables.length === 0) return null;
                           
                           return (
                             <div key={schema} className="space-y-3">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{schema}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {filteredTables.map(table => (
                                    <button
                                      key={table}
                                      onClick={() => handleTableSelect(schema, table)}
                                      className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:border-brand-500 hover:bg-slate-50 transition-all text-left"
                                    >
                                      <TableIcon size={16} className="text-slate-400" />
                                      <span className="text-sm font-medium text-slate-700">{table}</span>
                                    </button>
                                  ))}
                                </div>
                             </div>
                           );
                        })}
                      </div>
                      
                      <div className="pt-6 border-t border-slate-100 flex justify-between">
                        <Button variant="ghost" size="sm" onClick={() => setStep(1)} icon={ChevronLeft}>Source</Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div 
                      key="step3"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Destination</h2>
                        <p className="text-sm text-slate-500">Choose the target database for this transfer.</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {connections.filter(c => c.id.toString() !== sourceId).map(c => (
                          <button
                            key={c.id}
                            onClick={() => handleDestSelect(c.id)}
                            className="group flex items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-brand-500 hover:bg-slate-50 transition-all text-left"
                          >
                            <div className="p-2.5 bg-slate-100 text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 rounded-lg transition-colors">
                              <ArrowRightLeft size={20} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                              <p className="text-xs text-slate-500 uppercase tracking-tight">{c.db_type}</p>
                            </div>
                            <ChevronRight size={16} className="text-slate-300" />
                          </button>
                        ))}
                      </div>
                      <div className="pt-6 border-t border-slate-100 flex justify-between">
                        <Button variant="ghost" size="sm" onClick={() => setStep(2)} icon={ChevronLeft}>Table</Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div 
                      key="step4"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-6"
                    >
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">Column Mapping</h2>
                        <p className="text-sm text-slate-500">Map source fields to destination columns.</p>
                      </div>
                      
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                         <div className="grid grid-cols-2 px-6 py-3 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                           <span>Source Field</span>
                           <span>Target Field</span>
                         </div>
                         <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-100">
                           {sourceColumns.map(col => (
                             <div key={col.name} className="grid grid-cols-2 gap-6 p-4 items-center">
                               <div>
                                 <p className="text-sm font-semibold text-slate-900">{col.name}</p>
                                 <p className="text-[10px] text-slate-400 font-medium">{col.type}</p>
                               </div>
                               <Input 
                                 value={mapping[col.name]}
                                 onChange={(e) => setMapping({...mapping, [col.name]: e.target.value})}
                                 className="text-xs py-1.5"
                               />
                             </div>
                           ))}
                         </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                        <Button variant="ghost" size="sm" onClick={() => setStep(3)} icon={ChevronLeft}>Destination</Button>
                        <Button onClick={() => setStep(5)} icon={ArrowRight}>Review Task</Button>
                      </div>
                    </motion.div>
                  )}

                  {step === 5 && (
                    <motion.div 
                      key="step5"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="space-y-6 text-center"
                    >
                      <div className="py-12">
                         <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Rocket size={32} />
                         </div>
                         <h2 className="text-2xl font-bold text-slate-900">Almost Done</h2>
                         <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">
                           Review the transfer configuration below before initiating the process.
                         </p>
                      </div>

                      <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-4 max-w-md mx-auto">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-medium">Source</span>
                          <span className="text-sm font-bold text-slate-900">
                            {connections.find(c => c.id.toString() === sourceId)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-medium">Table</span>
                          <span className="text-sm font-bold text-slate-900">{selectedTable}</span>
                        </div>
                        <div className="border-t border-slate-200 mt-2 pt-2"></div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-medium">Destination</span>
                          <span className="text-sm font-bold text-slate-900">
                            {connections.find(c => c.id.toString() === destId)?.name}
                          </span>
                        </div>
                      </div>

                      {error && (
                        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium flex items-center gap-2 justify-center">
                          <AlertTriangle size={16} />
                          {error}
                        </div>
                      )}

                      <div className="flex flex-col gap-3 py-6 max-w-xs mx-auto">
                        <Button onClick={executeTransfer} isLoading={isExecuting} size="lg">Start Transfer</Button>
                        <button disabled={isExecuting} onClick={() => setStep(4)} className="text-slate-400 text-xs font-semibold hover:text-slate-600">Back to Mapping</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
           </Card>
        </div>

        <div className="space-y-6">
           <Card className="border-slate-200 bg-slate-50/50">
             <div className="flex items-center gap-3 mb-6">
                <ShieldCheck size={20} className="text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">Security Check</h4>
             </div>
             <ul className="space-y-3">
               {[
                 { t: 'Data Encryption', d: 'Secure SSL/TLS transmission.' },
                 { t: 'Transaction Support', d: 'Rollback on failures.' },
                 { t: 'Schema Discovery', d: 'Automated type matching.' }
               ].map((item, i) => (
                 <li key={i} className="space-y-0.5">
                   <p className="text-xs font-semibold text-slate-700">{item.t}</p>
                   <p className="text-[11px] text-slate-500 leading-relaxed">{item.d}</p>
                 </li>
               ))}
             </ul>
           </Card>
           
           <Card className="bg-slate-900 text-white border-transparent">
              <div className="flex items-center gap-2 mb-6">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                 <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Transfer Info</h4>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Target Table</p>
                  <p className="text-sm font-semibold">{selectedTable || 'Not selected'}</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <p className="text-[10px] text-slate-500 font-bold uppercase">Estimated Duration</p>
                  <div className="flex items-center gap-1">
                    <Zap size={10} className="text-amber-500" />
                    <span className="text-xs font-bold text-white">~2.5m</span>
                  </div>
                </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default TransferWizard;
