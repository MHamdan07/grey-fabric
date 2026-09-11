import React, { useState, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  Calendar,
  Filter,
  Check,
  AlertCircle,
  Clock,
  Shield,
  Layers,
  Sparkles,
  Sliders,
  Users,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { exportService } from '../services/exportService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const ExportCenter = () => {
  const { addToast } = useToast();
  const { user, isAdmin } = useAuth();

  const [selectedType, setSelectedType] = useState('costings');
  const [selectedFormat, setSelectedFormat] = useState('xlsx');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');
  const [recordCount, setRecordCount] = useState(null);
  const [counting, setCounting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [statusStep, setStatusStep] = useState('');
  const [recentLogs, setRecentLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const userPerms = user?.permissions || [];
  const hasPerm = (perm) => isAdmin || userPerms.includes(perm);

  const exportTypes = [
    {
      id: 'costings',
      label: 'Grey Fabric Costings',
      icon: FileSpreadsheet,
      perm: 'COSTING_EXPORT',
      desc: 'Fabric construction, theoretical vs adjusted yarn consumption, and unit costs'
    },
    {
      id: 'production',
      label: 'Production Plans',
      icon: Layers,
      perm: 'PRODUCTION_EXPORT',
      desc: 'Yarn allocations, planned fabric targets, process loss, and efficiency'
    },
    {
      id: 'yarns',
      label: 'Yarn Master',
      icon: Layers,
      perm: 'YARN_EXPORT',
      desc: 'Count systems, linear density, suppliers, and rate history catalog'
    },
    {
      id: 'fabrics',
      label: 'Fabric Master',
      icon: Sparkles,
      perm: 'FABRIC_EXPORT',
      desc: 'Reed specs, EPI/PPI density standards, and crimp/wastage norms'
    },
    {
      id: 'charges',
      label: 'Process Charges',
      icon: Sliders,
      perm: 'CHARGES_EXPORT',
      desc: 'Warping, sizing, airjet weaving, inspection tariffs, and units'
    },
    ...(isAdmin
      ? [
          {
            id: 'users',
            label: 'User Accounts',
            icon: Users,
            perm: 'USER_EXPORT',
            desc: 'System operators and access roles (admin only, zero secret leakage)'
          }
        ]
      : [])
  ];

  useEffect(() => {
    fetchCount();
  }, [selectedType, dateFrom, dateTo, search]);

  useEffect(() => {
    if (hasPerm('ACTIVITY_LOG_VIEW') || hasPerm('REPORT_VIEW')) {
      loadLogs();
    }
  }, []);

  const fetchCount = async () => {
    try {
      setCounting(true);
      const isDateFiltered = selectedType === 'costings' || selectedType === 'production';
      const filters = isDateFiltered
        ? { startDate: dateFrom, endDate: dateTo, search }
        : { search };
      const count = await exportService.getCounts(selectedType, filters);
      setRecordCount(count);
    } catch (e) {
      setRecordCount(null);
    } finally {
      setCounting(false);
    }
  };

  const loadLogs = async () => {
    try {
      setLoadingLogs(true);
      const logs = await exportService.getLogs(15);
      setRecentLogs(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      setStatusStep('Preparing Excel export request...');
      await new Promise((r) => setTimeout(r, 200));

      setStatusStep('Fetching matching database records...');
      const filters = {
        startDate: dateFrom,
        endDate: dateTo,
        search
      };
      await new Promise((r) => setTimeout(r, 200));

      setStatusStep('Generating styled workbook...');
      let res;
      if (selectedType === 'costings') {
        if (selectedFormat === 'csv') {
          res = await exportService.exportCostingsCsv(filters);
        } else {
          res = await exportService.exportCostingsExcel(filters);
        }
      } else if (selectedType === 'production') {
        res = await exportService.exportProductionExcel(filters);
      } else if (selectedType === 'yarns') {
        res = await exportService.exportYarnsExcel();
      } else if (selectedType === 'fabrics') {
        res = await exportService.exportFabricsExcel();
      } else if (selectedType === 'charges') {
        res = await exportService.exportChargesExcel();
      } else if (selectedType === 'users') {
        res = await exportService.exportUsersExcel();
      }

      setStatusStep('Downloading file...');
      addToast(`Export completed successfully: ${res?.filename || 'File downloaded'}`, 'success');
      loadLogs();
    } catch (err) {
      addToast(err.message || 'Export generation failed.', 'error');
    } finally {
      setExporting(false);
      setStatusStep('');
    }
  };

  const currentOption = exportTypes.find((t) => t.id === selectedType);
  const isPermitted = currentOption ? hasPerm(currentOption.perm) : false;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Download className="w-5 h-5 text-orange-brand" />
          Export Data Center
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Securely export enterprise textile costings, master catalogs, and production records. All downloads are generated securely on the backend with permission checks and audit logging.
        </p>
      </div>

      {/* 1. Data Type Selection Cards */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-300 block">
          1. Select Dataset to Export
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {exportTypes.map((opt) => {
            const Icon = opt.icon;
            const permitted = hasPerm(opt.perm);
            const isSelected = selectedType === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                disabled={!permitted || exporting}
                onClick={() => setSelectedType(opt.id)}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? 'bg-[#231710] border-orange-brand shadow-glow-sm'
                    : permitted
                    ? 'bg-dark-card border-dark-border hover:border-gray-600'
                    : 'bg-[#121318] border-dark-border/40 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-orange-brand text-white' : 'bg-[#181920] text-gray-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className={`text-xs font-bold block ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                        {opt.label}
                      </span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {opt.perm}
                      </span>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-orange-brand shrink-0" />}
                  {!permitted && <span className="text-[9px] text-red-400 font-mono">Restricted</span>}
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed">
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Dynamic Export Configuration & Filters */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-dark-border">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-orange-brand" />
              2. Query Filters & Workbook Options
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Exports reflect all matching records across the entire database, not limited to UI pagination.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-gray-400">Available:</span>
            <span className="px-3 py-1 rounded-lg bg-[#14151B] border border-dark-border font-mono text-xs font-bold text-orange-brand">
              {counting ? 'Counting...' : `${recordCount !== null ? recordCount : 0} matching records`}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(selectedType === 'costings' || selectedType === 'production') ? (
            <>
              <Input
                label="Date From"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <Input
                label="Date To"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              <Input
                label="Search Keyword (Article, Code, ID)"
                placeholder="e.g. Poplin, Cambric, CST-..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </>
          ) : (
            <div className="md:col-span-3 p-3 bg-[#14151B] rounded-lg border border-dark-border text-xs text-gray-400 flex items-center gap-2">
              <Database className="w-4 h-4 text-orange-brand shrink-0" />
              <span>Full catalog export: all active specifications will be packaged into the workbook.</span>
            </div>
          )}
        </div>

        {/* Format Selection */}
        <div className="space-y-2 pt-2 border-t border-dark-border/40">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">
            File Format
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelectedFormat('xlsx')}
              className={`px-4 py-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-colors ${
                selectedFormat === 'xlsx'
                  ? 'bg-orange-pill border-orange-brand text-white'
                  : 'bg-[#14151B] border-dark-border text-gray-400 hover:text-white'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-orange-brand" />
              <span>Excel Workbook (.xlsx)</span>
              <Badge variant="orange" size="sm">Recommended</Badge>
            </button>

            {selectedType === 'costings' && (
              <button
                type="button"
                onClick={() => setSelectedFormat('csv')}
                className={`px-4 py-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-colors ${
                  selectedFormat === 'csv'
                    ? 'bg-orange-pill border-orange-brand text-white'
                    : 'bg-[#14151B] border-dark-border text-gray-400 hover:text-white'
                }`}
              >
                <span>CSV Text (.csv)</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Tracker */}
        {exporting && (
          <div className="p-4 bg-[#231710] border border-orange-brand/50 rounded-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-orange-brand animate-spin shrink-0" />
            <div>
              <span className="text-white text-xs font-semibold block">{statusStep}</span>
              <span className="text-[10px] text-orange-400">Streaming secure file download...</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          {!isPermitted ? (
            <div className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>You do not have permission ({currentOption?.perm}) to export this data.</span>
            </div>
          ) : (
            <span className="text-xs text-gray-400">
              {recordCount === 0 ? 'No matching records found for these criteria.' : 'Ready to generate.'}
            </span>
          )}

          <Button
            variant="primary"
            size="lg"
            icon={Download}
            loading={exporting}
            disabled={!isPermitted || recordCount === 0}
            onClick={handleExport}
            className="px-8"
          >
            {recordCount === 0 ? 'No Records Found' : `Export ${selectedFormat.toUpperCase()}`}
          </Button>
        </div>
      </div>

      {/* 3. Export Audit Trail (Recent Activity Logs) */}
      {(hasPerm('ACTIVITY_LOG_VIEW') || hasPerm('REPORT_VIEW')) && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-dark-border">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-brand" />
                Recent Export Audit Trail
              </h3>
              <p className="text-[11px] text-gray-400">
                Verified compliance logs recording all business data export events.
              </p>
            </div>

            <Button variant="ghost" size="sm" onClick={loadLogs} disabled={loadingLogs}>
              <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${loadingLogs ? 'animate-spin text-orange-brand' : ''}`} />
            </Button>
          </div>

          <Table>
            <TableHeader>
              <tr>
                <TableHead>Timestamp</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Export Type</TableHead>
                <TableHead>Format</TableHead>
                <TableHead className="text-right">Records</TableHead>
                <TableHead>Client IP</TableHead>
              </tr>
            </TableHeader>
            <TableBody>
              {loadingLogs ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    Loading audit trail...
                  </TableCell>
                </TableRow>
              ) : recentLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    No export logs recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                recentLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs text-gray-400">
                      {log.created_at?.slice(0, 19).replace('T', ' ')}
                    </TableCell>
                    <TableCell className="font-semibold text-white">
                      {log.user_name || 'System Operator'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="orange" size="sm">
                        {log.export_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-300">
                      .{log.file_format}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-white">
                      {log.record_count}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">
                      {log.ip_address || '127.0.0.1'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
