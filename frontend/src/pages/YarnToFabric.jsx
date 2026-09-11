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
  Printer
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { productionService } from '../services/productionService';
import { fabricService, yarnService } from '../services/mastersService';
import { useToast } from '../context/ToastContext';

export const YarnToFabric = ({ onNavigate }) => {
  const { addToast } = useToast();

  // Mode: 'budget' (e.g. Rs. 10 Lakh) or 'weight' (e.g. 2,000 kg)
  const [inputMode, setInputMode] = useState('budget');

  // Input states
  const [formData, setFormData] = useState({
    budget_pkr: 1000000,
    available_yarn_kg: 2000,
    available_warp_kg: 1000,
    available_weft_kg: 1000,

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
    notes: 'Calculated for batch procurement'
  });

  const [calculation, setCalculation] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Masters for preset dropdown
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
      const payload = {
        ...data,
        budget_pkr: inputMode === 'budget' ? parseFloat(data.budget_pkr) || 0 : 0,
        available_yarn_kg: inputMode === 'weight' ? parseFloat(data.available_yarn_kg) || 0 : 0,
        available_warp_kg: inputMode === 'split' ? parseFloat(data.available_warp_kg) || 0 : 0,
        available_weft_kg: inputMode === 'split' ? parseFloat(data.available_weft_kg) || 0 : 0
      };

      const res = await productionService.calculateYarnToFabric(payload);
      if (res?.success && res?.data) {
        setCalculation(res.data);
      }
    } catch (err) {
      console.warn('Calculation error:', err.message);
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
        plan_type: 'yarn_to_fabric',
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

        budget_pkr: calculation.input.budgetPKR,
        available_yarn_kg: calculation.input.totalAvailableYarnKg,
        available_warp_kg: calculation.input.availableWarpKg,
        available_weft_kg: calculation.input.availableWeftKg,

        theoretical_fabric_meters: calculation.production_output.theoreticalFabricMeters,
        expected_fabric_meters: calculation.production_output.theoreticalFabricMeters,
        expected_usable_meters: calculation.production_output.expectedUsableMeters,

        consumed_warp_kg: calculation.yarn_balance.consumedWarpKg,
        consumed_weft_kg: calculation.yarn_balance.consumedWeftKg,
        remaining_warp_kg: calculation.yarn_balance.remainingWarpKg,
        remaining_weft_kg: calculation.yarn_balance.remainingWeftKg,
        total_remaining_kg: calculation.yarn_balance.totalRemainingYarnKg,

        yarn_utilization_pct: calculation.yarn_balance.yarnUtilizationPct,
        production_efficiency_pct: calculation.production_output.productionEfficiencyPct,
        limiting_yarn_type: calculation.supported_capacity.limitingYarnType,
        notes: formData.notes
      };

      const res = await productionService.createPlan(planPayload);
      if (res?.success) {
        addToast(`Production plan saved: ${res.data.plan_id}`, 'success');
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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Scale className="w-5 h-5 text-orange-brand" />
              Yarn → Fabric Production Planner
            </h2>
            <Badge variant="orange" size="sm">Rs. 10 Lakh Calculator</Badge>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Determine exact fabric meter yield, limiting yarn constraints, and leftover thread buffers from your yarn budget or stock.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>
            Print Plan
          </Button>
          <Button variant="primary" size="sm" icon={Save} onClick={handleSavePlan} disabled={saving || !calculation}>
            {saving ? 'Saving Plan...' : 'Save Production Plan'}
          </Button>
        </div>
      </div>

      {/* Preset Loader & Calculation Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-dark-card border border-dark-border rounded-xl shadow-card">
        {/* Preset Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-brand" /> Load Standard Fabric Construction
          </label>
          <select
            onChange={(e) => handleApplyPreset(e.target.value)}
            defaultValue=""
            className="w-full bg-[#14151B] border border-dark-border text-xs text-white rounded-lg px-3 py-2 focus:border-orange-brand outline-none"
          >
            <option value="" disabled>Choose fabric article...</option>
            {fabrics.map((f) => (
              <option key={f.id} value={f.id}>
                {f.article_name} ({f.width}" - {f.epi}x{f.ppi})
              </option>
            ))}
          </select>
        </div>

        {/* Input Mode Switcher */}
        <div className="md:col-span-2 flex flex-col justify-center">
          <span className="text-xs font-semibold text-gray-300 mb-1.5">Yarn Input Basis:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setInputMode('budget'); runCalculation({ ...formData }); }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                inputMode === 'budget'
                  ? 'bg-orange-brand/15 text-orange-brand border-orange-brand font-semibold shadow-glow-sm'
                  : 'bg-[#14151B] text-gray-400 border-dark-border hover:text-white'
              }`}
            >
              Option A: Yarn Budget (PKR)
            </button>
            <button
              type="button"
              onClick={() => { setInputMode('weight'); runCalculation({ ...formData }); }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                inputMode === 'weight'
                  ? 'bg-orange-brand/15 text-orange-brand border-orange-brand font-semibold shadow-glow-sm'
                  : 'bg-[#14151B] text-gray-400 border-dark-border hover:text-white'
              }`}
            >
              Option B: Total Yarn (KG)
            </button>
            <button
              type="button"
              onClick={() => { setInputMode('split'); runCalculation({ ...formData }); }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                inputMode === 'split'
                  ? 'bg-orange-brand/15 text-orange-brand border-orange-brand font-semibold shadow-glow-sm'
                  : 'bg-[#14151B] text-gray-400 border-dark-border hover:text-white'
              }`}
            >
              Option C: Split Warp / Weft (KG)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Available Yarn Input Card */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-card space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-dark-border pb-2.5">
              <Layers className="w-4 h-4 text-orange-brand" /> Available Yarn Resource
            </h3>

            {inputMode === 'budget' && (
              <div>
                <Input
                  label="Total Yarn Budget (PKR)"
                  type="number"
                  placeholder="e.g. 1000000 (Rs. 10 Lakh)"
                  value={formData.budget_pkr}
                  onChange={(e) => handleChange('budget_pkr', e.target.value)}
                  suffix="PKR"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  System calculates purchasable yarn weight based on specified warp and weft rates.
                </p>
              </div>
            )}

            {inputMode === 'weight' && (
              <div>
                <Input
                  label="Total Available Yarn Weight (KG)"
                  type="number"
                  placeholder="e.g. 2000"
                  value={formData.available_yarn_kg}
                  onChange={(e) => handleChange('available_yarn_kg', e.target.value)}
                  suffix="kg"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Yarn is proportionally allocated to warp and weft according to fabric consumption ratio.
                </p>
              </div>
            )}

            {inputMode === 'split' && (
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Available Warp Yarn (KG)"
                  type="number"
                  placeholder="e.g. 1000"
                  value={formData.available_warp_kg}
                  onChange={(e) => handleChange('available_warp_kg', e.target.value)}
                  suffix="kg"
                />
                <Input
                  label="Available Weft Yarn (KG)"
                  type="number"
                  placeholder="e.g. 1100"
                  value={formData.available_weft_kg}
                  onChange={(e) => handleChange('available_weft_kg', e.target.value)}
                  suffix="kg"
                />
              </div>
            )}
          </div>

          {/* 2. Fabric Construction Card */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-card space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 border-b border-dark-border pb-2.5">
              <Sliders className="w-4 h-4 text-orange-brand" /> Fabric Construction Specifications
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Width (Inches)"
                type="number"
                value={formData.width}
                onChange={(e) => handleChange('width', e.target.value)}
                suffix="in"
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

            {/* Warp Parameters */}
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
                  label="Count Sys"
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
                  label="Warp Crimp %"
                  type="number"
                  step="0.1"
                  value={formData.warp_crimp}
                  onChange={(e) => handleChange('warp_crimp', e.target.value)}
                  suffix="%"
                />
                <Input
                  label="Warp Wastage %"
                  type="number"
                  step="0.1"
                  value={formData.warp_wastage}
                  onChange={(e) => handleChange('warp_wastage', e.target.value)}
                  suffix="%"
                />
              </div>
            </div>

            {/* Weft Parameters */}
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
                  label="Count Sys"
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
                  label="Weft Crimp %"
                  type="number"
                  step="0.1"
                  value={formData.weft_crimp}
                  onChange={(e) => handleChange('weft_crimp', e.target.value)}
                  suffix="%"
                />
                <Input
                  label="Weft Wastage %"
                  type="number"
                  step="0.1"
                  value={formData.weft_wastage}
                  onChange={(e) => handleChange('weft_wastage', e.target.value)}
                  suffix="%"
                />
              </div>
            </div>

            {/* Process Allowances */}
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

        {/* Right Output & Breakdown Dashboard (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {calculation ? (
            <>
              {/* Primary Output Hero Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Expected Usable Fabric */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1C1814] to-[#121318] border-2 border-orange-brand/60 shadow-glow relative overflow-hidden">
                  <span className="text-xs font-semibold text-orange-brand uppercase tracking-wider">
                    EXPECTED USABLE GREY FABRIC
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-white font-mono mt-2 flex items-baseline gap-2">
                    {calculation.production_output.expectedUsableMeters.toLocaleString()}
                    <span className="text-lg font-normal text-orange-brand">meters</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-dark-border/60">
                    <span>Theoretical Max: <strong className="text-white">{calculation.production_output.theoreticalFabricMeters.toLocaleString()} m</strong></span>
                    <span>Process Loss: <strong className="text-rose-400">-{calculation.production_output.lossMeters.toLocaleString()} m</strong></span>
                  </div>
                </div>

                {/* Total Available Yarn Resource */}
                <div className="p-6 rounded-2xl bg-dark-card border border-dark-border shadow-card flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      TOTAL ALLOCATED YARN
                    </span>
                    <div className="text-3xl font-bold text-white font-mono mt-2 flex items-baseline gap-2">
                      {calculation.input.totalAvailableYarnKg.toLocaleString()}
                      <span className="text-lg font-normal text-gray-400">kg</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-dark-border">
                    <div className="p-2 bg-[#14151B] rounded border border-dark-border">
                      <span className="text-gray-500 block text-[10px]">Warp Yarn</span>
                      <strong className="text-white font-mono">{calculation.input.availableWarpKg.toLocaleString()} kg</strong>
                    </div>
                    <div className="p-2 bg-[#14151B] rounded border border-dark-border">
                      <span className="text-gray-500 block text-[10px]">Weft Yarn</span>
                      <strong className="text-white font-mono">{calculation.input.availableWeftKg.toLocaleString()} kg</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Limiting Constraint & Yarn Balance Card */}
              <div className="p-5 rounded-xl bg-dark-card border border-dark-border shadow-card space-y-4">
                <div className="flex items-center justify-between border-b border-dark-border pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${
                      calculation.supported_capacity.limitingYarnType === 'balanced' ? 'text-emerald-400' : 'text-amber-400'
                    }`} />
                    <h4 className="text-xs font-semibold text-white uppercase tracking-wider">
                      Production Bottleneck & Capacity Balance
                    </h4>
                  </div>
                  <Badge
                    variant={calculation.supported_capacity.limitingYarnType === 'balanced' ? 'success' : 'orange'}
                    size="sm"
                  >
                    {calculation.supported_capacity.limitingYarnType === 'balanced'
                      ? 'Perfect Balance'
                      : `${calculation.supported_capacity.limitingYarnType.toUpperCase()} Constrained`}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#14151B] rounded-lg border border-dark-border">
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Warp-Supported Capacity:</span>
                      <strong className="text-white font-mono">{calculation.supported_capacity.warpSupportedMeters.toLocaleString()} m</strong>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Consumed Warp:</span>
                      <strong className="text-gray-300 font-mono">{calculation.yarn_balance.consumedWarpKg} kg</strong>
                    </div>
                    <div className="flex justify-between text-amber-400 font-semibold mt-1 pt-1 border-t border-dark-border/40">
                      <span>Remaining Unused Warp:</span>
                      <span className="font-mono">{calculation.yarn_balance.remainingWarpKg} kg</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#14151B] rounded-lg border border-dark-border">
                    <div className="flex justify-between text-gray-400 mb-1">
                      <span>Weft-Supported Capacity:</span>
                      <strong className="text-white font-mono">{calculation.supported_capacity.weftSupportedMeters.toLocaleString()} m</strong>
                    </div>
                    <div className="flex justify-between text-gray-400">
                      <span>Consumed Weft:</span>
                      <strong className="text-gray-300 font-mono">{calculation.yarn_balance.consumedWeftKg} kg</strong>
                    </div>
                    <div className="flex justify-between text-amber-400 font-semibold mt-1 pt-1 border-t border-dark-border/40">
                      <span>Remaining Unused Weft:</span>
                      <span className="font-mono">{calculation.yarn_balance.remainingWeftKg} kg</span>
                    </div>
                  </div>
                </div>

                {/* Real-world Advice Alert */}
                {calculation.yarn_balance.totalRemainingYarnKg > 0 && (
                  <div className="p-3 rounded-lg bg-[#221A12] border border-amber-500/40 text-xs text-amber-200 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Imbalance Warning: </strong>
                      You have <strong>{calculation.yarn_balance.totalRemainingYarnKg} kg</strong> of surplus {calculation.supported_capacity.limitingYarnType === 'warp' ? 'weft' : 'warp'} yarn remaining.
                      To weave this remaining yarn, procure approximately{' '}
                      <strong>
                        {calculation.supported_capacity.limitingYarnType === 'warp'
                          ? Math.round((calculation.supported_capacity.weftSupportedMeters - calculation.supported_capacity.warpSupportedMeters) * calculation.input.adjustedWarpKgM)
                          : Math.round((calculation.supported_capacity.warpSupportedMeters - calculation.supported_capacity.weftSupportedMeters) * calculation.input.adjustedWeftKgM)} kg
                      </strong>{' '}
                      of complementary yarn.
                    </div>
                  </div>
                )}
              </div>

              {/* Efficiency Indicators */}
              <div className="p-5 rounded-xl bg-dark-card border border-dark-border shadow-card space-y-3">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Factory Efficiency Metrics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Yarn Utilization</span>
                      <span className="font-mono font-bold text-orange-brand">
                        {calculation.yarn_balance.yarnUtilizationPct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#121318] rounded-full overflow-hidden border border-dark-border">
                      <div
                        className="h-full bg-orange-brand transition-all duration-500"
                        style={{ width: `${Math.min(100, calculation.yarn_balance.yarnUtilizationPct)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Process Efficiency</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {calculation.production_output.productionEfficiencyPct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#121318] rounded-full overflow-hidden border border-dark-border">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, calculation.production_output.productionEfficiencyPct)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-gray-500 bg-dark-card border border-dark-border rounded-xl">
              Enter yarn budget or weight to compute fabric yield...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
