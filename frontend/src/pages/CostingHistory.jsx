import React, { useState, useEffect } from 'react';
import {
  Search,
  Copy,
  Trash2,
  Eye,
  Download,
  Filter,
  RefreshCw,
  Plus
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { costingService } from '../services/costingService';
import { exportService } from '../services/exportService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const CostingHistory = ({ onNavigate }) => {
  const { user, isAdmin } = useAuth();
  const { addToast } = useToast();
  const [costings, setCostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [exportingType, setExportingType] = useState(null);

  const hasExportPerm = isAdmin || (user?.permissions || []).includes('COSTING_EXPORT');

  useEffect(() => {
    loadCostings();
  }, [search]);

  const loadCostings = async () => {
    try {
      setLoading(true);
      const res = await costingService.getAll({ search });
      if (res?.data) {
        setCostings(res.data);
      }
    } catch (e) {
      console.error('Error fetching costings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id, e) => {
    e.stopPropagation();
    try {
      setActionLoading(id);
      const res = await costingService.duplicate(id);
      if (res.success) {
        addToast(`Cloned costing: ${res.data.costing_id}`, 'success');
        loadCostings();
      }
    } catch (err) {
      addToast('Failed to duplicate costing: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this costing record?')) return;
    try {
      setActionLoading(id);
      await costingService.delete(id);
      addToast('Costing record deleted successfully', 'success');
      loadCostings();
    } catch (err) {
      addToast('Delete failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportingType('excel');
      addToast('Generating Excel workbook for matching records...', 'info');
      const res = await exportService.exportCostingsExcel({ search });
      addToast(`Downloaded: ${res?.filename || 'Costings Excel'}`, 'success');
    } catch (err) {
      addToast(err.message || 'Export failed.', 'error');
    } finally {
      setExportingType(null);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExportingType('csv');
      addToast('Preparing CSV for matching records...', 'info');
      const res = await exportService.exportCostingsCsv({ search });
      addToast(`Downloaded: ${res?.filename || 'Costings CSV'}`, 'success');
    } catch (err) {
      addToast(err.message || 'Export failed.', 'error');
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Costing History</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Browse, search and duplicate past calculated grey fabric specifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasExportPerm && (
            <>
              <Button
                variant="primary"
                size="sm"
                icon={Download}
                loading={exportingType === 'excel'}
                disabled={costings.length === 0 || !!exportingType}
                onClick={handleExportExcel}
              >
                Export Excel
              </Button>
              <Button
                variant="secondary"
                size="sm"
                loading={exportingType === 'csv'}
                disabled={costings.length === 0 || !!exportingType}
                onClick={handleExportCsv}
              >
                Export CSV
              </Button>
            </>
          )}
          <Button variant="primary" size="sm" icon={Plus} onClick={() => onNavigate('new-costing')}>
            New Costing
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-dark-card border border-dark-border rounded-xl">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search article name, code, or CST ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131419] border border-dark-border rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-brand"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={loadCostings} title="Refresh">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs text-gray-400 font-mono">
            {costings.length} records found
          </span>
        </div>
      </div>

      {/* High-density Table */}
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Costing ID</TableHead>
            <TableHead>Article Spec</TableHead>
            <TableHead>Width</TableHead>
            <TableHead>EPI x PPI</TableHead>
            <TableHead>Counts (W x F)</TableHead>
            <TableHead>GSM</TableHead>
            <TableHead>Warp Cost</TableHead>
            <TableHead>Weft Cost</TableHead>
            <TableHead className="text-right">Grey Cost (PKR/Mtr)</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                Loading costing history...
              </TableCell>
            </TableRow>
          ) : costings.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                No matching grey fabric costings found.
              </TableCell>
            </TableRow>
          ) : (
            costings.map((c) => (
              <TableRow key={c.id} onClick={() => onNavigate('costing-details', c.id)}>
                <TableCell className="font-mono text-xs text-orange-brand font-semibold">
                  {c.costing_id}
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-white">{c.article_name}</div>
                  <div className="text-[11px] text-gray-500 font-mono">{c.fabric_code}</div>
                </TableCell>
                <TableCell className="text-gray-300">{c.width}"</TableCell>
                <TableCell className="text-gray-300 font-mono text-xs">
                  {c.epi} x {c.ppi}
                </TableCell>
                <TableCell className="text-gray-300 font-mono text-xs">
                  {c.warp_count}s x {c.weft_count}s
                </TableCell>
                <TableCell className="text-gray-300 font-mono text-xs">
                  {c.gsm} g/m²
                </TableCell>
                <TableCell className="text-gray-300">Rs. {c.warp_cost.toFixed(2)}</TableCell>
                <TableCell className="text-gray-300">Rs. {c.weft_cost.toFixed(2)}</TableCell>
                <TableCell className="text-right font-bold text-orange-brand text-sm font-mono">
                  Rs. {c.grey_cost_per_meter.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate('costing-details', c.id);
                      }}
                      title="View Details"
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222530] rounded transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDuplicate(c.id, e)}
                      title="Duplicate"
                      disabled={actionLoading === c.id}
                      className="p-1.5 text-gray-400 hover:text-orange-brand hover:bg-[#222530] rounded transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(c.id, e)}
                        title="Delete (Admin Only)"
                        disabled={actionLoading === c.id}
                        className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-[#222530] rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
