import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Search,
  Trash2,
  Eye,
  Plus,
  Scale,
  Layers,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { productionService } from '../services/productionService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ProductionPlans = ({ onNavigate }) => {
  const { isAdmin } = useAuth();
  const { addToast } = useToast();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadPlans();
  }, [search]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await productionService.getPlans({ search });
      if (res?.data) {
        setPlans(res.data);
      }
    } catch (e) {
      console.error(e);
      addToast('Failed to load production plans ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this production plan?')) return;
    try {
      await productionService.deletePlan(id);
      addToast('Production plan deleted successfully', 'success');
      loadPlans();
    } catch (err) {
      addToast('Delete failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleView = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-orange-brand" />
            Production Planning Ledger
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Archived factory plans for yarn allocation, meter yields, and leftover thread balances.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={Scale}
            onClick={() => onNavigate('yarn-to-fabric')}
          >
            Yarn → Fabric
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => onNavigate('fabric-to-yarn')}
          >
            Fabric → Yarn
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-dark-card border border-dark-border rounded-xl">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search plan ID, article name or fabric code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#131419] border border-dark-border rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-brand"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={loadPlans} title="Refresh">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <span className="text-xs text-gray-400 font-mono">
            {plans.length} plans recorded
          </span>
        </div>
      </div>

      {/* Ledger Table */}
      <Table>
        <TableHeader>
          <tr>
            <TableHead>Plan ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Article Spec</TableHead>
            <TableHead>Available Yarn</TableHead>
            <TableHead>Expected Fabric</TableHead>
            <TableHead>Leftover Yarn Buffer</TableHead>
            <TableHead>Utilization</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                Loading production plans...
              </TableCell>
            </TableRow>
          ) : plans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                No production plans found. Calculate a new plan to record here.
              </TableCell>
            </TableRow>
          ) : (
            plans.map((p) => (
              <TableRow key={p.id} onClick={() => handleView(p)}>
                <TableCell className="font-mono text-xs text-orange-brand font-semibold">
                  {p.plan_id}
                </TableCell>
                <TableCell>
                  <Badge variant={p.plan_type === 'yarn_to_fabric' ? 'orange' : 'neutral'} size="sm">
                    {p.plan_type === 'yarn_to_fabric' ? 'Yarn → Fabric' : 'Fabric → Yarn'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="font-semibold text-white">{p.article_name}</div>
                  <div className="text-[11px] text-gray-500 font-mono">
                    {p.width}" | {p.epi}x{p.ppi} | {p.warp_count}s x {p.weft_count}s
                  </div>
                </TableCell>
                <TableCell className="font-mono text-gray-300 text-xs">
                  {p.available_yarn_kg.toLocaleString()} kg
                  {p.budget_pkr > 0 && (
                    <div className="text-[10px] text-gray-500">Rs. {p.budget_pkr.toLocaleString()}</div>
                  )}
                </TableCell>
                <TableCell className="font-mono font-bold text-white text-xs">
                  {p.expected_usable_meters ? p.expected_usable_meters.toLocaleString() : p.target_fabric_meters?.toLocaleString()} m
                </TableCell>
                <TableCell>
                  {p.total_remaining_kg > 0 ? (
                    <span className="font-mono text-amber-400 font-medium text-xs">
                      {p.total_remaining_kg} kg surplus
                    </span>
                  ) : (
                    <span className="font-mono text-emerald-400 text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Balanced
                    </span>
                  )}
                </TableCell>
                <TableCell className="font-mono text-orange-brand font-bold text-xs">
                  {p.yarn_utilization_pct}%
                </TableCell>
                <TableCell className="font-mono text-gray-400 text-[11px]">
                  {p.created_at?.slice(0, 10)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleView(p); }}
                      title="View Details"
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222530] rounded transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(p.id, e)}
                        title="Delete Plan"
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

      {/* Plan Details Modal */}
      {selectedPlan && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Production Plan: ${selectedPlan.plan_id}`}
          subtitle={`${selectedPlan.article_name} (${selectedPlan.plan_type === 'yarn_to_fabric' ? 'Yarn to Fabric' : 'Fabric to Yarn'})`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-[#14151B] rounded-xl border border-dark-border grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500 block">Expected Usable Fabric:</span>
                <strong className="text-xl font-bold font-mono text-orange-brand">
                  {selectedPlan.expected_usable_meters.toLocaleString()} meters
                </strong>
              </div>
              <div>
                <span className="text-gray-500 block">Allocated Yarn:</span>
                <strong className="text-xl font-bold font-mono text-white">
                  {selectedPlan.available_yarn_kg.toLocaleString()} kg
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#14151B] rounded-lg border border-dark-border space-y-1">
                <span className="text-gray-400 block font-semibold">Warp Yarn</span>
                <p>Count: {selectedPlan.warp_count} {selectedPlan.warp_count_system}</p>
                <p>Rate: Rs. {selectedPlan.warp_rate}/kg</p>
                <p>Crimp / Wastage: {selectedPlan.warp_crimp}% / {selectedPlan.warp_wastage}%</p>
                <p className="text-amber-400">Remaining Warp: {selectedPlan.remaining_warp_kg} kg</p>
              </div>

              <div className="p-3 bg-[#14151B] rounded-lg border border-dark-border space-y-1">
                <span className="text-gray-400 block font-semibold">Weft Yarn</span>
                <p>Count: {selectedPlan.weft_count} {selectedPlan.weft_count_system}</p>
                <p>Rate: Rs. {selectedPlan.weft_rate}/kg</p>
                <p>Crimp / Wastage: {selectedPlan.weft_crimp}% / {selectedPlan.weft_wastage}%</p>
                <p className="text-amber-400">Remaining Weft: {selectedPlan.remaining_weft_kg} kg</p>
              </div>
            </div>

            <div className="p-3 bg-[#14151B] rounded-lg border border-dark-border flex justify-between">
              <span>Yarn Utilization: <strong className="text-orange-brand">{selectedPlan.yarn_utilization_pct}%</strong></span>
              <span>Bottleneck: <strong className="text-white capitalize">{selectedPlan.limiting_yarn_type}</strong></span>
              <span>Date: <strong className="text-gray-300 font-mono">{selectedPlan.created_at?.slice(0, 10)}</strong></span>
            </div>

            {selectedPlan.notes && (
              <div className="p-3 bg-[#121318] rounded-lg border border-dark-border text-gray-400">
                <strong className="text-gray-300 block mb-0.5">Notes:</strong>
                {selectedPlan.notes}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
