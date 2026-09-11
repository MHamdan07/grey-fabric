const Charge = require('../models/Charge');
const ActivityLog = require('../models/ActivityLog');

const chargesController = {
    getAll: (req, res, next) => {
        try {
            const list = Charge.getAll();
            res.json({ success: true, count: list.length, data: list });
        } catch (err) {
            next(err);
        }
    },

    getById: (req, res, next) => {
        try {
            const item = Charge.findById(req.params.id);
            if (!item) return res.status(404).json({ success: false, message: 'Charge item not found' });
            res.json({ success: true, data: item });
        } catch (err) {
            next(err);
        }
    },

    create: (req, res, next) => {
        try {
            const { charge_type, name, value, unit, effective_date, status } = req.body;
            if (!charge_type || !name || value === undefined) {
                return res.status(400).json({ success: false, message: 'Charge type, name, and numeric value are required.' });
            }

            const item = Charge.create({
                charge_type,
                name,
                value: parseFloat(value),
                unit: unit || 'per_meter',
                effective_date,
                status
            });

            ActivityLog.log({
                userId: req.user?.id,
                userName: req.user?.name,
                action: 'CREATE_CHARGE',
                module: 'charges',
                recordId: item.id,
                details: `Created charge: ${item.name} (${item.value} ${item.unit})`,
                ipAddress: req.ip
            });

            res.status(201).json({ success: true, message: 'Charge created successfully', data: item });
        } catch (err) {
            next(err);
        }
    },

    update: (req, res, next) => {
        try {
            const existing = Charge.findById(req.params.id);
            if (!existing) return res.status(404).json({ success: false, message: 'Charge not found' });

            const item = Charge.update(req.params.id, {
                charge_type: req.body.charge_type,
                name: req.body.name,
                value: req.body.value !== undefined ? parseFloat(req.body.value) : undefined,
                unit: req.body.unit,
                effective_date: req.body.effective_date,
                status: req.body.status
            });

            ActivityLog.log({
                userId: req.user?.id,
                userName: req.user?.name,
                action: 'UPDATE_CHARGE',
                module: 'charges',
                recordId: item.id,
                details: `Updated charge: ${item.name} = ${item.value}`,
                ipAddress: req.ip
            });

            res.json({ success: true, message: 'Charge updated successfully', data: item });
        } catch (err) {
            next(err);
        }
    },

    delete: (req, res, next) => {
        try {
            const existing = Charge.findById(req.params.id);
            if (!existing) return res.status(404).json({ success: false, message: 'Charge not found' });

            Charge.delete(req.params.id);

            ActivityLog.log({
                userId: req.user?.id,
                userName: req.user?.name,
                action: 'DELETE_CHARGE',
                module: 'charges',
                recordId: req.params.id,
                details: `Deleted charge ${existing.name}`,
                ipAddress: req.ip
            });

            res.json({ success: true, message: 'Charge deleted successfully' });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = chargesController;
