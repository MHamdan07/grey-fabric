const { planYarnToFabric, planFabricToYarn, calculateCosting } = require('../services/calculation/calculationEngine');
const ProductionPlan = require('../models/ProductionPlan');
const ActivityLog = require('../models/ActivityLog');

const productionController = {
    // Mode 1: Yarn -> Fabric (Rs. 10 Lakh Calculator)
    calculateYarnToFabric: (req, res) => {
        try {
            const input = req.body;
            let adjustedWarpKgM = parseFloat(input.adjusted_warp_kg_m);
            let adjustedWeftKgM = parseFloat(input.adjusted_weft_kg_m);

            // If construction parameters are passed instead of direct consumption, calculate them
            if (!adjustedWarpKgM || !adjustedWeftKgM) {
                const costing = calculateCosting(input);
                adjustedWarpKgM = costing.audit_breakdown.warp.adjustedConsumptionKgM;
                adjustedWeftKgM = costing.audit_breakdown.weft.adjustedConsumptionKgM;
            }

            const plan = planYarnToFabric({
                budgetPKR: input.budget_pkr,
                availableYarnKg: input.available_yarn_kg,
                availableWarpKg: input.available_warp_kg,
                availableWeftKg: input.available_weft_kg,
                adjustedWarpKgM,
                adjustedWeftKgM,
                warpRate: input.warp_rate,
                weftRate: input.weft_rate,
                processLosses: {
                    sizingLossPct: input.sizing_loss_pct || 0,
                    weavingLossPct: input.weaving_loss_pct || 1.5,
                    rejectPct: input.reject_pct || 2.0
                }
            });

            return res.json({
                success: true,
                data: plan
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Mode 2: Fabric -> Yarn (Reverse Calculator)
    calculateFabricToYarn: (req, res) => {
        try {
            const input = req.body;
            let adjustedWarpKgM = parseFloat(input.adjusted_warp_kg_m);
            let adjustedWeftKgM = parseFloat(input.adjusted_weft_kg_m);

            if (!adjustedWarpKgM || !adjustedWeftKgM) {
                const costing = calculateCosting(input);
                adjustedWarpKgM = costing.audit_breakdown.warp.adjustedConsumptionKgM;
                adjustedWeftKgM = costing.audit_breakdown.weft.adjustedConsumptionKgM;
            }

            const plan = planFabricToYarn({
                targetFabricMeters: input.target_fabric_meters,
                adjustedWarpKgM,
                adjustedWeftKgM,
                warpRate: input.warp_rate,
                weftRate: input.weft_rate,
                processLosses: {
                    sizingLossPct: input.sizing_loss_pct || 0,
                    weavingLossPct: input.weaving_loss_pct || 1.5,
                    rejectPct: input.reject_pct || 2.0
                }
            });

            return res.json({
                success: true,
                data: plan
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    // Save plan to ledger
    createPlan: (req, res) => {
        try {
            const planData = req.body;
            const planId = `PLN-${Date.now().toString().slice(-6)}`;

            const record = ProductionPlan.create({
                ...planData,
                plan_id: planId,
                created_by: req.user ? req.user.id : null
            });

            if (req.user) {
                ActivityLog.log(
                    req.user.id,
                    req.user.name,
                    'CREATE',
                    'ProductionPlan',
                    planId,
                    `Created production plan for ${record.article_name}`
                );
            }

            return res.status(201).json({
                success: true,
                message: 'Production plan saved successfully',
                data: record
            });
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    },

    getPlans: (req, res) => {
        try {
            const plans = ProductionPlan.getAll(req.query);
            return res.json({
                success: true,
                data: plans
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    getPlanById: (req, res) => {
        try {
            const plan = ProductionPlan.findById(req.params.id);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Production plan not found'
                });
            }
            return res.json({
                success: true,
                data: plan
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    deletePlan: (req, res) => {
        try {
            const plan = ProductionPlan.findById(req.params.id);
            if (!plan) {
                return res.status(404).json({
                    success: false,
                    message: 'Production plan not found'
                });
            }

            ProductionPlan.delete(req.params.id);

            if (req.user) {
                ActivityLog.log(
                    req.user.id,
                    req.user.name,
                    'DELETE',
                    'ProductionPlan',
                    plan.plan_id,
                    `Deleted production plan ${plan.plan_id}`
                );
            }

            return res.json({
                success: true,
                message: 'Production plan deleted successfully'
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    },

    getSummary: (req, res) => {
        try {
            const stats = ProductionPlan.getSummaryStats();
            return res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }
};

module.exports = productionController;
