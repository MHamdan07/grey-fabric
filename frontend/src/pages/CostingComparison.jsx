import React, { useState, useEffect } from 'react';
import { GitCompare, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { costingService } from '../services/costingService';
import { useToast } from '../context/ToastContext';

export const CostingComparison = ({ onNavigate }) => {
  const { addToast } = useToast();
  const [allCostings, setAllCostings] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadList();
  }, []);

  const loadList = async () => {
    try {
      setLoading(true);
      const res = await costingService.getAll();
      if (res?.data) {
        setAllCostings(res.data);
        // Default pick first 2
        if (res.data.length >= 2) {
          setSelectedIds([res.data[0].id, res.data[1].id]);
        } else if (res.data.length === 1) {
          setSelectedIds([res.data[0].id]);
        }
      }
    } catch (e) {
      console.error(e);
      addToast('Failed to load costings for comparison', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
      addToast('Removed specification from comparison', 'info');
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
        const added = allCostings.find(c => c.id === id);
        addToast(`Added "${added?.article_name || 'Spec'}" to comparison`, 'success');
      } else {
        addToast('You can compare up to 3 costings simultaneously', 'info');
      }
    }
  };

  const comparedCostings = allCostings.filter((c) => selectedIds.includes(c.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-orange-brand" />
            Costing Comparison Matrix
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Compare up to 3 fabric construction variants side-by-side to evaluate yarn costs and weight differences.
          </p>
        </div>

        {/* Quick selector dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Add to Compare:</span>
          <select
            onChange={(e) => e.target.value && handleToggleSelect(Number(e.target.value))}
            value=""
            className="bg-[#14151B] border border-dark-border text-xs text-white rounded-lg px-3 py-1.5 focus:border-orange-brand outline-none"
          >
            <option value="">Choose costing...</option>
            {allCostings
              .filter((c) => !selectedIds.includes(c.id))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.article_name} (Rs. {c.grey_cost_per_meter.toFixed(2)})
                </option>
              ))}
          </select>
        </div>
      </div>

      {comparedCostings.length === 0 ? (
        <div className="p-12 text-center bg-dark-card border border-dark-border rounded-xl text-gray-500">
          No costings selected for comparison. Pick at least two above.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="border border-dark-border rounded-2xl bg-dark-card overflow-hidden shadow-card">
              <table className="w-full text-xs text-left">
                {/* Headers */}
                <thead>
                  <tr className="bg-[#141519] border-b border-dark-border">
                    <th className="py-4 px-5 text-gray-400 font-semibold w-1/4">
                      Specification Parameter
                    </th>
                    {comparedCostings.map((c) => (
                      <th key={c.id} className="py-4 px-5 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-orange-brand font-mono text-[10px] block">
                              {c.costing_id}
                            </span>
                            <span className="font-bold text-sm block">{c.article_name}</span>
                          </div>
                          <button
                            onClick={() => handleToggleSelect(c.id)}
                            className="text-gray-500 hover:text-rose-400 p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/40">
                  {/* Construction Row */}
                  <tr className="bg-[#16171E]/50">
                    <td className="py-2.5 px-5 font-semibold text-gray-300">Fabric Width</td>
                    {comparedCostings.map((c) => (
                      <td key={c.id} className="py-2.5 px-5 font-mono text-white">
                        {c.width} inches
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-semibold text-gray-300">EPI x PPI Density</td>
                    {comparedCostings.map((c) => (
                      <td key={c.id} className="py-2.5 px-5 font-mono text-white">
                        {c.epi} x {c.ppi}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-semibold text-gray-300">Warp Count / Rate</td>
                    {comparedCostings.map((c) => (
                      <td key={c.id} className="py-2.5 px-5 font-mono text-gray-300">
                        {c.warp_count}s Ne @ Rs. {c.warp_rate}/kg
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-semibold text-gray-300">Weft Count / Rate</td>
                    {comparedCostings.map((c) => (
                      <td key={c.id} className="py-2.5 px-5 font-mono text-gray-300">
                        {c.weft_count}s Ne @ Rs. {c.weft_rate}/kg
                      </td>
                    ))}
                  </tr>

                  {/* Weight Row */}
                  <tr className="bg-[#16171E]/50">
                    <td className="py-2.5 px-5 font-semibold text-gray-300">Warp Weight (kg/m)</td>
                    {comparedCostings.map((c) => (
                      <td key={c.id} className="py-2.5 px-5 font-mono text-white">
                        {c.warp_weight_kg} kg
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-semibold text-gray-300">Weft Weight (kg/m)</td>
                    {comparedCostings.map((c) => (
                      <td key={c.id} className="py-2.5 px-5 font-mono text-white">
                        {c.weft_weight_kg} kg
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-semibold text-gray-300">GSM / Density</td>
                    {comparedCostings.map((c) => (
                      <td key={c.id} className="py-2.5 px-5 font-mono text-orange-brand font-bold">
                        {c.gsm} g/m²
                      </td>
                    ))}
                  </tr>

                  {/* Costs */}
                  <tr className="bg-[#16171E]/50">
                    <td className="py-2.5 px-5 font-semibold text-gray-300">Warp Yarn Cost</td>
                    {comparedCostings.map((c) => (
                      <td key={c.id} className="py-2.5 px-5 font-mono text-white">
                        Rs. {c.warp_cost.toFixed(2)}/m
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-semibold text-gray-300">Weft Yarn Cost</td>
                    {comparedCostings.map((c) => (
                      <td key={c.id} className="py-2.5 px-5 font-mono text-white">
                        Rs. {c.weft_cost.toFixed(2)}/m
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-2.5 px-5 font-semibold text-gray-300">Total Process Charges</td>
                    {comparedCostings.map((c) => (
                      <td key={c.id} className="py-2.5 px-5 font-mono text-white">
                        Rs. {(c.sizing_charges + c.weaving_charges + c.other_charges).toFixed(2)}/m
                      </td>
                    ))}
                  </tr>

                  {/* Summary Bottom Highlight */}
                  <tr className="bg-orange-pill">
                    <td className="py-4 px-5 font-bold text-orange-brand text-sm">
                      GREY FABRIC COST (PKR / METER)
                    </td>
                    {comparedCostings.map((c) => (
                      <td key={c.id} className="py-4 px-5 font-mono font-black text-orange-brand text-lg">
                        Rs. {c.grey_cost_per_meter.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
