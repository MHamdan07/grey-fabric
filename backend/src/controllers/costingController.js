const Costing = require('../models/Costing');
const ActivityLog = require('../models/ActivityLog');
const { calculateGreyFabricCost } = require('../services/calculationService');

function generateCostingId() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `CST-${dateStr}-${rand}`;
}

const costingController = {
    // Pure calculation without persisting
    calculate: (req, res, next) => {
        try {
            const calculation = calculateGreyFabricCost(req.body);
            res.json({
                success: true,
                data: calculation
            });
        } catch (err) {
            next(err);
        }
    },

    // Create and persist new costing
    create: (req, res, next) => {
        try {
            const input = req.body;
            const calculation = calculateGreyFabricCost(input);

            const costingId = input.costing_id || generateCostingId();

            const saved = Costing.create({
                costing_id: costingId,
                fabric_id: input.fabric_id || null,
                article_name: input.article_name || 'Unnamed Grey Article',
                fabric_code: input.fabric_code || costingId,
                width: input.width,
                epi: input.epi,
                ppi: input.ppi,
                warp_count: input.warp_count,
                warp_count_system: input.warp_count_system || 'Ne',
                warp_rate: input.warp_rate,
                warp_crimp: input.warp_crimp || 5.0,
                warp_wastage: input.warp_wastage !== undefined ? input.warp_wastage : 2.0,
                weft_count: input.weft_count,
                weft_count_system: input.weft_count_system || 'Ne',
                weft_rate: input.weft_rate,
                weft_crimp: input.weft_crimp || 5.0,
                weft_wastage: input.weft_wastage !== undefined ? input.weft_wastage : 2.0,
                sizing_charges: input.sizing_charges || 0,
                sizing_charge_type: input.sizing_charge_type || 'per_meter',
                weaving_charges: input.weaving_charges || 0,
                weaving_charge_type: input.weaving_charge_type || 'per_meter',
                other_charges: input.other_charges || 0,
                
                warp_weight_kg: calculation.weights.warp_weight_kg,
                weft_weight_kg: calculation.weights.weft_weight_kg,
                total_weight_kg: calculation.weights.total_weight_kg,
                gsm: calculation.weights.gsm,
                glm: calculation.weights.glm,
                
                warp_cost: calculation.costs.warp_cost,
                weft_cost: calculation.costs.weft_cost,
                warp_wastage_cost: calculation.audit_breakdown.warp.wastageWeightKgM * (parseFloat(input.warp_rate) || 0),
                weft_wastage_cost: calculation.audit_breakdown.weft.wastageWeightKgM * (parseFloat(input.weft_rate) || 0),
                total_wastage_cost: (calculation.audit_breakdown.warp.wastageWeightKgM * (parseFloat(input.warp_rate) || 0)) + 
                                   (calculation.audit_breakdown.weft.wastageWeightKgM * (parseFloat(input.weft_rate) || 0)),
                grey_cost_per_meter: calculation.costs.grey_cost_per_meter,
                formula_version: calculation.formula_metadata?.formulaVersion || 'Standard Cotton v1.0',
                assumptions_used: calculation.inputs,
                
                notes: input.notes || '',
                created_by: req.user?.id || null
            });

            ActivityLog.log({
                userId: req.user?.id,
                userName: req.user?.name || 'System',
                action: 'CREATE_COSTING',
                module: 'costings',
                recordId: saved.costing_id,
                details: `Created costing for ${saved.article_name} (${saved.grey_cost_per_meter}/mtr)`,
                ipAddress: req.ip
            });

            res.status(201).json({
                success: true,
                message: 'Costing successfully calculated and saved.',
                data: saved,
                calculation
            });
        } catch (err) {
            next(err);
        }
    },

    getAll: (req, res, next) => {
        try {
            const filters = {
                search: req.query.search,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                createdBy: req.query.createdBy,
                limit: req.query.limit
            };
            const list = Costing.getAll(filters);
            res.json({
                success: true,
                count: list.length,
                data: list
            });
        } catch (err) {
            next(err);
        }
    },

    getById: (req, res, next) => {
        try {
            const item = Costing.findById(req.params.id);
            if (!item) {
                return res.status(404).json({ success: false, message: 'Costing record not found.' });
            }

            // Fresh auditable calculation breakdown
            const calculation = calculateGreyFabricCost({
                width: item.width,
                epi: item.epi,
                ppi: item.ppi,
                warp_count: item.warp_count,
                warp_count_system: item.warp_count_system || 'Ne',
                warp_rate: item.warp_rate,
                warp_crimp: item.warp_crimp !== undefined ? item.warp_crimp : 5.0,
                warp_wastage: item.warp_wastage,
                weft_count: item.weft_count,
                weft_count_system: item.weft_count_system || 'Ne',
                weft_rate: item.weft_rate,
                weft_crimp: item.weft_crimp !== undefined ? item.weft_crimp : 5.0,
                weft_wastage: item.weft_wastage,
                sizing_charges: item.sizing_charges,
                sizing_charge_type: item.sizing_charge_type || 'per_meter',
                weaving_charges: item.weaving_charges,
                weaving_charge_type: item.weaving_charge_type || 'per_meter',
                other_charges: item.other_charges
            });

            res.json({
                success: true,
                data: item,
                calculation
            });
        } catch (err) {
            next(err);
        }
    },

    update: (req, res, next) => {
        try {
            const existing = Costing.findById(req.params.id);
            if (!existing) {
                return res.status(404).json({ success: false, message: 'Costing record not found.' });
            }

            const input = { ...existing, ...req.body };
            const calculation = calculateGreyFabricCost(input);

            const updated = Costing.update(existing.id, {
                article_name: input.article_name,
                fabric_code: input.fabric_code,
                width: input.width,
                epi: input.epi,
                ppi: input.ppi,
                warp_count: input.warp_count,
                warp_count_system: input.warp_count_system || 'Ne',
                warp_rate: input.warp_rate,
                warp_crimp: input.warp_crimp !== undefined ? input.warp_crimp : 5.0,
                warp_wastage: input.warp_wastage,
                weft_count: input.weft_count,
                weft_count_system: input.weft_count_system || 'Ne',
                weft_rate: input.weft_rate,
                weft_crimp: input.weft_crimp !== undefined ? input.weft_crimp : 5.0,
                weft_wastage: input.weft_wastage,
                sizing_charges: input.sizing_charges,
                sizing_charge_type: input.sizing_charge_type || 'per_meter',
                weaving_charges: input.weaving_charges,
                weaving_charge_type: input.weaving_charge_type || 'per_meter',
                other_charges: input.other_charges,
                warp_weight_kg: calculation.weights.warp_weight_kg,
                weft_weight_kg: calculation.weights.weft_weight_kg,
                total_weight_kg: calculation.weights.total_weight_kg,
                gsm: calculation.weights.gsm,
                glm: calculation.weights.glm,
                warp_cost: calculation.costs.warp_cost,
                weft_cost: calculation.costs.weft_cost,
                warp_wastage_cost: calculation.audit_breakdown.warp.wastageWeightKgM * (parseFloat(input.warp_rate) || 0),
                weft_wastage_cost: calculation.audit_breakdown.weft.wastageWeightKgM * (parseFloat(input.weft_rate) || 0),
                total_wastage_cost: (calculation.audit_breakdown.warp.wastageWeightKgM * (parseFloat(input.warp_rate) || 0)) + 
                                   (calculation.audit_breakdown.weft.wastageWeightKgM * (parseFloat(input.weft_rate) || 0)),
                grey_cost_per_meter: calculation.costs.grey_cost_per_meter,
                formula_version: calculation.formula_metadata?.formulaVersion || 'Standard Cotton v1.0',
                assumptions_used: calculation.inputs,
                notes: input.notes
            });

            ActivityLog.log({
                userId: req.user?.id,
                userName: req.user?.name || 'System',
                action: 'UPDATE_COSTING',
                module: 'costings',
                recordId: updated.costing_id,
                details: `Updated costing for ${updated.article_name}`,
                ipAddress: req.ip
            });

            res.json({
                success: true,
                message: 'Costing successfully updated.',
                data: updated,
                calculation
            });
        } catch (err) {
            next(err);
        }
    },

    delete: (req, res, next) => {
        try {
            const item = Costing.findById(req.params.id);
            if (!item) {
                return res.status(404).json({ success: false, message: 'Costing record not found.' });
            }

            Costing.delete(item.id);

            ActivityLog.log({
                userId: req.user?.id,
                userName: req.user?.name || 'System',
                action: 'DELETE_COSTING',
                module: 'costings',
                recordId: item.costing_id,
                details: `Deleted costing for ${item.article_name}`,
                ipAddress: req.ip
            });

            res.json({
                success: true,
                message: 'Costing record successfully deleted.'
            });
        } catch (err) {
            next(err);
        }
    },

    duplicate: (req, res, next) => {
        try {
            const item = Costing.findById(req.params.id);
            if (!item) {
                return res.status(404).json({ success: false, message: 'Source costing not found.' });
            }

            const newCostingId = generateCostingId();
            const duplicated = Costing.create({
                ...item,
                costing_id: newCostingId,
                article_name: `${item.article_name} (Copy)`,
                fabric_code: `${item.fabric_code}-COPY`,
                notes: `Duplicated from ${item.costing_id}`,
                created_by: req.user?.id || null
            });

            ActivityLog.log({
                userId: req.user?.id,
                userName: req.user?.name || 'System',
                action: 'DUPLICATE_COSTING',
                module: 'costings',
                recordId: duplicated.costing_id,
                details: `Duplicated costing from ${item.costing_id}`,
                ipAddress: req.ip
            });

            res.status(201).json({
                success: true,
                message: 'Costing duplicated successfully.',
                data: duplicated
            });
        } catch (err) {
            next(err);
        }
    },

    getKpis: (req, res, next) => {
        try {
            const kpis = Costing.getKpis();
            res.json({
                success: true,
                data: kpis
            });
        } catch (err) {
            next(err);
        }
    },

    getTrend: (req, res, next) => {
        try {
            const days = req.query.days ? parseInt(req.query.days, 10) : 30;
            const trend = Costing.getTrend(days);
            res.json({
                success: true,
                data: trend
            });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = costingController;
