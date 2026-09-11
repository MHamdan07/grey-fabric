import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Printer, Filter, Calendar } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { reportService } from '../services/mastersService';
import { exportService } from '../services/exportService';
import { useToast } from '../context/ToastContext';

export const Reports = () => {
  const { addToast } = useToast();
  const [reportData, setReportData] = useState({
    summary: { totalCostings: 0, averageGreyCostPerMeter: 0, averageGsm: 0 },
    data: []
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', search: '' });

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await reportService.getCostingsReport(filters);
      if (res?.data) {
        setReportData({
          summary: res.summary,
          data: res.data
        });
        if (filters.search || filters.startDate || filters.endDate) {
          addToast(`Report updated: ${res.data.length} records matching criteria`, 'info');
        }
      }
    } catch (e) {
      console.error(e);
      addToast('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const [exportingType, setExportingType] = useState(null);

  const handleExportExcel = async () => {
    try {
      setExportingType('excel');
      addToast('Generating Excel report...', 'info');
      const res = await exportService.exportCostingsExcel(filters);
      addToast(`Downloaded: ${res?.filename || 'Report Excel'}`, 'success');
    } catch (err) {
      addToast(err.message || 'Export failed', 'error');
    } finally {
      setExportingType(null);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExportingType('csv');
      addToast('Preparing CSV report...', 'info');
      const res = await exportService.exportCostingsCsv(filters);
      addToast(`Downloaded: ${res?.filename || 'Report CSV'}`, 'success');
    } catch (err) {
      addToast(err.message || 'Export failed', 'error');
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-orange-brand" />
            Grey Fabric Costing Analysis Report
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Comprehensive production costing ledger, density weight stats, and yarn expenditure analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
            Print
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            loading={exportingType === 'excel'}
            disabled={reportData.data.length === 0 || !!exportingType}
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            loading={exportingType === 'csv'}
            disabled={reportData.data.length === 0 || !!exportingType}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-dark-card border border-dark-border shadow-card">
          <span className="text-xs text-gray-400 font-medium">Total Costings Analyzed</span>
          <div className="text-2xl font-bold text-white mt-1">
            {reportData.summary.totalCostings}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-dark-card border border-dark-border shadow-card">
          <span className="text-xs text-gray-400 font-medium">Average Grey Cost / Meter</span>
          <div className="text-2xl font-bold text-orange-brand font-mono mt-1">
            Rs. {reportData.summary.averageGreyCostPerMeter.toFixed(2)}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-dark-card border border-dark-border shadow-card">
          <span className="text-xs text-gray-400 font-medium">Average Fabric GSM</span>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {reportData.summary.averageGsm.toFixed(1)} g/m²
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-end gap-3 p-4 bg-dark-card border border-dark-border rounded-xl">
        <div className="w-full sm:w-64">
          <Input
            label="Search Article or Code"
            placeholder="e.g. Poplin, ART-..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <div className="w-40">
          <Input
            label="Start Date"
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
        </div>
        <div className="w-40">
          <Input
            label="End Date"
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>
        <Button variant="secondary" onClick={fetchReport} className="mb-0.5">
          Apply Filter
        </Button>
      </div>

      {/* Data Table */}
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Costing ID</TableHead>
            <TableHead>Article Spec</TableHead>
            <TableHead>Width</TableHead>
            <TableHead>EPI x PPI</TableHead>
            <TableHead>Counts</TableHead>
            <TableHead>GSM</TableHead>
            <TableHead>Warp Cost</TableHead>
            <TableHead>Weft Cost</TableHead>
            <TableHead>Process</TableHead>
            <TableHead className="text-right">Grey Cost (PKR/Mtr)</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-6 text-gray-500">
                Generating report...
              </TableCell>
            </TableRow>
          ) : reportData.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-6 text-gray-500">
                No costing records match current filter criteria.
              </TableCell>
            </TableRow>
          ) : (
            reportData.data.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs text-orange-brand font-semibold">
                  {r.costing_id}
                </TableCell>
                <TableCell className="font-semibold text-white">
                  {r.article_name}
                </TableCell>
                <TableCell className="text-gray-300 font-mono">{r.width}"</TableCell>
                <TableCell className="text-gray-300 font-mono text-xs">
                  {r.epi}x{r.ppi}
                </TableCell>
                <TableCell className="text-gray-300 font-mono text-xs">
                  {r.warp_count}s x {r.weft_count}s
                </TableCell>
                <TableCell className="text-gray-300 font-mono text-xs">
                  {r.gsm}
                </TableCell>
                <TableCell className="text-gray-300 font-mono text-xs">
                  Rs. {r.warp_cost.toFixed(2)}
                </TableCell>
                <TableCell className="text-gray-300 font-mono text-xs">
                  Rs. {r.weft_cost.toFixed(2)}
                </TableCell>
                <TableCell className="text-gray-300 font-mono text-xs">
                  Rs. {(r.sizing_charges + r.weaving_charges + r.other_charges).toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-orange-brand text-sm">
                  Rs. {r.grey_cost_per_meter.toFixed(2)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
