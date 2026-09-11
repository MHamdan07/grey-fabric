const excelExportService = require('../services/export/excelExportService');
const ExportLog = require('../models/ExportLog');
const Costing = require('../models/Costing');
const ProductionPlan = require('../models/ProductionPlan');
const Yarn = require('../models/Yarn');
const Fabric = require('../models/Fabric');
const Charge = require('../models/Charge');
const User = require('../models/User');

const exportController = {
    exportCostingsExcel: async (req, res, next) => {
        try {
            const filters = req.body || {};
            const result = await excelExportService.exportCostingsExcel({
                filters,
                user: req.user
            });

            if (!result.recordCount) {
                return res.status(404).json({
                    success: false,
                    message: 'No records found for the selected filters.'
                });
            }

            // Log export event
            ExportLog.log({
                userId: req.user?.id,
                exportType: 'costings',
                fileFormat: 'xlsx',
                filters,
                recordCount: result.recordCount,
                ipAddress: req.ip
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.status(200).send(result.buffer);
        } catch (err) {
            next(err);
        }
    },

    exportCostingsCsv: async (req, res, next) => {
        try {
            const filters = req.body || {};
            const result = await excelExportService.exportCostingsCsv({
                filters,
                user: req.user
            });

            if (!result.recordCount) {
                return res.status(404).json({
                    success: false,
                    message: 'No records found for the selected filters.'
                });
            }

            ExportLog.log({
                userId: req.user?.id,
                exportType: 'costings',
                fileFormat: 'csv',
                filters,
                recordCount: result.recordCount,
                ipAddress: req.ip
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.status(200).send(result.csv);
        } catch (err) {
            next(err);
        }
    },

    exportProductionExcel: async (req, res, next) => {
        try {
            const filters = req.body || {};
            const result = await excelExportService.exportProductionExcel({
                filters,
                user: req.user
            });

            if (!result.recordCount) {
                return res.status(404).json({
                    success: false,
                    message: 'No records found for the selected filters.'
                });
            }

            ExportLog.log({
                userId: req.user?.id,
                exportType: 'production',
                fileFormat: 'xlsx',
                filters,
                recordCount: result.recordCount,
                ipAddress: req.ip
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.status(200).send(result.buffer);
        } catch (err) {
            next(err);
        }
    },

    exportYarnsExcel: async (req, res, next) => {
        try {
            const result = await excelExportService.exportYarnsExcel({
                filters: req.body || {},
                user: req.user
            });

            if (!result.recordCount) {
                return res.status(404).json({
                    success: false,
                    message: 'No yarn records found to export.'
                });
            }

            ExportLog.log({
                userId: req.user?.id,
                exportType: 'yarns',
                fileFormat: 'xlsx',
                filters: req.body || {},
                recordCount: result.recordCount,
                ipAddress: req.ip
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.status(200).send(result.buffer);
        } catch (err) {
            next(err);
        }
    },

    exportFabricsExcel: async (req, res, next) => {
        try {
            const result = await excelExportService.exportFabricsExcel({
                filters: req.body || {},
                user: req.user
            });

            if (!result.recordCount) {
                return res.status(404).json({
                    success: false,
                    message: 'No fabric records found to export.'
                });
            }

            ExportLog.log({
                userId: req.user?.id,
                exportType: 'fabrics',
                fileFormat: 'xlsx',
                filters: req.body || {},
                recordCount: result.recordCount,
                ipAddress: req.ip
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.status(200).send(result.buffer);
        } catch (err) {
            next(err);
        }
    },

    exportChargesExcel: async (req, res, next) => {
        try {
            const result = await excelExportService.exportChargesExcel({
                filters: req.body || {},
                user: req.user
            });

            if (!result.recordCount) {
                return res.status(404).json({
                    success: false,
                    message: 'No process charge records found to export.'
                });
            }

            ExportLog.log({
                userId: req.user?.id,
                exportType: 'charges',
                fileFormat: 'xlsx',
                filters: req.body || {},
                recordCount: result.recordCount,
                ipAddress: req.ip
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.status(200).send(result.buffer);
        } catch (err) {
            next(err);
        }
    },

    exportUsersExcel: async (req, res, next) => {
        try {
            const result = await excelExportService.exportUsersExcel({
                filters: req.body || {},
                user: req.user
            });

            if (!result.recordCount) {
                return res.status(404).json({
                    success: false,
                    message: 'No user accounts found to export.'
                });
            }

            ExportLog.log({
                userId: req.user?.id,
                exportType: 'users',
                fileFormat: 'xlsx',
                filters: req.body || {},
                recordCount: result.recordCount,
                ipAddress: req.ip
            });

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
            res.status(200).send(result.buffer);
        } catch (err) {
            next(err);
        }
    },

    getCounts: (req, res, next) => {
        try {
            const { type = 'costings', search, startDate, endDate, planType } = req.query;
            let count = 0;

            if (type === 'costings') {
                const list = Costing.getAll({ search, startDate, endDate });
                count = list.length;
            } else if (type === 'production') {
                const list = ProductionPlan.getAll({ search, startDate, endDate, planType });
                count = list.length;
            } else if (type === 'yarns') {
                const list = Yarn.getAll();
                count = list.length;
            } else if (type === 'fabrics') {
                const list = Fabric.getAll();
                count = list.length;
            } else if (type === 'charges') {
                const list = Charge.getAll();
                count = list.length;
            } else if (type === 'users') {
                const list = User.getAll();
                count = list.length;
            }

            res.json({ success: true, type, count });
        } catch (err) {
            next(err);
        }
    },

    getLogs: (req, res, next) => {
        try {
            const limit = parseInt(req.query.limit, 10) || 50;
            const logs = ExportLog.getRecent(limit);
            res.json({ success: true, count: logs.length, data: logs });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = exportController;
