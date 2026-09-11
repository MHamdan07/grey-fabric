import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import {
  TrendingUp,
  Layers,
  Sparkles,
  ArrowRight,
  Eye,
  Copy,
  Trash2,
  Info,
  CheckCircle2,
  Scale
} from 'lucide-react';
import { KpiCard } from '../components/ui/KpiCard';
import { Button } from '../components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { costingService } from '../services/costingService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Dashboard = ({ onNavigate, selectedDays = 30 }) => {
  const { addToast } = useToast();
  const { isAdmin } = useAuth();
  const [kpis, setKpis] = useState({
    totalCostings: 8,
    todayCostings: 1,
    totalFabrics: 4,
    yarnUpdates: 6,
    avgGreyCost: 266.75
  });
  const [trendData, setTrendData] = useState([]);
  const [recentCostings, setRecentCostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30D');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadDashboardData(timeRangeToDays(timeRange));
  }, [timeRange, selectedDays]);

  const timeRangeToDays = (range) => {
    switch (range) {
      case '1D': return 1;
      case '7D': return 7;
      case '30D': return 30;
      case '90D': return 90;
      default: return 30;
    }
  };

  const loadDashboardData = async (days = 30) => {
    try {
      setLoading(true);
      const [kpiRes, trendRes, listRes] = await Promise.all([
        costingService.getKpis().catch(() => null),
        costingService.getTrend(days).catch(() => null),
        costingService.getAll({ limit: 6 }).catch(() => null)
      ]);

      if (kpiRes?.data) {
        setKpis(prev => ({ ...prev, ...kpiRes.data }));
      }

      if (trendRes?.data && trendRes.data.length > 0) {
        setTrendData(trendRes.data.map(d => ({
          name: d.date.slice(5),
          cost: Number(d.avg_cost.toFixed(2)),
          count: d.count
        })));
      } else {
        setTrendData([
          { name: 'May 7', cost: 245.2, count: 8 },
          { name: 'May 12', cost: 252.8, count: 12 },
          { name: 'May 17', cost: 268.5, count: 15 },
          { name: 'May 22', cost: 261.0, count: 18 },
          { name: 'May 27', cost: 274.6, count: 14 },
          { name: 'Jun 1', cost: 269.2, count: 22 },
          { name: 'Jun 6', cost: 288.5, count: 28 },
        ]);
      }

      if (listRes?.data) {
        setRecentCostings(listRes.data);
      }
    } catch (e) {
      console.error('Error loading dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateCosting = async (id, e) => {
    e.stopPropagation();
    try {
      setActionLoading(id);
      const res = await costingService.duplicate(id);
      if (res?.success) {
        addToast(`Costing duplicated: ${res.data.costing_id}`, 'success');
        loadDashboardData(timeRangeToDays(timeRange));
      }
    } catch (err) {
      addToast('Failed to duplicate costing: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCosting = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this costing record?')) return;
    try {
      setActionLoading(id);
      await costingService.delete(id);
      addToast('Costing record deleted successfully', 'success');
      loadDashboardData(timeRangeToDays(timeRange));
    } catch (err) {
      addToast('Delete failed: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const costFactors = [
    { label: 'Warp Yarn Share', pct: 54, cost: 'Rs. 145.50/m' },
    { label: 'Weft Yarn Share', pct: 28, cost: 'Rs. 75.20/m' },
    { label: 'Weaving Charges', pct: 12, cost: 'Rs. 32.00/m' },
    { label: 'Sizing Charges', pct: 5, cost: 'Rs. 14.50/m' },
    { label: 'Auxiliaries & Mending', pct: 1, cost: 'Rs. 4.50/m' }
  ];

  const heatmapWeeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
  const heatmapRows = [
    { name: 'Poplin 40s', cells: [265, 268, 272, 270, null, null, null, null] },
    { name: 'Sheeting 30s', cells: [235, 238, 242, 240, 238, null, null, null] },
    { name: 'Twill 20x16', cells: [315, 320, 328, 325, 322, 318, null, null] },
    { name: 'Cambric 50s', cells: [285, 290, 298, 295, 292, 288, 285, null] },
    { name: 'Pocketing 40s', cells: [240, 244, 248, 245, 242, 239, 238, 235] },
  ];

  return (
    <div className="space-y-6">
      {/* Top 5 KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard
          title="Total Costings"
          value={kpis.totalCostings.toLocaleString()}
          change="↑ 12%"
          isPositive={true}
          subtitle="All calculated batches"
          infoText="All historical grey costing calculations generated"
        />
        <KpiCard
          title="Today's Costings"
          value={kpis.todayCostings}
          change="↑ 8%"
          isPositive={true}
          subtitle="Run today"
        />
        <KpiCard
          title="Active Fabrics"
          value={kpis.totalFabrics}
          change="Standard"
          isPositive={true}
          subtitle="Master specs in library"
        />
        <KpiCard
          title="Yarn Rate Updates"
          value={kpis.yarnUpdates}
          change="This Month"
          isPositive={true}
          subtitle="Active mill tariffs"
        />
        <KpiCard
          title="Average Grey Cost"
          value={`Rs. ${kpis.avgGreyCost.toFixed(2)}`}
          change="PKR / Meter"
          isPositive={true}
          subtitle="Weighted factory cost"
        />
      </div>

      {/* Yarn → Fabric Production Planning Analytics Widget */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dark-border/60 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-orange-brand" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Yarn → Fabric Production Planning
            </h3>
            <span className="text-[10px] bg-orange-pill text-orange-brand px-2 py-0.5 rounded font-mono font-bold border border-orange-border">
              Rs. 10 Lakh Benchmark
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('yarn-to-fabric')}
              className="text-xs text-orange-brand hover:underline flex items-center gap-1 font-semibold"
            >
              Yarn → Fabric Engine <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-gray-600">|</span>
            <button
              onClick={() => onNavigate('fabric-to-yarn')}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-medium"
            >
              Fabric → Yarn Engine <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-[#14151B] rounded-lg border border-dark-border">
            <span className="text-gray-400 block mb-1">Available Yarn</span>
            <strong className="text-white font-mono text-base block">2,000 kg</strong>
            <span className="text-[10px] text-gray-500 block mt-0.5">Rs. 10,00,000 Stock</span>
          </div>
          <div className="p-3 bg-[#14151B] rounded-lg border border-dark-border">
            <span className="text-gray-400 block mb-1">Expected Fabric</span>
            <strong className="text-orange-brand font-mono text-base block">17,575 m</strong>
            <span className="text-[10px] text-gray-500 block mt-0.5">Usable Finished Grey</span>
          </div>
          <div className="p-3 bg-[#14151B] rounded-lg border border-dark-border">
            <span className="text-gray-400 block mb-1">Planned Target</span>
            <strong className="text-white font-mono text-base block">20,000 m</strong>
            <span className="text-[10px] text-gray-500 block mt-0.5">Production Order</span>
          </div>
          <div className="p-3 bg-[#14151B] rounded-lg border border-dark-border">
            <span className="text-gray-400 block mb-1">Required Yarn</span>
            <strong className="text-orange-brand font-mono text-base block">2,276 kg</strong>
            <span className="text-[10px] text-gray-500 block mt-0.5">Procurement Allocation</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-400">Yarn Utilization</span>
              <span className="font-mono font-bold text-orange-brand">91%</span>
            </div>
            <div className="w-full h-2 bg-[#121318] rounded-full overflow-hidden border border-dark-border">
              <div className="h-full bg-orange-brand rounded-full" style={{ width: '91%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-400">Expected Production Efficiency</span>
              <span className="font-mono font-bold text-emerald-400">88%</span>
            </div>
            <div className="w-full h-2 bg-[#121318] rounded-full overflow-hidden border border-dark-border">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Glowing Orange Area Chart */}
        <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-5 flex flex-col justify-between shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">Costing Trend Over Time</h3>
              <Info className="w-3.5 h-3.5 text-gray-500 cursor-pointer" />
            </div>

            {/* Time Filter Tabs (Interactive) */}
            <div className="flex items-center bg-[#121317] border border-dark-border rounded-lg p-0.5 text-xs">
              {['1D', '7D', '30D', '90D'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTimeRange(t);
                    addToast(`Viewing ${t} costing trend`, 'info', 2000);
                  }}
                  className={`px-3 py-1 rounded-md transition-all font-medium ${
                    timeRange === t
                      ? 'bg-orange-brand text-white shadow-glow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Glowing Canvas */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="orangeGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F66103" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#F66103" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#22242C" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#5A6070"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#24262E' }}
                />
                <YAxis
                  stroke="#5A6070"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#24262E' }}
                  tickFormatter={(v) => `Rs.${v}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[#181A22] border border-orange-brand/60 px-3 py-2 rounded-lg shadow-glow-sm">
                          <p className="text-[11px] text-gray-400 font-mono">{payload[0].payload.name}</p>
                          <p className="text-sm font-bold text-orange-brand flex items-center gap-1 mt-0.5">
                            <span>Avg Grey Cost:</span> Rs. {payload[0].value}/mtr
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke="#F66103"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#orangeGlow)"
                  dot={{ r: 4, fill: '#F66103', stroke: '#121316', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#FFA057', stroke: '#F66103', strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-dark-border mt-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-brand" />
              Weighted Average Grey Fabric Cost (PKR / mtr)
            </span>
            <span className="text-gray-500 font-mono">Currency: PKR (Pakistani Rupee)</span>
          </div>
        </div>

        {/* Cost Distribution by Factor Panel */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex flex-col justify-between shadow-card">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                Costing by Factor
                <Info className="w-3.5 h-3.5 text-gray-500" />
              </h3>
              <span className="text-xs text-gray-400 font-mono">100% Total</span>
            </div>

            <div className="space-y-4 my-2">
              {costFactors.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-300 font-medium">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 font-mono">{item.cost}</span>
                      <span className="text-white font-bold">{item.pct}%</span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-[#121316] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-brand to-[#FF802B] rounded-full transition-all duration-500 shadow-glow-sm"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigate('reports')}
            className="w-full mt-4 py-2.5 px-3 bg-[#131419] hover:bg-[#1C1E26] border border-dark-border rounded-lg text-xs font-semibold text-gray-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            View Costing Breakdown Report <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Secondary Row: Heatmap + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap */}
        <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              Fabric Cost Stability Heatmap
              <Info className="w-3.5 h-3.5 text-gray-500" />
            </h3>
            <span className="text-xs text-gray-400">Past 8 Production Batches (PKR/m)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-dark-border text-center">
                  <th className="text-left py-2 px-3 font-medium">Article Spec</th>
                  {heatmapWeeks.map((w) => (
                    <th key={w} className="py-2 px-2 font-medium">{w}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/40">
                {heatmapRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-dark-cardLighter transition-colors">
                    <td className="py-2.5 px-3 text-gray-300 font-medium whitespace-nowrap">
                      {row.name}
                    </td>
                    {row.cells.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2 px-1.5 text-center">
                        {cell ? (
                          <span
                            className={`inline-block w-9 py-1 rounded text-[11px] font-bold ${
                              cell > 300
                                ? 'bg-orange-brand text-white'
                                : cell > 260
                                ? 'bg-orange-brand/70 text-white'
                                : 'bg-orange-brand/35 text-orange-200'
                            }`}
                          >
                            {cell}
                          </span>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-3 border-t border-dark-border">
            <span>Low Variance (Rs. 230/m)</span>
            <div className="w-36 h-2 rounded bg-gradient-to-r from-orange-brand/20 via-orange-brand/60 to-orange-brand" />
            <span>High Variance (Rs. 330/m)</span>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex flex-col justify-between shadow-card">
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Quick Textile Actions</h3>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => onNavigate('new-costing')}
                className="w-full p-3 rounded-lg bg-orange-brand/10 border border-orange-brand/30 hover:border-orange-brand/60 flex items-center justify-between text-left group transition-all cursor-pointer"
              >
                <div>
                  <p className="text-xs font-bold text-orange-brand group-hover:text-orange-hover">
                    + Calculate New Grey Costing
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Live ends, picks, warp/weft crimp formula
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-orange-brand group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('yarn-master')}
                className="w-full p-3 rounded-lg bg-[#14151B] border border-dark-border hover:border-[#353845] flex items-center justify-between text-left group transition-all cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-gray-200 group-hover:text-white">
                    Update Yarn Market Rates
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Auto-recalculates linked fabrics (PKR/kg)
                  </p>
                </div>
                <Layers className="w-4 h-4 text-gray-400" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate('comparison')}
                className="w-full p-3 rounded-lg bg-[#14151B] border border-dark-border hover:border-[#353845] flex items-center justify-between text-left group transition-all cursor-pointer"
              >
                <div>
                  <p className="text-xs font-semibold text-gray-200 group-hover:text-white">
                    Side-by-Side Cost Comparison
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Compare count densities & loom efficiency
                  </p>
                </div>
                <Sparkles className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-[#121317] border border-dark-border text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Standard Cotton Formula Engine</span>
            </div>
            <p className="text-[11px] text-gray-400">
              Deterministic Ne (840) constant: 1693.33. All values auditable in PKR.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Costings Table */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Costings</h3>
            <p className="text-xs text-gray-400 mt-0.5">Latest generated grey fabric costing specifications</p>
          </div>
          <button
            onClick={() => onNavigate('costing-history')}
            className="text-xs font-semibold text-orange-brand hover:text-orange-hover flex items-center gap-1 cursor-pointer"
          >
            View all history <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <Table>
          <TableHeader>
            <tr>
              <TableHead>Costing ID</TableHead>
              <TableHead>Article Name</TableHead>
              <TableHead>Construction</TableHead>
              <TableHead>Width</TableHead>
              <TableHead>GLM / GSM</TableHead>
              <TableHead>Warp Cost</TableHead>
              <TableHead>Weft Cost</TableHead>
              <TableHead className="text-right">Grey Cost (PKR/Mtr)</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {recentCostings.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-xs text-orange-brand font-semibold">
                  {c.costing_id}
                </TableCell>
                <TableCell className="font-medium text-white">
                  {c.article_name}
                </TableCell>
                <TableCell className="text-gray-300 font-mono text-xs">
                  {c.warp_count}x{c.weft_count} / {c.epi}x{c.ppi}
                </TableCell>
                <TableCell className="text-gray-400">{c.width}"</TableCell>
                <TableCell className="text-gray-400 text-xs font-mono">
                  {c.glm}g / {c.gsm} g/m²
                </TableCell>
                <TableCell className="text-gray-300">Rs. {c.warp_cost.toFixed(2)}</TableCell>
                <TableCell className="text-gray-300">Rs. {c.weft_cost.toFixed(2)}</TableCell>
                <TableCell className="text-right font-bold text-orange-brand text-sm font-mono">
                  Rs. {c.grey_cost_per_meter.toFixed(2)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onNavigate('costing-details', c.id)}
                      title="View Details"
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222530] rounded transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDuplicateCosting(c.id, e)}
                      title="Duplicate Spec"
                      disabled={actionLoading === c.id}
                      className="p-1.5 text-gray-400 hover:text-orange-brand hover:bg-[#222530] rounded transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDeleteCosting(c.id, e)}
                        title="Delete (Admin)"
                        disabled={actionLoading === c.id}
                        className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-[#222530] rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
