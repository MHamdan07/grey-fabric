import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { yarnService } from '../services/mastersService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const YarnMaster = () => {
  const { isAdmin } = useAuth();
  const { addToast } = useToast();
  const [yarns, setYarns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    yarn_count: '',
    count_value: '',
    yarn_type: '100% Combed Cotton',
    yarn_rate: '',
    supplier_name: '',
    effective_date: new Date().toISOString().slice(0, 10),
    status: 'active'
  });

  useEffect(() => {
    loadYarns();
  }, []);

  const loadYarns = async () => {
    try {
      setLoading(true);
      const res = await yarnService.getAll();
      if (res?.data) setYarns(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      yarn_count: '',
      count_value: '',
      yarn_type: '100% Combed Cotton',
      yarn_rate: '',
      supplier_name: '',
      effective_date: new Date().toISOString().slice(0, 10),
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (y) => {
    setEditingId(y.id);
    setFormData({
      yarn_count: y.yarn_count,
      count_value: y.count_value,
      yarn_type: y.yarn_type,
      yarn_rate: y.yarn_rate,
      supplier_name: y.supplier_name || '',
      effective_date: y.effective_date || new Date().toISOString().slice(0, 10),
      status: y.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await yarnService.update(editingId, formData);
        addToast('Yarn tariff updated successfully', 'success');
      } else {
        await yarnService.create(formData);
        addToast('New yarn added to master library', 'success');
      }
      setIsModalOpen(false);
      loadYarns();
    } catch (err) {
      addToast('Operation failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this yarn record?')) return;
    try {
      await yarnService.delete(id);
      addToast('Yarn record deleted', 'success');
      loadYarns();
    } catch (err) {
      addToast('Delete failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-orange-brand" />
            Yarn Master Data
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage spinning yarn counts, fiber blends, and procurement rates per kg.
          </p>
        </div>

        {isAdmin && (
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
            Add New Yarn
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <tr>
            <TableHead>Count Label</TableHead>
            <TableHead>Ne Value</TableHead>
            <TableHead>Yarn Blend / Type</TableHead>
            <TableHead>Supplier / Mill</TableHead>
            <TableHead>Effective Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Rate (PKR/kg)</TableHead>
            {isAdmin && <TableHead className="text-center">Actions</TableHead>}
          </tr>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                Loading yarns...
              </TableCell>
            </TableRow>
          ) : yarns.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                No yarns defined yet.
              </TableCell>
            </TableRow>
          ) : (
            yarns.map((y) => (
              <TableRow key={y.id}>
                <TableCell className="font-mono text-xs font-bold text-orange-brand">
                  {y.yarn_count}
                </TableCell>
                <TableCell className="font-mono text-gray-300">{y.count_value} Ne</TableCell>
                <TableCell className="text-white font-medium">{y.yarn_type}</TableCell>
                <TableCell className="text-gray-400">{y.supplier_name || 'Standard'}</TableCell>
                <TableCell className="text-gray-400 font-mono text-xs">
                  {y.effective_date}
                </TableCell>
                <TableCell>
                  <Badge variant={y.status === 'active' ? 'success' : 'neutral'} size="sm">
                    {y.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-white text-sm">
                  Rs. {y.yarn_rate.toFixed(2)}
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(y)}
                        title="Edit Yarn"
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222530] rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(y.id)}
                        title="Delete"
                        className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-[#222530] rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Yarn Item' : 'Add New Yarn Item'}
        subtitle="Specify count and supplier tariff per kilogram in PKR"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Yarn Count Label"
            required
            placeholder="e.g. 40s Ne, 30/1 Carded"
            value={formData.yarn_count}
            onChange={(e) => setFormData({ ...formData, yarn_count: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Count Value (Numeric Ne)"
              type="number"
              step="0.1"
              required
              placeholder="e.g. 40"
              value={formData.count_value}
              onChange={(e) => setFormData({ ...formData, count_value: e.target.value })}
            />
            <Input
              label="Rate per Kilogram (PKR)"
              type="number"
              step="1"
              required
              placeholder="e.g. 1050.00"
              value={formData.yarn_rate}
              onChange={(e) => setFormData({ ...formData, yarn_rate: e.target.value })}
            />
          </div>
          <Input
            label="Yarn Type / Blend"
            required
            placeholder="e.g. 100% Combed Compact Cotton"
            value={formData.yarn_type}
            onChange={(e) => setFormData({ ...formData, yarn_type: e.target.value })}
          />
          <Input
            label="Supplier / Spinning Mill"
            placeholder="e.g. Indus Valley Spinning Mills"
            value={formData.supplier_name}
            onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Effective Date"
              type="date"
              value={formData.effective_date}
              onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dark-border">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingId ? 'Save Changes' : 'Create Yarn'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
