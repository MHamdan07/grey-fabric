import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  ArrowRight,
  Save,
  RotateCcw,
  Info,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Percent,
  Sliders,
  Printer,
  Coins
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { productionService } from '../services/productionService';
import { fabricService, yarnService } from '../services/mastersService';
import { useToast } from '../context/ToastContext';

export const FabricToYarn = ({ onNavigate }) => {
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    target_fabric_meters: 20000,
    article_name: 'Standard Poplin 40x40',
    fabric_code: 'ART-POP-4040',
    width: 60,
    epi: 60,
    ppi: 60,

    warp_count: 40,
    warp_count_system: 'Ne',
    warp_rate: 500,
    warp_crimp: 5.0,
    warp_wastage: 2.0,

    weft_count: 40,
    weft_count_system: 'Ne',
    weft_rate: 500,
    weft_crimp: 5.0,
    weft_wastage: 2.0,

    sizing_loss_pct: 0.5,
    weaving_loss_pct: 1.5,
    reject_pct: 2.0,
    notes: 'Procurement requirement for export order'
  });

  const [calculation, setCalculation] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);

  const [fabrics, setFabrics] = useState([]);
  const [yarns, setYarns] = useState([]);

  useEffect(() => {
    loadMasters();
    runCalculation(formData);
  }, []);

  const loadMasters = async () => {
    try {
      const [fRes, yRes] = await Promise.all([
        fabricService.getAll().catch(() => null),
        yarnService.getAll().catch(() => null)
      ]);
      if (fRes?.data) setFabrics(fRes.data);
      if (yRes?.data) setYarns(yRes.data);
    } catch (e) {
      console.warn(e);
    }
  };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    runCalculation(updated);
  };

  const runCalculation = async (data) => {
    try {
      setCalculating(true);
      const res = await productionService.calculateFabricToYarn(data);
      if (res?.success && res?.data) {
        setCalculation(res.data);
      }
    } catch (err) {
      console.warn('Reverse calculation error:', err.message);
    } finally {
      setCalculating(false);
    }
  };

  const handleApplyPreset = (fabricId) => {
    const selected = fabrics.find((f) => String(f.id) === String(fabricId));
    if (!selected) return;

    const warpYarn = yarns.find((y) => y.id === selected.warp_yarn_id);
    const weftYarn = yarns.find((y) => y.id === selected.weft_yarn_id);

    const updated = {
      ...formData,
      article_name: selected.article_name,
      fabric_code: selected.fabric_code,
      width: selected.width,
      epi: selected.epi,
      ppi: selected.ppi,
      warp_count: warpYarn ? warpYarn.count_value : formData.warp_count,
      warp_rate: warpYarn ? warpYarn.yarn_rate : formData.warp_rate,
      weft_count: weftYarn ? weftYarn.count_value : formData.weft_count,
      weft_rate: weftYarn ? weftYarn.yarn_rate : formData.weft_rate
    };

    setFormData(updated);
    runCalculation(updated);
    addToast(`Loaded preset template: ${selected.article_name}`, 'info');
  };

  const handleSavePlan = async () => {
    if (!calculation) return;
    try {
      setSaving(true);
      const planPayload = {
        plan_type: 'fabric_to_yarn',
        article_name: formData.article_name,
        fabric_code: formData.fabric_code,
        width: formData.width,
        epi: formData.epi,
        ppi: formData.ppi,
        warp_count: formData.warp_count,
        warp_count_system: formData.warp_count_system,
        warp_rate: formData.warp_rate,
        warp_crimp: formData.warp_crimp,
        warp_wastage: formData.warp_wastage,
        weft_count: formData.weft_count,
        weft_count_system: formData.weft_count_system,
        weft_rate: formData.weft_rate,
        weft_crimp: formData.weft_crimp,
        weft_wastage: formData.weft_wastage,

        target_fabric_meters: calculation.targetFabricMeters,
        theoretical_fabric_meters: calculation.targetFabricMeters,
        expected_fabric_meters: calculation.targetFabricMeters,
        expected_usable_meters: calculation.targetFabricMeters,

        available_yarn_kg: calculation.recommended_procurement.totalKg,
        available_warp_kg: calculation.recommended_procurement.warpKg,
        available_weft_kg: calculation.recommended_procurement.weftKg,

        budget_pkr: calculation.estimated_costs.totalYarnCost,
        consumed_warp_kg: calculation.net_yarn.warpKg,
        consumed_weft_kg: calculation.net_yarn.weftKg,
        remaining_warp_kg: calculation.recommended_procurement.bufferKg / 2,
        remaining_weft_kg: calculation.recommended_procurement.bufferKg / 2,
        total_remaining_kg: calculation.recommended_procurement.bufferKg,

        yarn_utilization_pct: 100,
        production_efficiency_pct: calculation.process_allowances.efficiencyPct,
        notes: formData.notes
      };

      const res = await productionService.createPlan(planPayload);
      if (res?.success) {
        addToast(`Reverse procurement plan saved: ${res.data.plan_id}`, 'success');
        if (onNavigate) onNavigate('production-plans');
      }
    } catch (err) {
      addToast('Failed to save plan: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-5 h-5 text-orange-brand" />
              Fabric → Yarn Requirement Planner
            </h2>
            <Badge variant="orange" size="sm">Reverse Calculator</Badge>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Enter target production meters to calculate exact required warp and weft yarn weights and estimated procurement cost in PKR.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
            Print Plan
          </Button>
          <Button variant="primary" size="sm" icon={Save} onClick={handleSavePlan} disabled={saving || !calculation}>
            {saving ? 'Saving...' : 'Save Procurement Plan'}
          </Button>
        </div>
      </div>

      {/* Preset Loader */}
      <div className="p-4 bg-dark-card border border-dark-border rounded-xl shadow-card flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-orange-brand" />
          <span className="text-xs font-semibold text-gray-300">Quick-Load Fabric Preset:</span>
          <select
            onChange={(e) => handleApplyPreset(e.target.value)}
            defaultValue=""
            className="bg-[#14151B] border border-dark-border text-xs text-white rounded-lg px-3 py-1.5 focus:border-orange-brand outline-none"
          >
            <option value="" disabled>Choose fabric article...</option>
            {fabrics.map((f) => (
              <option key={f.id} value={f.id}>
                {f.article_name} ({f.width}" - {f.epi}x{f.ppi})
              </option>
            ))}
          </select>
        </div>
        <span className="text-xs text-gray-400 font-mono">
          Formula: Target Meters x Adjusted Consumption (kg/m) + Factory Buffer
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Target Meters & Construction (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-card space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-dark-border pb-2.5">
              <Scale className="w-4 h-4 text-orange-brand" /> Target Production Volume
            </h3>
            <Input
              label="Target Fabric Order Length (Meters)"
              type="number"
              placeholder="e.g. 20000"
              value={formData.target_fabric_meters}
              onChange={(e) => handleChange('target_fabric_meters', e.target.value)}
              suffix="meters"
            />
          </div>

          <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-card space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-dark-border pb-2.5">
              <Sliders className="w-4 h-4 text-orange-brand" /> Construction Parameters
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Width (in)"
                type="number"
                value={formData.width}
                onChange={(e) => handleChange('width', e.target.value)}
              />
              <Input
                label="EPI"
                type="number"
                value={formData.epi}
                onChange={(e) => handleChange('epi', e.target.value)}
              />
              <Input
                label="PPI"
                type="number"
                value={formData.ppi}
                onChange={(e) => handleChange('ppi', e.target.value)}
              />
            </div>

            {/* Warp Yarn */}
            <div className="p-3 bg-[#14151B] border border-dark-border rounded-lg space-y-3">
              <span className="text-xs font-semibold text-orange-brand uppercase tracking-wider block">Warp Yarn</span>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  label="Count"
                  type="number"
                  value={formData.warp_count}
                  onChange={(e) => handleChange('warp_count', e.target.value)}
                />
                <Select
                  label="System"
                  value={formData.warp_count_system}
                  onChange={(e) => handleChange('warp_count_system', e.target.value)}
                  options={[
                    { value: 'Ne', label: 'Ne (Cotton)' },
                    { value: 'Nm', label: 'Nm (Metric)' },
                    { value: 'Tex', label: 'Tex' },
                    { value: 'Denier', label: 'Denier' }
                  ]}
                />
                <Input
                  label="Rate (Rs/kg)"
                  type="number"
                  value={formData.warp_rate}
                  onChange={(e) => handleChange('warp_rate', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Crimp %"
                  type="number"
                  step="0.1"
                  value={formData.warp_crimp}
                  onChange={(e) => handleChange('warp_crimp', e.target.value)}
                  suffix="%"
                />
                <Input
                  label="Wastage %"
                  type="number"
                  step="0.1"
                  value={formData.warp_wastage}
                  onChange={(e) => handleChange('warp_wastage', e.target.value)}
                  suffix="%"
                />
              </div>
            </div>

            {/* Weft Yarn */}
            <div className="p-3 bg-[#14151B] border border-dark-border rounded-lg space-y-3">
              <span className="text-xs font-semibold text-orange-brand uppercase tracking-wider block">Weft Yarn</span>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  label="Count"
                  type="number"
                  value={formData.weft_count}
                  onChange={(e) => handleChange('weft_count', e.target.value)}
                />
                <Select
                  label="System"
                  value={formData.weft_count_system}
                  onChange={(e) => handleChange('weft_count_system', e.target.value)}
                  options={[
                    { value: 'Ne', label: 'Ne (Cotton)' },
                    { value: 'Nm', label: 'Nm (Metric)' },
                    { value: 'Tex', label: 'Tex' },
                    { value: 'Denier', label: 'Denier' }
                  ]}
                />
                <Input
                  label="Rate (Rs/kg)"
                  type="number"
                  value={formData.weft_rate}
                  onChange={(e) => handleChange('weft_rate', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="Crimp %"
                  type="number"
                  step="0.1"
                  value={formData.weft_crimp}
                  onChange={(e) => handleChange('weft_crimp', e.target.value)}
                  suffix="%"
                />
                <Input
                  label="Wastage %"
                  type="number"
                  step="0.1"
                  value={formData.weft_wastage}
                  onChange={(e) => handleChange('weft_wastage', e.target.value)}
                  suffix="%"
                />
              </div>
            </div>

            {/* Factory Loss Allowances */}
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Sizing Loss %"
                type="number"
                step="0.1"
                value={formData.sizing_loss_pct}
                onChange={(e) => handleChange('sizing_loss_pct', e.target.value)}
                suffix="%"
              />
              <Input
                label="Weaving Loss %"
                type="number"
                step="0.1"
                value={formData.weaving_loss_pct}
                onChange={(e) => handleChange('weaving_loss_pct', e.target.value)}
                suffix="%"
              />
              <Input
                label="Reject %"
                type="number"
                step="0.1"
                value={formData.reject_pct}
                onChange={(e) => handleChange('reject_pct', e.target.value)}
                suffix="%"
              />
            </div>
          </div>
        </div>

        {/* Right Output: Required Yarn & Procurement Budget (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {calculation ? (
            <>
              {/* Primary Procurement Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total Recommended Yarn Purchase */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1C1814] to-[#121318] border-2 border-orange-brand/60 shadow-glow">
                  <span className="text-xs font-semibold text-orange-brand uppercase tracking-wider">
                    RECOMMENDED YARN PURCHASE / ISSUE
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono mt-2 flex items-baseline gap-2">
                    {calculation.recommended_procurement.totalKg.toLocaleString()}
                    <span className="text-lg font-normal text-orange-brand">kg</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-dark-border/60">
                    <span>Net Finished Need: <strong className="text-white">{calculation.net_yarn.totalKg.toLocaleString()} kg</strong></span>
                    <span>Safety Buffer: <strong className="text-amber-400">+{calculation.recommended_procurement.bufferKg.toLocaleString()} kg</strong></span>
                  </div>
                </div>

                {/* Estimated Procurement Budget */}
                <div className="p-6 rounded-2xl bg-dark-card border border-dark-border shadow-card flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      PROJECTED YARN PROCUREMENT BUDGET
                    </span>
                    <div className="text-3xl font-bold text-orange-brand font-mono mt-2 flex items-baseline gap-2">
                      Rs. {calculation.estimated_costs.totalYarnCost.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 pt-3 border-t border-dark-border flex justify-between">
                    <span>Target Fabric: <strong className="text-white font-mono">{calculation.targetFabricMeters.toLocaleString()} m</strong></span>
                    <span>Gross Loom Weave: <strong className="text-gray-300 font-mono">{calculation.grossMetersToWeave.toLocaleString()} m</strong></span>
                  </div>
                </div>
              </div>

              {/* Warp vs Weft Procurement Breakdown */}
              <div className="p-5 rounded-xl bg-dark-card border border-dark-border shadow-card space-y-4">
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2 border-b border-dark-border pb-3">
                  <Coins className="w-4 h-4 text-orange-brand" /> Detailed Yarn Procurement Allocation
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Warp Breakdown */}
                  <div className="p-4 bg-[#14151B] rounded-lg border border-dark-border space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-dark-border">
                      <span className="font-bold text-white uppercase">Warp Yarn Procurement</span>
                      <span className="font-mono text-orange-brand font-bold">Rs. {formData.warp_rate}/kg</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Net Warp Requirement:</span>
                      <strong className="text-gray-200 font-mono">{calculation.net_yarn.warpKg.toLocaleString()} kg</strong>
                    </div>
                    <div className="flex justify-between text-amber-300">
                      <span>Recommended Issue (w/ Loss Buffer):</span>
                      <strong className="font-mono">{calculation.recommended_procurement.warpKg.toLocaleString()} kg</strong>
                    </div>
                    <div className="flex justify-between text-white font-semibold pt-2 border-t border-dark-border">
                      <span>Estimated Warp Cost:</span>
                      <span className="font-mono text-orange-brand font-bold">
                        Rs. {calculation.estimated_costs.warpCost.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Weft Breakdown */}
                  <div className="p-4 bg-[#14151B] rounded-lg border border-dark-border space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-dark-border">
                      <span className="font-bold text-white uppercase">Weft Yarn Procurement</span>
                      <span className="font-mono text-orange-brand font-bold">Rs. {formData.weft_rate}/kg</span>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Net Weft Requirement:</span>
                      <strong className="text-gray-200 font-mono">{calculation.net_yarn.weftKg.toLocaleString()} kg</strong>
                    </div>
                    <div className="flex justify-between text-amber-300">
                      <span>Recommended Issue (w/ Loss Buffer):</span>
                      <strong className="font-mono">{calculation.recommended_procurement.weftKg.toLocaleString()} kg</strong>
                    </div>
                    <div className="flex justify-between text-white font-semibold pt-2 border-t border-dark-border">
                      <span>Estimated Weft Cost:</span>
                      <span className="font-mono text-orange-brand font-bold">
                        Rs. {calculation.estimated_costs.weftCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-[#171922] rounded-lg border border-dark-border/60 text-xs text-gray-400 flex items-center justify-between">
                  <span>Factory Loss Factor (Sizing + Weaving + Defects):</span>
                  <span className="font-mono text-white font-semibold">
                    {calculation.process_allowances.totalLossPct}% Loss allowance included in recommended issue
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-500 bg-dark-card border border-dark-border rounded-xl">
              Enter target meters to compute yarn procurement requirements...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
