const Yarn = require('../models/Yarn');
const ActivityLog = require('../models/ActivityLog');

const yarnController = {
    getAll: (req, res, next) => {
        try {
            const yarns = Yarn.getAll(req.query.status);
            res.json({ success: true, count: yarns.length, data: yarns });
        } catch (err) {
            next(err);
        }
    },

    getById: (req, res, next) => {
        try {
            const yarn = Yarn.findById(req.params.id);
            if (!yarn) return res.status(404).json({ success: false, message: 'Yarn not found' });
            res.json({ success: true, data: yarn });
        } catch (err) {
            next(err);
        }
    },

    create: (req, res, next) => {
        try {
            const { yarn_count, count_value, yarn_type, yarn_rate, supplier_name, effective_date, status } = req.body;
            if (!yarn_count || !count_value || !yarn_rate) {
                return res.status(400).json({ success: false, message: 'Yarn count name, count numeric value, and rate are required.' });
            }

            const item = Yarn.create({
                yarn_count,
                count_value: parseFloat(count_value),
                yarn_type: yarn_type || 'Cotton',
                yarn_rate: parseFloat(yarn_rate),
                supplier_name,
                effective_date,
                status
            });

            ActivityLog.log({
                userId: req.user?.id,
                userName: req.user?.name,
                action: 'CREATE_YARN',
                module: 'yarns',
                recordId: item.id,
                details: `Added yarn ${item.yarn_count} @ ${item.yarn_rate}/kg`,
                ipAddress: req.ip
            });

            res.status(201).json({ success: true, message: 'Yarn created successfully', data: item });
        } catch (err) {
            next(err);
        }
    },

    update: (req, res, next) => {
        try {
            const existing = Yarn.findById(req.params.id);
            if (!existing) return res.status(404).json({ success: false, message: 'Yarn not found' });

            const item = Yarn.update(req.params.id, {
                yarn_count: req.body.yarn_count,
                count_value: req.body.count_value ? parseFloat(req.body.count_value) : undefined,
                yarn_type: req.body.yarn_type,
                yarn_rate: req.body.yarn_rate !== undefined ? parseFloat(req.body.yarn_rate) : undefined,
                supplier_name: req.body.supplier_name,
                effective_date: req.body.effective_date,
                status: req.body.status
            });

            ActivityLog.log({
                userId: req.user?.id,
                userName: req.user?.name,
                action: 'UPDATE_YARN',
                module: 'yarns',
                recordId: item.id,
                details: `Updated yarn ${item.yarn_count} rate: ${item.yarn_rate}`,
                ipAddress: req.ip
            });

            res.json({ success: true, message: 'Yarn updated successfully', data: item });
        } catch (err) {
            next(err);
        }
    },

    delete: (req, res, next) => {
        try {
            const existing = Yarn.findById(req.params.id);
            if (!existing) return res.status(404).json({ success: false, message: 'Yarn not found' });

            Yarn.delete(req.params.id);

            ActivityLog.log({
                userId: req.user?.id,
                userName: req.user?.name,
                action: 'DELETE_YARN',
                module: 'yarns',
                recordId: req.params.id,
                details: `Deleted yarn ${existing.yarn_count}`,
                ipAddress: req.ip
            });

            res.json({ success: true, message: 'Yarn deleted successfully' });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = yarnController;
