import { useState, useEffect } from 'react';
import { 
  Database, 
  Table as TableIcon, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  RefreshCw,
  Eye,
  Info,
  Layers,
  Columns,
  Filter,
  Download,
  Loader2,
  ChevronLeft,
  Box
} from 'lucide-react';
import api from '../api/api';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { cn } from '../utils/cn';

const Explorer = () => {
  const [connections, setConnections] = useState([]);
  const [selectedConnId, setSelectedConnId] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSchemas, setExpandedSchemas] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [columns, setColumns] = useState([]);
  const [tableSearch, setTableSearch] = useState('');

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await api.get('/connections/');
        setConnections(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchConnections();
  }, []);

  const fetchMetadata = async (connId) => {
    setIsLoading(true);
    setMetadata(null);
    setSelectedTable(null);
    try {
      const response = await api.get(`/discovery/${connId}/metadata`);
      setMetadata(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSchema = (schema) => {
    setExpandedSchemas(prev => ({ ...prev, [schema]: !prev[schema] }));
  };

  const handleTablePreview = async (schema, tableName) => {
    setSelectedTable({ schema, name: tableName });
    setIsPreviewLoading(true);
    try {
      const [previewRes, colRes] = await Promise.all([
        api.get(`/discovery/${selectedConnId}/table-preview`, { params: { schema, table_name: tableName } }),
        api.get(`/discovery/${selectedConnId}/table-columns`, { params: { schema, table_name: tableName } })
      ]);
      setPreviewData(previewRes.data);
      setColumns(colRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-120px)]">
      {/* Object Browser Sidebar */}
      <Card padding="none" className={cn(
        "w-full lg:w-72 flex flex-col shrink-0 border-slate-200 dark:border-slate-800 overflow-hidden",
        selectedTable && "hidden lg:flex"
      )}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">Database</label>
          <div className="relative">
            <select
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-9 pr-8 outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 appearance-none text-sm font-medium text-slate-900 dark:text-white transition-all cursor-pointer"
              onChange={(e) => {
                const id = e.target.value;
                setSelectedConnId(id);
                if (id) fetchMetadata(id);
              }}
            >
              <option value="">Select connection</option>
              {connections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Database className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
          </div>
        </div>

        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Filter data..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border-transparent rounded-lg py-2 pl-9 pr-3 text-xs outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-slate-200 dark:focus:border-slate-700 transition-all text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 bg-white dark:bg-slate-900">
          {isLoading && <div className="space-y-2 p-2">
            {[1,2,3,4,5].map(i => <div key={i} className="h-9 bg-slate-50 rounded-lg animate-pulse"></div>)}
          </div>}

          {metadata ? Object.entries(metadata).map(([schema, data]) => {
            const filteredTables = data.tables.filter(t => t.toLowerCase().includes(tableSearch.toLowerCase()));
            if (tableSearch && filteredTables.length === 0) return null;
            
            const isOpen = expandedSchemas[schema] || tableSearch;

            return (
              <div key={schema} className="mb-1">
                <button 
                  onClick={() => toggleSchema(schema)}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-lg transition-colors",
                    isOpen ? 'text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-500/10' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <Layers size={14} className={isOpen ? 'text-brand-500' : 'text-slate-400'} />
                    <span>{schema}</span>
                  </div>
                  {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                </button>

                {isOpen && (
                  <div className="ml-4 mt-1 border-l border-slate-100 dark:border-slate-800 pl-1 space-y-0.5">
                    {filteredTables.map(table => (
                      <button
                        key={table}
                        onClick={() => handleTablePreview(schema, table)}
                        className={cn(
                          "w-full flex items-center gap-2 py-1.5 px-3 text-xs rounded-lg transition-all text-left",
                          selectedTable?.name === table && selectedTable?.schema === schema 
                            ? 'text-brand-700 dark:text-brand-400 bg-brand-100/50 dark:bg-brand-500/10 font-semibold' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                        )}
                      >
                        <TableIcon size={12} className={selectedTable?.name === table ? 'text-brand-600' : 'text-slate-400'} />
                        <span className="truncate">{table}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }) : !isLoading && (
            <div className="h-full flex flex-col items-center justify-center p-6 opacity-40">
               <Box size={24} className="mb-2" />
               <p className="text-[10px] font-bold uppercase tracking-wider">No source loaded</p>
            </div>
          )}
        </div>
      </Card>

      {/* Main Container - Explorer Area */}
      <Card padding="none" className="flex-1 flex flex-col border-slate-200 dark:border-slate-800 overflow-hidden min-w-0 bg-white dark:bg-slate-900">
        {selectedTable ? (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30 shrink-0">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedTable(null)}
                  className="lg:hidden p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                >
                  <ChevronLeft size={16} />
                </button>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{selectedTable.name}</h2>
                    <Badge variant="info" size="sm">Table</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
                    <span className="flex items-center gap-1.5"><Layers size={12} /> {selectedTable.schema}</span>
                    <span className="flex items-center gap-1.5"><Columns size={12} /> {columns.length} columns</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleTablePreview(selectedTable.schema, selectedTable.name)}
                  isLoading={isPreviewLoading}
                  icon={RefreshCw}
                >
                  Refresh
                </Button>
                <Button size="sm" variant="secondary" icon={Download}>Export</Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white dark:bg-slate-900 custom-scrollbar">
              {isPreviewLoading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="text-brand-600 animate-spin" size={32} />
                  <p className="text-sm font-medium text-slate-500">Retrieving table data...</p>
                </div>
              ) : (
                <>
                  <section>
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Columns</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {columns.map((col) => (
                        <div 
                          key={col.name} 
                          className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col justify-between transition-colors"
                        >
                          <span className="text-sm font-semibold text-slate-900 dark:text-white truncate mb-2">{col.name}</span>
                          <div className="flex items-center gap-2">
                             <Badge variant="secondary" size="sm" className="bg-white dark:bg-slate-900 text-[10px]">{col.type}</Badge>
                             {col.nullable && <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium italic">NULL</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Raw Data</h3>
                       <div className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                          SAMPLE SIZE: 100 ROWS
                       </div>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                      <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-max">
                          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                              {previewData?.columns.map(col => (
                                <th key={col} className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {previewData?.data.map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                {previewData.columns.map(col => (
                                  <td key={col} className="px-6 py-3 text-xs font-medium text-slate-600 dark:text-slate-300 max-w-[200px] truncate">
                                    {String(row[col]) === 'null' ? <span className="text-slate-300 dark:text-slate-600 italic">null</span> : String(row[col])}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {(!previewData?.data || previewData.data.length === 0) && (
                        <div className="p-12 text-center text-slate-400 text-sm italic">
                          No records found in this table.
                        </div>
                      )}
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-slate-900 p-10">
            <div className="max-w-sm text-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6 mx-auto text-slate-300 dark:text-slate-600">
                <Eye size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Data Explorer</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Connect a database to browse schemas, tables, and live data previews.
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Explorer;
