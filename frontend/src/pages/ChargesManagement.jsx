import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Edit2, Trash2 } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { chargesService } from '../services/mastersService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const ChargesManagement = () => {
  const { isAdmin } = useAuth();
  const { addToast } = useToast();
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    charge_type: 'weaving',
    name: '',
    value: '',
    unit: 'per_meter',
    effective_date: new Date().toISOString().slice(0, 10),
    status: 'active'
  });

  useEffect(() => {
    loadCharges();
  }, []);

  const loadCharges = async () => {
    try {
      setLoading(true);
      const res = await chargesService.getAll();
      if (res?.data) setCharges(res.data);
    } catch (e) {
      console.error(e);
      addToast('Failed to load process charges', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      charge_type: 'weaving',
      name: '',
      value: '',
      unit: 'per_meter',
      effective_date: new Date().toISOString().slice(0, 10),
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingId(c.id);
    setFormData({
      charge_type: c.charge_type,
      name: c.name,
      value: c.value,
      unit: c.unit,
      effective_date: c.effective_date,
      status: c.status
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await chargesService.update(editingId, formData);
        addToast(`Charge "${formData.name}" updated successfully`, 'success');
      } else {
        await chargesService.create(formData);
        addToast(`New charge "${formData.name}" created successfully`, 'success');
      }
      setIsModalOpen(false);
      loadCharges();
    } catch (err) {
      addToast('Operation failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this process charge?')) return;
    try {
      await chargesService.delete(id);
      addToast('Process charge removed successfully', 'success');
      loadCharges();
    } catch (err) {
      addToast('Delete failed: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-orange-brand" />
            Process Charges Management
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Standard unit tariffs for warping, sizing, weaving loom insertion, and finishing preparation.
          </p>
        </div>

        {isAdmin && (
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
            Add Process Charge
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <tr>
            <TableHead>Charge Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Billing Unit</TableHead>
            <TableHead>Effective Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Tariff Rate (PKR)</TableHead>
            {isAdmin && <TableHead className="text-center">Actions</TableHead>}
          </tr>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                Loading charges...
              </TableCell>
            </TableRow>
          ) : charges.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                No process charges defined.
              </TableCell>
            </TableRow>
          ) : (
            charges.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-semibold text-white">
                  {c.name}
                </TableCell>
                <TableCell>
                  <span className="capitalize font-mono text-xs text-gray-300">
                    {c.charge_type}
                  </span>
                </TableCell>
                <TableCell className="text-gray-400 text-xs">
                  {c.unit === 'per_meter' ? 'Per Linear Meter (Rs./m)' : c.unit}
                </TableCell>
                <TableCell className="text-gray-400 font-mono text-xs">
                  {c.effective_date}
                </TableCell>
                <TableCell>
                  <Badge variant={c.status === 'active' ? 'success' : 'neutral'} size="sm">
                    {c.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-orange-brand text-sm">
                  Rs. {c.value.toFixed(2)}
                </TableCell>
                {isAdmin && (
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        title="Edit Charge"
                        className="p-1.5 text-gray-400 hover:text-white hover:bg-[#222530] rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        title="Delete Charge"
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
        title={editingId ? 'Edit Process Charge' : 'Add New Process Charge'}
        subtitle="Configure standardized conversion charge tariffs"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Charge Description Name"
            required
            placeholder="e.g. Airjet High-Speed Weaving"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Charge Category"
              value={formData.charge_type}
              onChange={(e) => setFormData({ ...formData, charge_type: e.target.value })}
              options={[
                { value: 'sizing', label: 'Warping & Sizing' },
                { value: 'weaving', label: 'Weaving Insertion' },
                { value: 'inspection', label: 'Grading & Inspection' },
                { value: 'freight', label: 'Folding & Baling' },
                { value: 'other', label: 'Auxiliary Overhead' }
              ]}
            />
            <Input
              label="Tariff Value (PKR)"
              type="number"
              step="0.5"
              required
              placeholder="e.g. 28.50"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Charge Unit"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              options={[
                { value: 'per_meter', label: 'Per Linear Meter (Rs./m)' },
                { value: 'per_kg', label: 'Per Kilogram Warp (Rs./kg)' },
                { value: 'flat', label: 'Flat Lump-sum (Rs.)' }
              ]}
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
              {editingId ? 'Save Changes' : 'Create Charge'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
