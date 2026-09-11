/**
 * Textile Engineering Grey Fabric Calculation Engine (Orchestrator)
 * Version: Standard Cotton v1.0
 * 
 * Provides unified interfaces for:
 * 1. calculateCosting(input): Comprehensive grey fabric costing & physical metrics
 * 2. planYarnToFabric(input): Mode 1 (Rs. 10 Lakh yarn budget to fabric meters)
 * 3. planFabricToYarn(input): Mode 2 (Target fabric meters to required yarn & cost)
 */

const { normalizeToNe, CONSTANTS } = require('./yarnConversion');
const { calculateTheoreticalWarpConsumption } = require('./warpConsumption');
const { calculateTheoreticalWeftConsumption } = require('./weftConsumption');
const { calculateAdjustedYarnConsumption, calculateProcessAllowances } = require('./wastageCalculation');
const { calculateSizingCost } = require('./sizingCalculation');
const { calculateWeavingCost } = require('./weavingCalculation');
const { calculateGreyFabricCostMetrics } = require('./greyCostCalculation');
const { planYarnToFabric, planFabricToYarn } = require('./productionPlanning');

const FORMULA_METADATA = {
    formulaVersion: 'Standard Cotton v1.0',
    calculationMethod: 'English Cotton Count Ne (K=1693.35)',
    description: 'Deterministic textile engineering model with distinct crimp, wastage, and process tariff types.'
};

/**
 * Executes complete grey fabric costing calculation
 * @param {object} input
 * @returns {object} Full auditable calculation response
 */
