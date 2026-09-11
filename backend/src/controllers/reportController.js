const Costing = require('../models/Costing');
const ActivityLog = require('../models/ActivityLog');

const reportController = {
    getCostingsReport: (req, res, next) => {
        try {
            const list = Costing.getAll({
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                search: req.query.search
            });

            // Summary metrics
            const totalCount = list.length;
            const avgCost = totalCount > 0 
                ? (list.reduce((acc, cur) => acc + cur.grey_cost_per_meter, 0) / totalCount).toFixed(2)
                : 0;
            const avgGsm = totalCount > 0
                ? (list.reduce((acc, cur) => acc + cur.gsm, 0) / totalCount).toFixed(2)
                : 0;

            res.json({
                success: true,
                summary: {
                    totalCostings: totalCount,
                    averageGreyCostPerMeter: Number(avgCost),
                    averageGsm: Number(avgGsm)
                },
                data: list
            });
        } catch (err) {
            next(err);
        }
    },

    exportCsv: (req, res, next) => {
        try {
            const list = Costing.getAll({});
            
            const headers = [
                'Costing ID', 'Article Name', 'Fabric Code', 'Width (in)', 'EPI', 'PPI',
                'Warp Count', 'Warp Rate', 'Weft Count', 'Weft Rate',
                'Warp Wt (kg)', 'Weft Wt (kg)', 'Total Wt (kg)', 'GSM', 'GLM',
                'Warp Cost', 'Weft Cost', 'Total Wastage Cost',
                'Sizing Charges', 'Weaving Charges', 'Other Charges',
                'Grey Cost / Meter', 'Created At'
            ];

            const rows = list.map(c => [
                c.costing_id,
                `"${(c.article_name || '').replace(/"/g, '""')}"`,
                c.fabric_code,
                c.width,
                c.epi,
                c.ppi,
                c.warp_count,
                c.warp_rate,
                c.weft_count,
                c.weft_rate,
                c.warp_weight_kg,
                c.weft_weight_kg,
                c.total_weight_kg,
                c.gsm,
                c.glm,
                c.warp_cost,
                c.weft_cost,
                c.total_wastage_cost,
                c.sizing_charges,
                c.weaving_charges,
                c.other_charges,
                c.grey_cost_per_meter,
                c.created_at
            ]);

            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=grey_fabric_costings_${Date.now()}.csv`);
            res.status(200).send(csvContent);
        } catch (err) {
            next(err);
        }
    },

    getActivityLogs: (req, res, next) => {
        try {
            const logs = ActivityLog.getRecent(100);
            res.json({ success: true, count: logs.length, data: logs });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = reportController;
