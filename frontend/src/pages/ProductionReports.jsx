import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Download, Printer, Filter, Calendar, Scale, Layers } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { productionService } from '../services/productionService';
import { useToast } from '../context/ToastContext';

import { exportService } from '../services/exportService';

export const ProductionReports = () => {
  const { addToast } = useToast();
  const [plans, setPlans] = useState([]);
  const [summary, setSummary] = useState({
    total_plans: 0,
    total_yarn_planned_kg: 0,
    total_expected_fabric_meters: 0,
    avg_yarn_utilization: 0,
    avg_production_efficiency: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', search: '' });
  const [exportingType, setExportingType] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [plansRes, summaryRes] = await Promise.all([
        productionService.getPlans(filters),
        productionService.getSummary()
      ]);
      if (plansRes?.data) setPlans(plansRes.data);
      if (summaryRes?.data) setSummary(summaryRes.data);
    } catch (e) {
      console.error(e);
      addToast('Failed to load production reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExportingType('excel');
      addToast('Generating Production Planning Excel workbook...', 'info');
      const res = await exportService.exportProductionExcel(filters);
      addToast(`Downloaded: ${res?.filename || 'Production Excel'}`, 'success');
    } catch (err) {
      addToast(err.message || 'Export failed', 'error');
    } finally {
      setExportingType(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-orange-brand" />
            Yarn-to-Fabric Production Analysis Report
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Aggregated factory yarn consumption, production yields, leftover buffers, and utilization efficiency.
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
            disabled={plans.length === 0 || !!exportingType}
            onClick={handleExportExcel}
          >
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-dark-card border border-dark-border shadow-card">
          <span className="text-xs text-gray-400 font-medium">Total Production Plans</span>
          <div className="text-2xl font-bold text-white mt-1">
            {summary.total_plans || plans.length}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-dark-card border border-dark-border shadow-card">
          <span className="text-xs text-gray-400 font-medium">Total Yarn Allocated</span>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {Number(summary.total_yarn_planned_kg || 0).toLocaleString()} kg
          </div>
        </div>

        <div className="p-4 rounded-xl bg-dark-card border border-dark-border shadow-card">
          <span className="text-xs text-gray-400 font-medium">Expected Usable Fabric</span>
          <div className="text-2xl font-bold text-orange-brand font-mono mt-1">
            {Number(summary.total_expected_fabric_meters || 0).toLocaleString()} m
          </div>
        </div>

        <div className="p-4 rounded-xl bg-dark-card border border-dark-border shadow-card">
          <span className="text-xs text-gray-400 font-medium">Avg Yarn Utilization</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {Number(summary.avg_yarn_utilization || 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-end gap-3 p-4 bg-dark-card border border-dark-border rounded-xl">
        <div className="w-full sm:w-64">
          <Input
            label="Search Article or Plan ID"
            placeholder="e.g. Poplin, PLN-..."
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
        <Button variant="secondary" onClick={fetchReports} className="mb-0.5">
          Apply Filter
        </Button>
      </div>

      {/* Report Table */}
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Plan ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Article</TableHead>
            <TableHead>Width & Density</TableHead>
            <TableHead>Yarn Allocated</TableHead>
            <TableHead>Expected Fabric</TableHead>
            <TableHead>Surplus Buffer</TableHead>
            <TableHead>Utilization</TableHead>
            <TableHead>Efficiency</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                Generating production report...
              </TableCell>
            </TableRow>
          ) : plans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                No production plans match filter criteria.
              </TableCell>
            </TableRow>
          ) : (
            plans.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-xs text-orange-brand font-semibold">
                  {p.plan_id}
                </TableCell>
                <TableCell>
                  <Badge variant={p.plan_type === 'yarn_to_fabric' ? 'orange' : 'neutral'} size="sm">
                    {p.plan_type === 'yarn_to_fabric' ? 'Yarn → Fabric' : 'Fabric → Yarn'}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-white">
                  {p.article_name}
                </TableCell>
                <TableCell className="font-mono text-gray-300 text-xs">
                  {p.width}" | {p.epi}x{p.ppi}
                </TableCell>
                <TableCell className="font-mono text-white text-xs">
                  {p.available_yarn_kg.toLocaleString()} kg
                </TableCell>
                <TableCell className="font-mono text-orange-brand font-bold text-xs">
                  {p.expected_usable_meters ? p.expected_usable_meters.toLocaleString() : p.target_fabric_meters?.toLocaleString()} m
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {p.total_remaining_kg > 0 ? (
                    <span className="text-amber-400">{p.total_remaining_kg} kg surplus</span>
                  ) : (
                    <span className="text-emerald-400">0 kg</span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-orange-brand font-bold text-xs">
                  {p.yarn_utilization_pct}%
                </TableCell>
                <TableCell className="font-mono text-emerald-400 font-bold text-xs">
                  {p.production_efficiency_pct}%
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
