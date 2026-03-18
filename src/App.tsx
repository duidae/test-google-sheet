import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Table, 
  Search, 
  Download, 
  RefreshCw, 
  FileSpreadsheet, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { fetchSheetData, SheetData } from './services/googleSheetService';

const SHEET_ID = '1vDcQDnCCFfQFnCFgTLGKfWC0IFRqVVFh8xiS-8Pki74';

export default function App() {
  const [data, setData] = useState<SheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const sheetData = await fetchSheetData(SHEET_ID);
      setData(sheetData);
    } catch (err) {
      setError('Could not load spreadsheet data. Please ensure the sheet is shared publicly.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredData = data.filter(row => 
    Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#141414] text-[#E4E3E0] rounded-sm">
            <FileSpreadsheet size={24} />
          </div>
          <div>
            <h1 className="font-serif italic text-2xl leading-none">Sheet Explorer</h1>
            <p className="text-[10px] uppercase tracking-widest opacity-50 mt-1 font-mono">Real-time Data Visualization</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH RECORDS..." 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border border-[#141414] py-2 pl-10 pr-4 text-xs font-mono focus:outline-none focus:bg-[#141414] focus:text-[#E4E3E0] transition-all w-full md:w-64 placeholder:opacity-30"
            />
          </div>
          <button 
            onClick={loadData}
            disabled={loading}
            className="p-2 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors disabled:opacity-30"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <main className="p-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-[60vh] flex flex-col items-center justify-center gap-4"
            >
              <div className="w-12 h-12 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
              <p className="font-mono text-xs uppercase tracking-widest animate-pulse">Synchronizing with Google Sheets...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center max-w-md mx-auto"
            >
              <AlertCircle size={48} className="text-red-600" />
              <h2 className="font-serif italic text-xl">Connection Interrupted</h2>
              <p className="text-sm opacity-70">{error}</p>
              <button 
                onClick={loadData}
                className="mt-4 px-6 py-2 bg-[#141414] text-[#E4E3E0] text-xs font-mono uppercase tracking-widest hover:opacity-90 transition-opacity"
              >
                Retry Connection
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#141414] border border-[#141414]">
                {[
                  { label: 'Total Records', value: data.length },
                  { label: 'Filtered', value: filteredData.length },
                  { label: 'Data Points', value: data.length * columns.length },
                  { label: 'Last Updated', value: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                ].map((stat, i) => (
                  <div key={i} className="bg-[#E4E3E0] p-4">
                    <p className="text-[10px] uppercase tracking-widest opacity-50 font-mono">{stat.label}</p>
                    <p className="text-2xl font-serif italic mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Data Grid */}
              <div className="border border-[#141414] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-[#141414]">
                        {columns.map((col) => (
                          <th key={col} className="p-4 text-left font-serif italic text-xs uppercase tracking-wider opacity-50 border-r border-[#141414] last:border-r-0">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((row, rowIndex) => (
                        <motion.tr 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: rowIndex * 0.05 }}
                          key={rowIndex} 
                          className="border-b border-[#141414] last:border-b-0 group hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors cursor-default"
                        >
                          {columns.map((col) => (
                            <td key={col} className="p-4 text-xs font-mono border-r border-[#141414] last:border-r-0 whitespace-nowrap">
                              {row[col] || '-'}
                            </td>
                          ))}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {paginatedData.length === 0 && (
                  <div className="p-12 text-center border-t border-[#141414]">
                    <p className="font-serif italic opacity-50 text-lg">No matching records found</p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4">
                <p className="text-[10px] font-mono uppercase tracking-widest opacity-50">
                  Showing {Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredData.length, currentPage * itemsPerPage)} of {filteredData.length} entries
                </p>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors disabled:opacity-10"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="px-4 py-2 border border-[#141414] font-mono text-xs">
                    {currentPage} / {totalPages || 1}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="p-2 border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors disabled:opacity-10"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-12 p-6 border-t border-[#141414] flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] font-mono uppercase tracking-widest opacity-30">
          Source: Google Spreadsheet ID {SHEET_ID.slice(0, 8)}...
        </p>
        <div className="flex gap-6">
          <a href={`https://docs.google.com/spreadsheets/d/${SHEET_ID}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-mono uppercase tracking-widest hover:underline">
            View Original Sheet
          </a>
          <button 
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + columns.join(",") + "\n" + data.map(r => columns.map(c => r[c]).join(",")).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "sheet_data.csv");
              document.body.appendChild(link);
              link.click();
            }}
            className="text-[10px] font-mono uppercase tracking-widest hover:underline flex items-center gap-1"
          >
            <Download size={10} /> Export CSV
          </button>
        </div>
      </footer>
    </div>
  );
}
