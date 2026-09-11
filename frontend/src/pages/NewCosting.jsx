import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  Check,
  AlertCircle,
  Layers,
  ArrowRight,
  Sliders,
  Scale
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { costingService } from '../services/costingService';
import { fabricService, yarnService } from '../services/mastersService';
import { useToast } from '../context/ToastContext';

export const NewCosting = ({ onSaved, initialData }) => {
  const { addToast } = useToast();
  const isEditing = !!initialData?.id;

  const defaultValues = {
    article_name: 'Cotton Poplin 40x40',
    fabric_code: 'ART-POP-4040',
    width: 63,
    epi: 133,
    ppi: 72,

    warp_count: 40,
    warp_count_system: 'Ne',
    warp_rate: 1120,
    warp_crimp: 5.0,
    warp_wastage: 2.0,

    weft_count: 40,
    weft_count_system: 'Ne',
    weft_rate: 1080,
    weft_crimp: 5.0,
    weft_wastage: 2.0,

    sizing_charges: 14.50,
    sizing_charge_type: 'per_meter',
    weaving_charges: 32.00,
    weaving_charge_type: 'per_meter',
    other_charges: 5.50,
    notes: 'Estimated for standard airjet weave loom batch'
  };

  const [formData, setFormData] = useState({
    ...defaultValues,
    ...initialData
  });

  const [calculation, setCalculation] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Master records for quick load
  const [fabrics, setFabrics] = useState([]);
  const [yarns, setYarns] = useState([]);

  useEffect(() => {
    loadMasterData();
    triggerLiveCalculation(formData);
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
      triggerLiveCalculation({ ...formData, ...initialData });
    }
  }, [initialData]);

  const loadMasterData = async () => {
    try {
      const [fabRes, yarnRes] = await Promise.all([
        fabricService.getAll().catch(() => null),
        yarnService.getAll().catch(() => null)
      ]);
      if (fabRes?.data) setFabrics(fabRes.data);
      if (yarnRes?.data) setYarns(yarnRes.data);
    } catch (e) {
      console.warn('Error loading masters for dropdowns:', e);
    }
  };

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    setSaveSuccess(false);
    setError(null);
    triggerLiveCalculation(updated);
  };

  const triggerLiveCalculation = async (data) => {
    try {
      setCalculating(true);
      const res = await costingService.calculate(data);
      if (res.success && res.data) {
        setCalculation(res.data);
      }
    } catch (err) {
      // Form might have intermediate partial inputs
    } finally {
      setCalculating(false);
    }
  };

  const handleApplyPresetFabric = (fabricId) => {
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
      warp_count: warpYarn ? warpYarn.count_value : 40,
      warp_rate: warpYarn ? warpYarn.yarn_rate : 1120,
      warp_crimp: selected.standard_crimp || 5.0,
      warp_wastage: selected.standard_wastage || 2.0,
      weft_count: weftYarn ? weftYarn.count_value : 40,
      weft_rate: weftYarn ? weftYarn.yarn_rate : 1080,
      weft_crimp: selected.standard_crimp || 5.0,
      weft_wastage: selected.standard_wastage || 2.0,
      sizing_charges: selected.sizing_charges || 14.50,
      weaving_charges: selected.weaving_charges || 32.00
    };

    setFormData(updated);
    triggerLiveCalculation(updated);
    addToast(`Loaded preset template: ${selected.article_name}`, 'info');
  };

  const handleResetForm = () => {
    setFormData(defaultValues);
    triggerLiveCalculation(defaultValues);
    addToast('Form reset to default parameters', 'info');
  };

  const handleSaveCosting = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      let res;
      if (isEditing) {
        res = await costingService.update(initialData.id, formData);
        addToast(`Costing updated: ${res.data.costing_id}`, 'success');
      } else {
        res = await costingService.create(formData);
        addToast(`Costing saved successfully: ${res.data.costing_id}`, 'success');
      }

      if (res.success) {
        setSaveSuccess(true);
        if (onSaved) onSaved(res.data);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save costing record.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const audit = calculation?.audit_breakdown;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Calculator className="w-5 h-5 text-orange-brand" />
            {isEditing ? 'EDIT GREY FABRIC COSTING' : 'NEW GREY FABRIC COSTING'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Deterministic textile calculation engine with distinct crimp, wastage, and configurable tariff systems.
          </p>
        </div>

        {/* Master Preset Loader */}
        {fabrics.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Load Master:</span>
            <select
              onChange={(e) => handleApplyPresetFabric(e.target.value)}
              className="bg-[#14151B] border border-dark-border text-xs text-white rounded-lg px-3 py-1.5 focus:border-orange-brand outline-none"
            >
              <option value="">Select Fabric Template...</option>
              {fabrics.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.article_name} ({f.width}")
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>Costing successfully calculated and stored in database history!</span>
        </div>
      )}

      {/* Main Grid: Input Form (Left 60%) + Transparent Audit Breakdown (Right 40%) */}
      <form onSubmit={handleSaveCosting} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Fabric Information */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                1. Fabric Construction Specifications
              </h3>
              <span className="text-[11px] text-gray-500">Reed & Loom Width</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Fabric / Article Name"
                required
                value={formData.article_name}
                onChange={(e) => handleChange('article_name', e.target.value)}
                placeholder="e.g. Cotton Poplin 40x40"
              />
              <Input
                label="Fabric Code / Spec ID"
                value={formData.fabric_code}
                onChange={(e) => handleChange('fabric_code', e.target.value)}
                placeholder="e.g. ART-POP-4040"
              />
              <Input
                label="Width (Reed / Grey)"
                type="number"
                step="0.5"
                suffix='inches "'
                required
                value={formData.width}
                onChange={(e) => handleChange('width', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  label="EPI (Ends/Inch)"
                  type="number"
                  required
                  value={formData.epi}
                  onChange={(e) => handleChange('epi', e.target.value)}
                />
                <Input
                  label="PPI (Picks/Inch)"
                  type="number"
                  required
                  value={formData.ppi}
                  onChange={(e) => handleChange('ppi', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 2. Warp Details */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                2. Warp Yarn Specification
              </h3>
              <span className="text-[11px] text-orange-brand">Longitudinal Threads</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="Warp Count Value"
                type="number"
                step="0.5"
                required
                value={formData.warp_count}
                onChange={(e) => handleChange('warp_count', e.target.value)}
              />
              <Select
                label="Count System"
                value={formData.warp_count_system}
                onChange={(e) => handleChange('warp_count_system', e.target.value)}
                options={[
                  { value: 'Ne', label: 'Ne (Cotton Count)' },
                  { value: 'Nm', label: 'Nm (Metric Count)' },
                  { value: 'Tex', label: 'Tex (Direct Density)' },
                  { value: 'Denier', label: 'Denier (Filament)' }
                ]}
              />
              <Input
                label="Warp Yarn Rate"
                type="number"
                step="1"
                suffix="Rs./kg"
                required
                value={formData.warp_rate}
                onChange={(e) => handleChange('warp_rate', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-dark-border/40">
              <Input
                label="Warp Crimp / Take-up"
                type="number"
                step="0.1"
                suffix="%"
                sublabel="Thread elongation / interlacing"
                value={formData.warp_crimp}
                onChange={(e) => handleChange('warp_crimp', e.target.value)}
              />
              <Input
                label="Warp Yarn Wastage"
                type="number"
                step="0.1"
                suffix="%"
                sublabel="Warping / tying fiber loss"
                value={formData.warp_wastage}
                onChange={(e) => handleChange('warp_wastage', e.target.value)}
              />
            </div>
          </div>

          {/* 3. Weft Details */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                3. Weft Yarn Specification
              </h3>
              <span className="text-[11px] text-orange-brand">Crosswise Loom Picks</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                label="Weft Count Value"
                type="number"
                step="0.5"
                required
                value={formData.weft_count}
                onChange={(e) => handleChange('weft_count', e.target.value)}
              />
              <Select
                label="Count System"
                value={formData.weft_count_system}
                onChange={(e) => handleChange('weft_count_system', e.target.value)}
                options={[
                  { value: 'Ne', label: 'Ne (Cotton Count)' },
                  { value: 'Nm', label: 'Nm (Metric Count)' },
                  { value: 'Tex', label: 'Tex (Direct Density)' },
                  { value: 'Denier', label: 'Denier (Filament)' }
                ]}
              />
              <Input
                label="Weft Yarn Rate"
                type="number"
                step="1"
                suffix="Rs./kg"
                required
                value={formData.weft_rate}
                onChange={(e) => handleChange('weft_rate', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-dark-border/40">
              <Input
                label="Weft Crimp / Take-up"
                type="number"
                step="0.1"
                suffix="%"
                sublabel="Weft bend / contraction"
                value={formData.weft_crimp}
                onChange={(e) => handleChange('weft_crimp', e.target.value)}
              />
              <Input
                label="Weft Yarn Wastage"
                type="number"
                step="0.1"
                suffix="%"
                sublabel="Selvedge cut / loom waste"
                value={formData.weft_wastage}
                onChange={(e) => handleChange('weft_wastage', e.target.value)}
              />
            </div>
          </div>

          {/* 4. Process Charges with Unit Types */}
          <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300">
                4. Process Conversion Charges
              </h3>
              <span className="text-[11px] text-gray-500">Configurable Tariff Basis</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sizing */}
              <div className="p-3 bg-[#14151B] rounded-lg border border-dark-border space-y-2">
                <span className="text-xs font-semibold text-white block">Sizing Tariff</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Rate"
                    type="number"
                    step="0.1"
                    value={formData.sizing_charges}
                    onChange={(e) => handleChange('sizing_charges', e.target.value)}
                  />
                  <Select
                    label="Tariff Basis"
                    value={formData.sizing_charge_type}
                    onChange={(e) => handleChange('sizing_charge_type', e.target.value)}
                    options={[
                      { value: 'per_meter', label: 'Rs./meter fabric' },
                      { value: 'per_kg_warp', label: 'Rs./kg sized warp' },
                      { value: 'fixed', label: 'Fixed allotment' }
                    ]}
                  />
                </div>
              </div>

              {/* Weaving */}
              <div className="p-3 bg-[#14151B] rounded-lg border border-dark-border space-y-2">
                <span className="text-xs font-semibold text-white block">Weaving Tariff</span>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Rate"
                    type="number"
                    step="0.1"
                    value={formData.weaving_charges}
                    onChange={(e) => handleChange('weaving_charges', e.target.value)}
                  />
                  <Select
                    label="Tariff Basis"
                    value={formData.weaving_charge_type}
                    onChange={(e) => handleChange('weaving_charge_type', e.target.value)}
                    options={[
                      { value: 'per_meter', label: 'Rs./meter fabric' },
                      { value: 'per_kg', label: 'Rs./kg total yarn' },
                      { value: 'fixed', label: 'Fixed allotment' }
                    ]}
                  />
                </div>
              </div>
            </div>

            <Input
              label="Other Auxiliary Manufacturing Charges (Rs./meter)"
              type="number"
              step="0.1"
              suffix="Rs./mtr"
              sublabel="Grading, folding, mending & overhead"
              value={formData.other_charges}
              onChange={(e) => handleChange('other_charges', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={saving}
              icon={Save}
              className="w-full sm:w-auto px-6"
            >
              {isEditing ? 'Update Costing Specification' : 'Save Costing to Ledger'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => {
                triggerLiveCalculation(formData);
                addToast('Recalculated with current parameters', 'info');
              }}
              loading={calculating}
              icon={RotateCcw}
            >
              Recalculate
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={handleResetForm}
              icon={RotateCcw}
              className="text-gray-400 hover:text-white"
            >
              Reset Defaults
            </Button>
          </div>
        </div>

        {/* Right Costing Result Panel (5 Cols) - Transparent Audit Breakdown */}
        <div className="lg:col-span-5 space-y-5 sticky top-20">
          <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  GREY FABRIC COSTING BREAKDOWN
                </h3>
                <p className="text-[11px] text-gray-400">
                  {formData.width}" | {formData.epi} EPI | {formData.ppi} PPI
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-orange-pill text-orange-brand border border-orange-border font-mono font-bold">
                {calculation?.formula_metadata?.formulaVersion || 'Standard Cotton v1.0'}
              </span>
            </div>

            {/* Prominent Total Result Banner */}
            <div className="p-5 rounded-xl bg-gradient-to-br from-[#23150C] via-[#1B171A] to-[#14151B] border border-orange-brand/50 shadow-glow-md text-center">
              <span className="text-[11px] uppercase font-bold tracking-widest text-orange-brand block mb-1">
                TOTAL GREY FABRIC COST
              </span>
              <div className="text-4xl font-extrabold text-white tracking-tight font-mono my-1">
                Rs. {calculation?.costs?.grey_cost_per_meter?.toFixed(2) || '0.00'}
                <span className="text-base font-normal text-orange-brand ml-1">/ meter</span>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">
                Calculated manufacturing cost in PKR (Zero margin phase 1 boundary)
              </span>
            </div>

            {/* Structured Audit Section matching Prompt Specification */}
            {audit && (
              <div className="space-y-4 text-xs">
                {/* WARP SECTION */}
                <div className="p-3.5 bg-[#14151B] rounded-lg border border-dark-border space-y-1.5 font-mono">
                  <span className="text-[11px] font-bold text-orange-brand tracking-wider uppercase block font-sans">
                    WARP SPECIFICATION
                  </span>
                  <div className="flex justify-between text-gray-400">
                    <span>Count:</span>
                    <strong className="text-white">{audit.warp.count} {audit.warp.countSystem} ({audit.warp.equivalentNe} Ne)</strong>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Rate:</span>
                    <strong className="text-white">Rs. {audit.warp.rate}/kg</strong>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Theoretical consumption:</span>
                    <span className="text-gray-300">{audit.warp.theoreticalConsumptionKgM} kg/m</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Crimp / Take-up:</span>
                    <span className="text-gray-300">+{audit.warp.crimpPct}% (+{audit.warp.crimpWeightKgM} kg/m)</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Wastage:</span>
                    <span className="text-gray-300">+{audit.warp.wastagePct}% (+{audit.warp.wastageWeightKgM} kg/m)</span>
                  </div>
                  <div className="flex justify-between text-gray-300 pt-1 border-t border-dark-border/40 font-semibold">
                    <span>Adjusted consumption:</span>
                    <span className="text-white">{audit.warp.adjustedConsumptionKgM} kg/m</span>
                  </div>
                  <div className="flex justify-between text-orange-400 font-bold">
                    <span>Warp Cost:</span>
                    <span>Rs. {audit.warp.costPerMeter.toFixed(2)}/m</span>
                  </div>
                </div>

                {/* WEFT SECTION */}
                <div className="p-3.5 bg-[#14151B] rounded-lg border border-dark-border space-y-1.5 font-mono">
                  <span className="text-[11px] font-bold text-orange-brand tracking-wider uppercase block font-sans">
                    WEFT SPECIFICATION
                  </span>
                  <div className="flex justify-between text-gray-400">
                    <span>Count:</span>
                    <strong className="text-white">{audit.weft.count} {audit.weft.countSystem} ({audit.weft.equivalentNe} Ne)</strong>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Rate:</span>
                    <strong className="text-white">Rs. {audit.weft.rate}/kg</strong>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Theoretical consumption:</span>
                    <span className="text-gray-300">{audit.weft.theoreticalConsumptionKgM} kg/m</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Crimp / Take-up:</span>
                    <span className="text-gray-300">+{audit.weft.crimpPct}% (+{audit.weft.crimpWeightKgM} kg/m)</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Wastage:</span>
                    <span className="text-gray-300">+{audit.weft.wastagePct}% (+{audit.weft.wastageWeightKgM} kg/m)</span>
                  </div>
                  <div className="flex justify-between text-gray-300 pt-1 border-t border-dark-border/40 font-semibold">
                    <span>Adjusted consumption:</span>
                    <span className="text-white">{audit.weft.adjustedConsumptionKgM} kg/m</span>
                  </div>
                  <div className="flex justify-between text-orange-400 font-bold">
                    <span>Weft Cost:</span>
                    <span>Rs. {audit.weft.costPerMeter.toFixed(2)}/m</span>
                  </div>
                </div>

                {/* PROCESS CHARGES SECTION */}
                <div className="p-3.5 bg-[#14151B] rounded-lg border border-dark-border space-y-1.5 font-mono">
                  <span className="text-[11px] font-bold text-gray-300 tracking-wider uppercase block font-sans">
                    PROCESS CONVERSION
                  </span>
                  <div className="flex justify-between text-gray-400">
                    <span>Sizing ({audit.process.sizingChargeType}):</span>
                    <span className="text-white">Rs. {audit.process.sizingCostPerMeter.toFixed(2)}/m</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Weaving ({audit.process.weavingChargeType}):</span>
                    <span className="text-white">Rs. {audit.process.weavingCostPerMeter.toFixed(2)}/m</span>
                  </div>
                  {audit.process.otherCostPerMeter > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Other Auxiliaries:</span>
                      <span className="text-white">Rs. {audit.process.otherCostPerMeter.toFixed(2)}/m</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-300 pt-1 border-t border-dark-border/40 font-semibold">
                    <span>Total Process Charges:</span>
                    <span className="text-white">Rs. {audit.process.totalProcessCostPerMeter.toFixed(2)}/m</span>
                  </div>
                </div>

                {/* PHYSICAL DENSITY SUMMARY */}
                <div className="p-3 bg-[#121317] rounded-lg border border-dark-border grid grid-cols-3 gap-2 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-gray-500 block font-sans">Total Yarn</span>
                    <span className="text-xs font-bold text-white">
                      {audit.summary.totalYarnConsumptionKgM} kg/m
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block font-sans">GLM</span>
                    <span className="text-xs font-bold text-white">
                      {calculation.weights.glm} g
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 block font-sans">GSM</span>
                    <span className="text-xs font-bold text-orange-brand">
                      {calculation.weights.gsm} g/m²
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
