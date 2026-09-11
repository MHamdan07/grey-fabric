const Fabric = require('../models/Fabric');
const ActivityLog = require('../models/ActivityLog');

const fabricController = {
    getAll: (req, res, next) => {
        try {
            const list = Fabric.getAll();
            res.json({ success: true, count: list.length, data: list });
        } catch (err) {
            next(err);
        }
    },

    getById: (req, res, next) => {
        try {
            const item = Fabric.findById(req.params.id);
            if (!item) return res.status(404).json({ success: false, message: 'Fabric not found' });
            res.json({ success: true, data: item });
        } catch (err) {
            next(err);
        }
    },

    create: (req, res, next) => {
        try {
            const { article_name, fabric_code, width, epi, ppi } = req.body;
            if (!article_name || !fabric_code || !width || !epi || !ppi) {
                return res.status(400).json({ success: false, message: 'Article name, fabric code, width, EPI, and PPI are required.' });
            }

            const item = Fabric.create(req.body);

            ActivityLog.log({
                userId: req.user?.id,
                userName: req.user?.name,
                action: 'CREATE_FABRIC',
                module: 'fabrics',
                recordId: item.id,
                details: `Created fabric article ${item.article_name} (${item.fabric_code})`,
                ipAddress: req.ip
            });

            res.status(201).json({ success: true, message: 'Fabric created successfully', data: item });
        } catch (err) {
            next(err);
        }
    },

    update: (req, res, next) => {
        try {
            const existing = Fabric.findById(req.params.id);
            if (!existing) return res.status(404).json({ success: false, message: 'Fabric not found' });

            const item = Fabric.update(req.params.id, req.body);

            ActivityLog.log({
                userId: req.user?.id,
                userName: req.user?.name,
                action: 'UPDATE_FABRIC',
                module: 'fabrics',
                recordId: item.id,
                details: `Updated fabric article ${item.article_name}`,
                ipAddress: req.ip
            });

            res.json({ success: true, message: 'Fabric updated successfully', data: item });
        } catch (err) {
            next(err);
        }
    },

    delete: (req, res, next) => {
        try {
            const existing = Fabric.findById(req.params.id);
            if (!existing) return res.status(404).json({ success: false, message: 'Fabric not found' });

            Fabric.delete(req.params.id);

            ActivityLog.log({
                userId: req.user?.id,
                userName: req.user?.name,
                action: 'DELETE_FABRIC',
                module: 'fabrics',
                recordId: req.params.id,
                details: `Deleted fabric ${existing.article_name}`,
                ipAddress: req.ip
            });

            res.json({ success: true, message: 'Fabric deleted successfully' });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = fabricController;
