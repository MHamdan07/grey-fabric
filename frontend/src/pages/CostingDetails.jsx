import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Printer,
  Copy,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { costingService } from '../services/costingService';

export const CostingDetails = ({ costingId, onBack, onDuplicate, onEdit }) => {
  const [costing, setCosting] = useState(null);
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (costingId) loadCosting();
  }, [costingId]);

  const loadCosting = async () => {
    try {
      setLoading(true);
      const res = await costingService.getById(costingId);
      if (res?.data) {
        setCosting(res.data);
        setCalculation(res.calculation);
      }
    } catch (err) {
      console.error('Error fetching costing details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 font-medium">
        Loading costing specification...
      </div>
    );
  }

  if (!costing) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-gray-400">Costing record not found.</p>
        <Button variant="secondary" size="sm" onClick={onBack}>
          Back to History
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to History
        </button>

        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onEdit(costing)}
            >
              Edit Specification
            </Button>
          )}
          <Button variant="secondary" size="sm" icon={Printer} onClick={handlePrint}>
            Print Costing Sheet
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Copy}
            onClick={() => onDuplicate && onDuplicate(costing.id)}
          >
            Duplicate Spec
          </Button>
        </div>
      </div>

      {/* Printable Sheet Card */}
      <div className="bg-dark-card border border-dark-border rounded-2xl p-8 shadow-card space-y-8 print:bg-white print:text-black print:border-none">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-dark-border pb-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-orange-brand font-bold">
              GREY FABRIC TECHNICAL COST SHEET
            </span>
            <h1 className="text-2xl font-bold text-white mt-1">{costing.article_name}</h1>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              Code: {costing.fabric_code} • ID: {costing.costing_id}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-gray-400 block">Grey Fabric Net Cost (PKR)</span>
            <div className="text-3xl font-black text-orange-brand font-mono mt-0.5">
              Rs. {costing.grey_cost_per_meter.toFixed(2)}
              <span className="text-sm font-medium text-gray-400"> / meter</span>
            </div>
          </div>
        </div>

        {/* 3 Columns Spec Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Construction */}
          <div className="p-4 rounded-xl bg-[#13141A] border border-dark-border space-y-2">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
              Fabric Geometry
            </span>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Width:</span> <strong className="text-white font-mono">{costing.width}"</strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>EPI x PPI:</span>{' '}
                <strong className="text-white font-mono">
                  {costing.epi} x {costing.ppi}
                </strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Total Ends:</span>{' '}
                <strong className="text-white font-mono">
                  {calculation?.weights?.total_ends || Math.round(costing.width * costing.epi)}
                </strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>GSM:</span>{' '}
                <strong className="text-orange-brand font-mono">{costing.gsm} g/m²</strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>GLM:</span>{' '}
                <strong className="text-white font-mono">{costing.glm} g/mtr</strong>
              </div>
            </div>
          </div>

          {/* Warp Details */}
          <div className="p-4 rounded-xl bg-[#13141A] border border-dark-border space-y-2">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
              Warp Specifications
            </span>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Yarn Count:</span>{' '}
                <strong className="text-white font-mono">{costing.warp_count} Ne</strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Rate:</span>{' '}
                <strong className="text-white font-mono">Rs. {costing.warp_rate}/kg</strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Wastage & Crimp:</span>{' '}
                <strong className="text-white font-mono">{costing.warp_wastage}%</strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Warp Weight:</span>{' '}
                <strong className="text-white font-mono">{costing.warp_weight_kg} kg/m</strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Net Warp Cost:</span>{' '}
                <strong className="text-orange-brand font-mono">
                  Rs. {costing.warp_cost.toFixed(2)}/m
                </strong>
              </div>
            </div>
          </div>

          {/* Weft Details */}
          <div className="p-4 rounded-xl bg-[#13141A] border border-dark-border space-y-2">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider block">
              Weft Specifications
            </span>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Yarn Count:</span>{' '}
                <strong className="text-white font-mono">{costing.weft_count} Ne</strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Rate:</span>{' '}
                <strong className="text-white font-mono">Rs. {costing.weft_rate}/kg</strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Wastage & Crimp:</span>{' '}
                <strong className="text-white font-mono">{costing.weft_wastage}%</strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Weft Weight:</span>{' '}
                <strong className="text-white font-mono">{costing.weft_weight_kg} kg/m</strong>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Net Weft Cost:</span>{' '}
                <strong className="text-orange-brand font-mono">
                  Rs. {costing.weft_cost.toFixed(2)}/m
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Cost Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Cost Components Breakdown (PKR)
          </h3>
          <div className="overflow-hidden border border-dark-border rounded-xl">
            <table className="w-full text-xs">
              <thead className="bg-[#14151A] text-gray-400 font-semibold border-b border-dark-border">
                <tr>
                  <th className="py-2.5 px-4 text-left">Component</th>
                  <th className="py-2.5 px-4 text-left">Basis / Formula</th>
                  <th className="py-2.5 px-4 text-right">Cost (PKR / meter)</th>
                  <th className="py-2.5 px-4 text-right">% Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40">
                <tr>
                  <td className="py-2.5 px-4 text-white font-medium">Warp Yarn (Base + Wastage)</td>
                  <td className="py-2.5 px-4 text-gray-400 font-mono">
                    {costing.warp_weight_kg} kg @ Rs. {costing.warp_rate}/kg
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-white">
                    Rs. {costing.warp_cost.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-gray-400">
                    {((costing.warp_cost / costing.grey_cost_per_meter) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-white font-medium">Weft Yarn (Base + Wastage)</td>
                  <td className="py-2.5 px-4 text-gray-400 font-mono">
                    {costing.weft_weight_kg} kg @ Rs. {costing.weft_rate}/kg
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-white">
                    Rs. {costing.weft_cost.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-gray-400">
                    {((costing.weft_cost / costing.grey_cost_per_meter) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-white font-medium">Sizing Charges</td>
                  <td className="py-2.5 px-4 text-gray-400">Standard warping & sizing</td>
                  <td className="py-2.5 px-4 text-right font-mono text-white">
                    Rs. {costing.sizing_charges.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-gray-400">
                    {((costing.sizing_charges / costing.grey_cost_per_meter) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-white font-medium">Weaving Charges</td>
                  <td className="py-2.5 px-4 text-gray-400">Airjet loom insertion</td>
                  <td className="py-2.5 px-4 text-right font-mono text-white">
                    Rs. {costing.weaving_charges.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-gray-400">
                    {((costing.weaving_charges / costing.grey_cost_per_meter) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 text-white font-medium">Other Auxiliaries</td>
                  <td className="py-2.5 px-4 text-gray-400">Mending & dispatch</td>
                  <td className="py-2.5 px-4 text-right font-mono text-white">
                    Rs. {costing.other_charges.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-gray-400">
                    {((costing.other_charges / costing.grey_cost_per_meter) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr className="bg-orange-pill font-bold">
                  <td className="py-3 px-4 text-orange-brand">GREY FABRIC NET COST</td>
                  <td className="py-3 px-4 text-orange-brand/70 font-mono">Per Linear Meter</td>
                  <td className="py-3 px-4 text-right font-mono text-orange-brand text-sm">
                    Rs. {costing.grey_cost_per_meter.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-orange-brand">100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Notes */}
        {costing.notes && (
          <div className="p-4 rounded-xl bg-[#13141A] border border-dark-border text-xs text-gray-400">
            <span className="font-semibold text-gray-300 block mb-0.5">Notes & Assumptions:</span>
            {costing.notes}
          </div>
        )}
      </div>
    </div>
  );
};
