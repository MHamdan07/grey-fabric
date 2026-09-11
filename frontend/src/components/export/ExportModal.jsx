import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, Calendar, Check, AlertCircle, X, Loader2, Database } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { exportService } from '../../services/exportService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

export const ExportModal = ({ isOpen, onClose, initialType = 'costings', initialDays = 30 }) => {
  const { addToast } = useToast();
  const { user, isAdmin } = useAuth();

  const [dataType, setDataType] = useState(initialType);
  const [dateRangeDays, setDateRangeDays] = useState(initialDays);
  const [format, setFormat] = useState('xlsx');
  const [recordCount, setRecordCount] = useState(null);
  const [counting, setCounting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [statusStep, setStatusStep] = useState('');

  const userPerms = user?.permissions || [];
  const hasPerm = (perm) => isAdmin || userPerms.includes(perm);

  const dataOptions = [
    { id: 'costings', label: 'Costing Records', perm: 'COSTING_EXPORT', desc: 'Fabric specs, yarn weights, and cost breakdown' },
    { id: 'production', label: 'Production Plans', perm: 'PRODUCTION_EXPORT', desc: 'Yarn allocations, buffers, bottleneck analysis' },
    { id: 'yarns', label: 'Yarn Master', perm: 'YARN_EXPORT', desc: 'Counts, suppliers, and rate catalog' },
    { id: 'fabrics', label: 'Fabric Master', perm: 'FABRIC_EXPORT', desc: 'Constructions, reed widths, standards' },
    { id: 'charges', label: 'Process Charges', perm: 'CHARGES_EXPORT', desc: 'Sizing, weaving, and inspection tariffs' },
    ...(isAdmin ? [{ id: 'users', label: 'User Accounts', perm: 'USER_EXPORT', desc: 'System operators and access roles (admin only)' }] : [])
  ];

  const dateOptions = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'All Time (No Filter)', days: 0 }
  ];

  useEffect(() => {
    if (isOpen) {
      setDataType(initialType);
      setDateRangeDays(initialDays);
      updateRecordCount(initialType, initialDays);
    }
  }, [isOpen, initialType, initialDays]);

  const getDateFilterParams = (days) => {
    if (!days || days === 0) return {};
    const d = new Date();
    d.setDate(d.getDate() - days);
    return {
      startDate: d.toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10)
    };
  };

  const updateRecordCount = async (type, days) => {
    try {
      setCounting(true);
      const isDateFiltered = type === 'costings' || type === 'production';
      const filters = isDateFiltered ? getDateFilterParams(days) : {};
      const count = await exportService.getCounts(type, filters);
      setRecordCount(count);
    } catch (e) {
      setRecordCount(null);
    } finally {
      setCounting(false);
    }
  };

  const handleTypeChange = (type) => {
    setDataType(type);
    updateRecordCount(type, dateRangeDays);
  };

  const handleDateChange = (days) => {
    setDateRangeDays(days);
    updateRecordCount(dataType, days);
  };

  const handleExecuteExport = async () => {
    try {
      setExporting(true);
      setStatusStep('Preparing export request...');
      await new Promise(r => setTimeout(r, 200));

      setStatusStep('Querying matching database records...');
      const filters = getDateFilterParams(dateRangeDays);
      await new Promise(r => setTimeout(r, 200));

      setStatusStep('Generating Excel workbook...');
      let res;
      if (dataType === 'costings') {
        if (format === 'csv') {
          res = await exportService.exportCostingsCsv(filters);
        } else {
          res = await exportService.exportCostingsExcel(filters);
        }
      } else if (dataType === 'production') {
        res = await exportService.exportProductionExcel(filters);
      } else if (dataType === 'yarns') {
        res = await exportService.exportYarnsExcel();
      } else if (dataType === 'fabrics') {
        res = await exportService.exportFabricsExcel();
      } else if (dataType === 'charges') {
        res = await exportService.exportChargesExcel();
      } else if (dataType === 'users') {
        res = await exportService.exportUsersExcel();
      }

      setStatusStep('Downloading file...');
      addToast(`Export completed successfully: ${res?.filename || 'File downloaded'}`, 'success');
      onClose();
    } catch (err) {
      addToast(err.message || 'Export failed. Please check permissions.', 'error');
    } finally {
      setExporting(false);
      setStatusStep('');
    }
  };

  const activeOption = dataOptions.find(o => o.id === dataType);
  const isPermitted = activeOption ? hasPerm(activeOption.perm) : false;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !exporting && onClose()}
      title="EXPORT DATA"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5 text-xs text-gray-300">
        <p className="text-gray-400">
          Export verified manufacturing business records. Workbooks are formatted with auto-filters, formulas, and calculation breakdowns.
        </p>

        {/* Data Type Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 flex items-center justify-between">
            <span>1. Select Data Type</span>
            {recordCount !== null && (
              <span className="text-orange-brand font-mono font-bold">
                {counting ? 'Counting...' : `${recordCount} records available`}
              </span>
            )}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {dataOptions.map((opt) => {
              const permitted = hasPerm(opt.perm);
              const isSelected = dataType === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={!permitted || exporting}
                  onClick={() => handleTypeChange(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#231710] border-orange-brand shadow-glow-sm'
                      : permitted
                      ? 'bg-[#14151B] border-dark-border hover:border-gray-600'
                      : 'bg-[#121318] border-dark-border/40 opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                      {opt.label}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-orange-brand" />}
                    {!permitted && <span className="text-[9px] text-red-400 font-mono">Restricted</span>}
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Range Options (Relevant for Costings & Production) */}
        {(dataType === 'costings' || dataType === 'production') && (
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block">
              2. Date Range Filter
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {dateOptions.map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  disabled={exporting}
                  onClick={() => handleDateChange(opt.days)}
                  className={`py-2 px-2.5 rounded-lg border text-center transition-colors ${
                    dateRangeDays === opt.days
                      ? 'bg-orange-pill border-orange-brand text-orange-brand font-semibold'
                      : 'bg-[#14151B] border-dark-border hover:border-gray-600 text-gray-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Format Selection */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block">
            3. Export File Format
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={exporting}
              onClick={() => setFormat('xlsx')}
              className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                format === 'xlsx'
                  ? 'bg-orange-pill border-orange-brand text-white'
                  : 'bg-[#14151B] border-dark-border hover:border-gray-600 text-gray-300'
              }`}
            >
              <div>
                <span className="font-bold block text-xs">Excel Workbook (.xlsx)</span>
                <span className="text-[10px] text-gray-400">Multi-sheet styled reports</span>
              </div>
              <Badge variant="orange" size="sm">Recommended</Badge>
            </button>

            {dataType === 'costings' ? (
              <button
                type="button"
                disabled={exporting}
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-colors ${
                  format === 'csv'
                    ? 'bg-orange-pill border-orange-brand text-white'
                    : 'bg-[#14151B] border-dark-border hover:border-gray-600 text-gray-300'
                }`}
              >
                <div>
                  <span className="font-bold block text-xs">CSV Text File (.csv)</span>
                  <span className="text-[10px] text-gray-400">Raw tabular comma-separated data</span>
                </div>
              </button>
            ) : (
              <div className="p-3 rounded-xl border border-dark-border/40 bg-[#121318] text-gray-500 flex items-center">
                <span className="text-[11px]">CSV format available for Costings</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Export Status Progress */}
        {exporting && (
          <div className="p-3 bg-[#231710] border border-orange-brand/40 rounded-xl flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-orange-brand animate-spin shrink-0" />
            <div>
              <span className="text-white font-medium block">{statusStep}</span>
              <span className="text-[10px] text-orange-400">Please do not close window while generating file</span>
            </div>
          </div>
        )}

        {!isPermitted && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>You do not have permission to export {activeOption?.label}. Please contact an administrator.</span>
          </div>
        )}

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-dark-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={exporting}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="primary"
            icon={Download}
            loading={exporting}
            disabled={!isPermitted || recordCount === 0}
            onClick={handleExecuteExport}
          >
            {recordCount === 0 ? 'No Records to Export' : `Export ${format.toUpperCase()}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
