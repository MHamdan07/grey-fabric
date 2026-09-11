import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Edit2, Trash2, Calculator } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { fabricService, yarnService } from '../services/mastersService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const FabricMaster = ({ onSelectCosting }) => {
  const { isAdmin } = useAuth();
  const { addToast } = useToast();
  const [fabrics, setFabrics] = useState([]);
  const [yarns, setYarns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    article_name: '',
    fabric_code: '',
    width: 63.0,
    epi: 133,
    ppi: 72,
    warp_yarn_id: '',
    weft_yarn_id: '',
    standard_wastage: 4.0,
    sizing_charges: 14.50,
    weaving_charges: 32.00,
    status: 'active'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fabRes, yarnRes] = await Promise.all([
        fabricService.getAll(),
        yarnService.getAll()
      ]);
      if (fabRes?.data) setFabrics(fabRes.data);
      if (yarnRes?.data) setYarns(yarnRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      article_name: '',
      fabric_code: '',
      width: 63.0,
      epi: 133,
      ppi: 72,
      warp_yarn_id: yarns[0]?.id || '',
      weft_yarn_id: yarns[0]?.id || '',
      standard_wastage: 4.0,
      sizing_charges: 14.50,
      weaving_charges: 32.00,
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (f) => {
    setEditingId(f.id);
    setFormData({
      article_name: f.article_name,
      fabric_code: f.fabric_code,
      width: f.width,
      epi: f.epi,
      ppi: f.ppi,
      warp_yarn_id: f.warp_yarn_id || '',
      weft_yarn_id: f.weft_yarn_id || '',
      standard_wastage: f.standard_wastage || 4.0,
      sizing_charges: f.sizing_charges || 0,
      weaving_charges: f.weaving_charges || 0,
      status: f.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fabricService.update(editingId, formData);
        addToast('Fabric article updated successfully', 'success');
      } else {
        await fabricService.create(formData);
        addToast('New fabric article created successfully', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      addToast('Operation failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this fabric article?')) return;
    try {
      await fabricService.delete(id);
      addToast('Fabric article removed', 'success');
      loadData();
    } catch (err) {
      addToast('Delete failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleLaunchCosting = (fabric) => {
    if (onSelectCosting) {
      const warpYarn = yarns.find((y) => y.id === fabric.warp_yarn_id);
      const weftYarn = yarns.find((y) => y.id === fabric.weft_yarn_id);

      onSelectCosting({
        article_name: fabric.article_name,
        fabric_code: fabric.fabric_code,
        width: fabric.width,
        epi: fabric.epi,
        ppi: fabric.ppi,
        warp_count: warpYarn ? warpYarn.count_value : 40,
        warp_rate: warpYarn ? warpYarn.yarn_rate : 1120,
        warp_wastage: fabric.standard_wastage || 3.5,
        weft_count: weftYarn ? weftYarn.count_value : 40,
        weft_rate: weftYarn ? weftYarn.yarn_rate : 1080,
        weft_wastage: fabric.standard_wastage || 4.0,
        sizing_charges: fabric.sizing_charges || 14.50,
        weaving_charges: fabric.weaving_charges || 32.00,
        other_charges: 5.50
      });
      addToast(`Pre-filled costing with ${fabric.article_name}`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-brand" />
            Fabric Master Library
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Standard grey fabric constructions, default reed width, ends/picks, and linked yarns.
          </p>
        </div>

        {isAdmin && (
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
            Add Fabric Article
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <tr>
            <TableHead>Article Name</TableHead>
            <TableHead>Fabric Code</TableHead>
            <TableHead>Width</TableHead>
            <TableHead>EPI x PPI</TableHead>
            <TableHead>Warp Yarn</TableHead>
            <TableHead>Weft Yarn</TableHead>
            <TableHead>Sizing / Weaving</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </tr>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                Loading fabrics...
              </TableCell>
            </TableRow>
          ) : fabrics.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6 text-gray-500">
                No fabrics registered in master yet.
              </TableCell>
            </TableRow>
          ) : (
            fabrics.map((f) => (
              <TableRow key={f.id}>
                <TableCell className="font-semibold text-white">
                  {f.article_name}
                </TableCell>
                <TableCell className="font-mono text-xs text-orange-brand font-bold">
                  {f.fabric_code}
                </TableCell>
                <TableCell className="text-gray-300 font-mono">{f.width}"</TableCell>
                <TableCell className="text-gray-300 font-mono text-xs">
                  {f.epi} x {f.ppi}
                </TableCell>
                <TableCell className="text-gray-300 text-xs">
                  {f.warp_yarn_name || 'Standard Cotton'}
                </TableCell>
                <TableCell className="text-gray-300 text-xs">
                  {f.weft_yarn_name || 'Standard Cotton'}
                </TableCell>
                <TableCell className="text-gray-400 font-mono text-xs">
                  Rs. {f.sizing_charges} / Rs. {f.weaving_charges}
                </TableCell>
                <TableCell>
                  <Badge variant={f.status === 'active' ? 'success' : 'neutral'} size="sm">
                    {f.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <button
                      onClick={() => handleLaunchCosting(f)}
                      title="Calculate Costing for this Fabric"
                      className="px-2 py-1 bg-orange-pill hover:bg-orange-brand/20 border border-orange-border text-[11px] font-semibold text-orange-brand rounded flex items-center gap-1 transition-colors"
                    >
                      <Calculator className="w-3 h-3" /> Cost
                    </button>
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEdit(f)}
                          title="Edit Article"
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222530] rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(f.id)}
                          title="Delete Article"
                          className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-[#222530] rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Fabric Article' : 'Create New Fabric Article'}
        subtitle="Specify standard construction parameters and default processing rates in PKR"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Article Name"
            required
            placeholder="e.g. Cotton Poplin 40x40"
            value={formData.article_name}
            onChange={(e) => setFormData({ ...formData, article_name: e.target.value })}
          />
          <Input
            label="Fabric Code"
            required
            placeholder="e.g. ART-POP-4040"
            value={formData.fabric_code}
            onChange={(e) => setFormData({ ...formData, fabric_code: e.target.value })}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Width (in)"
              type="number"
              step="0.5"
              required
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: e.target.value })}
            />
            <Input
              label="EPI"
              type="number"
              required
              value={formData.epi}
              onChange={(e) => setFormData({ ...formData, epi: e.target.value })}
            />
            <Input
              label="PPI"
              type="number"
              required
              value={formData.ppi}
              onChange={(e) => setFormData({ ...formData, ppi: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Default Warp Yarn"
              value={formData.warp_yarn_id}
              onChange={(e) => setFormData({ ...formData, warp_yarn_id: e.target.value })}
              options={[
                { value: '', label: 'Select yarn...' },
                ...yarns.map((y) => ({ value: y.id, label: `${y.yarn_count} (${y.yarn_type})` }))
              ]}
            />
            <Select
              label="Default Weft Yarn"
              value={formData.weft_yarn_id}
              onChange={(e) => setFormData({ ...formData, weft_yarn_id: e.target.value })}
              options={[
                { value: '', label: 'Select yarn...' },
                ...yarns.map((y) => ({ value: y.id, label: `${y.yarn_count} (${y.yarn_type})` }))
              ]}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Std Wastage %"
              type="number"
              step="0.1"
              value={formData.standard_wastage}
              onChange={(e) => setFormData({ ...formData, standard_wastage: e.target.value })}
            />
            <Input
              label="Sizing (Rs./m)"
              type="number"
              step="0.5"
              value={formData.sizing_charges}
              onChange={(e) => setFormData({ ...formData, sizing_charges: e.target.value })}
            />
            <Input
              label="Weaving (Rs./m)"
              type="number"
              step="0.5"
              value={formData.weaving_charges}
              onChange={(e) => setFormData({ ...formData, weaving_charges: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingId ? 'Save Changes' : 'Create Article'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