function calculateCosting(input) {
    const width = parseFloat(input.width);
    const epi = parseInt(input.epi, 10);
    const ppi = parseInt(input.ppi, 10);

    if (!width || width <= 0) throw new Error('Fabric width must be greater than 0.');
    if (!epi || epi <= 0) throw new Error('EPI must be greater than 0.');
    if (!ppi || ppi <= 0) throw new Error('PPI must be greater than 0.');

    // 1. Warp Theoretical Consumption
    const warpCount = parseFloat(input.warp_count) || 1;
    const warpCountSystem = input.warp_count_system || 'Ne';
    const warpWastage = parseFloat(input.warp_wastage) || 0;
    const warpCrimp = parseFloat(input.warp_crimp) || 0;
    const warpRate = parseFloat(input.warp_rate) || 0;

    const warpTheo = calculateTheoreticalWarpConsumption({
        epi,
        width,
        count: warpCount,
        countSystem: warpCountSystem
    });

    // 2. Weft Theoretical Consumption
    const weftCount = parseFloat(input.weft_count) || 1;
    const weftCountSystem = input.weft_count_system || 'Ne';
    const weftWastage = parseFloat(input.weft_wastage) || 0;
    const weftCrimp = parseFloat(input.weft_crimp) || 0;
    const weftRate = parseFloat(input.weft_rate) || 0;

    const weftTheo = calculateTheoreticalWeftConsumption({
        ppi,
        width,
        count: weftCount,
        countSystem: weftCountSystem
    });

    // 3. Adjusted Consumption (Separated Crimp & Wastage)
    const adjusted = calculateAdjustedYarnConsumption({
        theoreticalWarpKgM: warpTheo.theoreticalWarpKgM,
        warpCrimp,
        warpWastage,
        theoreticalWeftKgM: weftTheo.theoreticalWeftKgM,
        weftCrimp,
        weftWastage
    });

    // 4. Sizing Cost Calculation
    const sizingRate = parseFloat(input.sizing_charges) || 0;
    const sizingChargeType = input.sizing_charge_type || 'per_meter';
    const sizing = calculateSizingCost({
        adjustedWarpKgM: adjusted.warp.adjustedKgM,
        rate: sizingRate,
        chargeType: sizingChargeType
    });

    // 5. Weaving Cost Calculation
    const weavingRate = parseFloat(input.weaving_charges) || 0;
    const weavingChargeType = input.weaving_charge_type || 'per_meter';
    const weaving = calculateWeavingCost({
        totalYarnKgM: adjusted.totalYarnKgM,
        rate: weavingRate,
        chargeType: weavingChargeType
    });

    // 6. Other charges & Grey Fabric Cost Metrics
    const otherCharges = parseFloat(input.other_charges) || 0;
    const metrics = calculateGreyFabricCostMetrics({
        adjustedWarpKgM: adjusted.warp.adjustedKgM,
        warpRate,
        adjustedWeftKgM: adjusted.weft.adjustedKgM,
        weftRate,
        sizingCostM: sizing.sizingCostM,
        weavingCostM: weaving.weavingCostM,
        otherCharges,
        widthInches: width,
        totalEnds: warpTheo.totalEnds
    });

    return {
        formula_metadata: FORMULA_METADATA,
        inputs: {
            width,
            epi,
            ppi,
            warp_count: warpTheo.warpCount,
            warp_count_system: warpTheo.warpCountSystem,
            warp_rate: warpRate,
            warp_crimp: warpCrimp,
            warp_wastage: warpWastage,
            weft_count: weftTheo.weftCount,
            weft_count_system: weftTheo.weftCountSystem,
            weft_rate: weftRate,
            weft_crimp: weftCrimp,
            weft_wastage: weftWastage,
            sizing_charges: sizingRate,
            sizing_charge_type: sizing.sizingChargeType,
            weaving_charges: weavingRate,
            weaving_charge_type: weaving.weavingChargeType,
            other_charges: otherCharges
        },
        audit_breakdown: {
            warp: {
                count: warpTheo.warpCount,
                countSystem: warpTheo.warpCountSystem,
                equivalentNe: warpTheo.equivalentNe,
                rate: warpRate,
                rateUnit: 'PKR/kg',
                theoreticalConsumptionKgM: warpTheo.theoreticalWarpKgM,
                crimpPct: adjusted.warp.crimpPct,
                crimpWeightKgM: adjusted.warp.crimpWeightKgM,
                wastagePct: adjusted.warp.wastagePct,
                wastageWeightKgM: adjusted.warp.wastageWeightKgM,
                adjustedConsumptionKgM: adjusted.warp.adjustedKgM,
                costPerMeter: metrics.costs.warpCostM
            },
            weft: {
                count: weftTheo.weftCount,
                countSystem: weftTheo.weftCountSystem,
                equivalentNe: weftTheo.equivalentNe,
                rate: weftRate,
                rateUnit: 'PKR/kg',
                theoreticalConsumptionKgM: weftTheo.theoreticalWeftKgM,
                crimpPct: adjusted.weft.crimpPct,
                crimpWeightKgM: adjusted.weft.crimpWeightKgM,
                wastagePct: adjusted.weft.wastagePct,
                wastageWeightKgM: adjusted.weft.wastageWeightKgM,
                adjustedConsumptionKgM: adjusted.weft.adjustedKgM,
                costPerMeter: metrics.costs.weftCostM
            },
            process: {
                sizingCostPerMeter: sizing.sizingCostM,
                sizingChargeType: sizing.sizingChargeType,
                weavingCostPerMeter: weaving.weavingCostM,
                weavingChargeType: weaving.weavingChargeType,
                otherCostPerMeter: metrics.costs.otherCostM,
                totalProcessCostPerMeter: metrics.costs.totalProcessChargesM
            },
            summary: {
                totalYarnConsumptionKgM: adjusted.totalYarnKgM,
                warpCostPerMeter: metrics.costs.warpCostM,
                weftCostPerMeter: metrics.costs.weftCostM,
                sizingCostPerMeter: sizing.sizingCostM,
                weavingCostPerMeter: weaving.weavingCostM,
                otherCostPerMeter: metrics.costs.otherCostM,
                greyCostPerMeter: metrics.costs.greyCostPerMeter,
                currency: 'PKR'
            }
        },
        weights: {
            total_ends: warpTheo.totalEnds,
            theoretical_warp_kg: warpTheo.theoreticalWarpKgM,
            warp_weight_kg: adjusted.warp.adjustedKgM,
            theoretical_weft_kg: weftTheo.theoreticalWeftKgM,
            weft_weight_kg: adjusted.weft.adjustedKgM,
            total_weight_kg: adjusted.totalYarnKgM,
            glm: metrics.weights.glm,
            gsm: metrics.weights.gsm,
            oz_per_sq_yd: metrics.weights.ozPerSqYd
        },
        costs: {
            warp_cost: metrics.costs.warpCostM,
            weft_cost: metrics.costs.weftCostM,
            total_yarn_cost: metrics.costs.totalYarnCostM,
            sizing_charges: sizing.sizingCostM,
            weaving_charges: weaving.weavingCostM,
            other_charges: metrics.costs.otherCostM,
            total_process_charges: metrics.costs.totalProcessChargesM,
            grey_cost_per_meter: metrics.costs.greyCostPerMeter
        },
        percentages: metrics.percentages
    };
}

module.exports = {
    calculateCosting,
    planYarnToFabric,
    planFabricToYarn,
    normalizeToNe,
    calculateTheoreticalWarpConsumption,
    calculateTheoreticalWeftConsumption,
    calculateAdjustedYarnConsumption,
    calculateSizingCost,
    calculateWeavingCost,
    calculateGreyFabricCostMetrics,
    CONSTANTS,
    FORMULA_METADATA
};
