/**
 * Textile Production Planning & Yarn-to-Fabric Conversion Engine
 * 
 * Answers the critical factory questions:
 * 1. "Hum ne Rs. 10 lakh ka dhaga khareeda hai. Is se kitna kapra banega?" (Yarn -> Fabric)
 * 2. "Humein 20,000 meters fabric banana hai. Kitna dhaga chahiye?" (Fabric -> Yarn)
 * 
 * Avoids the single-number fallacy by explicitly distinguishing:
 * - Theoretical Output (Pure mathematical division)
 * - Expected Output (Accounting for warp/weft balance constraint & factory process losses)
 * - Remaining Yarn Buffer (Unused warp or weft due to imbalance)
 */

const { calculateProcessAllowances } = require('./wastageCalculation');

/**
 * Mode 1: Yarn -> Fabric Production Planning
 * @param {object} params
 * @param {number} [params.budgetPKR] - Total yarn budget in PKR (e.g. 1,000,000)
 * @param {number} [params.availableYarnKg] - Available total yarn in KG
 * @param {number} [params.availableWarpKg] - Specifically available warp yarn KG
 * @param {number} [params.availableWeftKg] - Specifically available weft yarn KG
 * @param {number} params.adjustedWarpKgM - Adjusted warp consumption per meter (kg/m)
 * @param {number} params.adjustedWeftKgM - Adjusted weft consumption per meter (kg/m)
 * @param {number} params.warpRate - Warp yarn rate (PKR/kg)
 * @param {number} params.weftRate - Weft yarn rate (PKR/kg)
 * @param {object} [params.processLosses] - Sizing, weaving, inspection allowances
 * @returns {object}
 */
function planYarnToFabric({
    budgetPKR,
    availableYarnKg,
    availableWarpKg,
    availableWeftKg,
    adjustedWarpKgM,
    adjustedWeftKgM,
    warpRate = 0,
    weftRate = 0,
    processLosses = {}
}) {
    const pAdjWarp = parseFloat(adjustedWarpKgM);
    const pAdjWeft = parseFloat(adjustedWeftKgM);
    const pWarpRate = Math.max(0, parseFloat(warpRate) || 0);
    const pWeftRate = Math.max(0, parseFloat(weftRate) || 0);

    if (!pAdjWarp || pAdjWarp <= 0 || !pAdjWeft || pAdjWeft <= 0) {
        throw new Error('Valid adjusted warp and weft consumption values (kg/m) are required.');
    }

    const totalYarnKgM = pAdjWarp + pAdjWeft;
    const warpShare = pAdjWarp / totalYarnKgM;
    const weftShare = pAdjWeft / totalYarnKgM;

    let warpKg = parseFloat(availableWarpKg) || 0;
    let weftKg = parseFloat(availableWeftKg) || 0;
    let totalInputBudget = parseFloat(budgetPKR) || 0;

    // Case 1: Budget in PKR provided without explicit KG
    if (totalInputBudget > 0 && warpKg === 0 && weftKg === 0 && (!availableYarnKg || availableYarnKg <= 0)) {
        // Weighted composite yarn rate based on fabric construction share
        const compositeYarnRate = (warpShare * pWarpRate) + (weftShare * pWeftRate);
        const totalPurchasableKg = compositeYarnRate > 0 ? (totalInputBudget / compositeYarnRate) : 0;

        warpKg = totalPurchasableKg * warpShare;
        weftKg = totalPurchasableKg * weftShare;
    } 
    // Case 2: Total yarn KG provided without separate warp/weft
    else if ((parseFloat(availableYarnKg) || 0) > 0 && warpKg === 0 && weftKg === 0) {
        const totalKg = parseFloat(availableYarnKg);
        warpKg = totalKg * warpShare;
        weftKg = totalKg * weftShare;
    }

    const totalAvailableYarnKg = warpKg + weftKg;

    // Independent warp & weft production capacity
    const warpSupportedMeters = pAdjWarp > 0 ? (warpKg / pAdjWarp) : 0;
    const weftSupportedMeters = pAdjWeft > 0 ? (weftKg / pAdjWeft) : 0;

    // Crucial Textile Rule: Fabric production is strictly constrained by the smaller yarn quantity!
    const theoreticalFabricMeters = Math.min(warpSupportedMeters, weftSupportedMeters);
    const limitingYarnType = warpSupportedMeters < weftSupportedMeters ? 'warp' : 
                             weftSupportedMeters < warpSupportedMeters ? 'weft' : 'balanced';

    // Calculate actual yarn consumed for planned meters and remaining unused yarn
    const consumedWarpKg = theoreticalFabricMeters * pAdjWarp;
    const consumedWeftKg = theoreticalFabricMeters * pAdjWeft;
    const totalConsumedYarnKg = consumedWarpKg + consumedWeftKg;

    const remainingWarpKg = Math.max(0, warpKg - consumedWarpKg);
    const remainingWeftKg = Math.max(0, weftKg - consumedWeftKg);
    const totalRemainingYarnKg = remainingWarpKg + remainingWeftKg;

    // Process allowances (Sizing loss, loom stops, inspection reject)
    const allowances = calculateProcessAllowances(theoreticalFabricMeters, processLosses);

    // Yarn utilization efficiency
    const yarnUtilizationPct = totalAvailableYarnKg > 0 ? (totalConsumedYarnKg / totalAvailableYarnKg) * 100 : 100;

    return {
        input: {
            budgetPKR: totalInputBudget,
            availableWarpKg: Number(warpKg.toFixed(2)),
            availableWeftKg: Number(weftKg.toFixed(2)),
            totalAvailableYarnKg: Number(totalAvailableYarnKg.toFixed(2)),
            adjustedWarpKgM: pAdjWarp,
            adjustedWeftKgM: pAdjWeft,
            totalYarnKgM: Number(totalYarnKgM.toFixed(5)),
            warpRate: pWarpRate,
            weftRate: pWeftRate
        },
        supported_capacity: {
            warpSupportedMeters: Number(warpSupportedMeters.toFixed(1)),
            weftSupportedMeters: Number(weftSupportedMeters.toFixed(1)),
            limitingYarnType,
            theoreticalFabricMeters: Number(theoreticalFabricMeters.toFixed(1))
        },
        production_output: {
            theoreticalFabricMeters: Number(theoreticalFabricMeters.toFixed(1)),
            expectedUsableMeters: allowances.expectedUsableMeters,
            lossMeters: allowances.lossMeters,
            productionEfficiencyPct: allowances.efficiencyPct
        },
        yarn_balance: {
            consumedWarpKg: Number(consumedWarpKg.toFixed(2)),
            consumedWeftKg: Number(consumedWeftKg.toFixed(2)),
            totalConsumedYarnKg: Number(totalConsumedYarnKg.toFixed(2)),
            remainingWarpKg: Number(remainingWarpKg.toFixed(2)),
            remainingWeftKg: Number(remainingWeftKg.toFixed(2)),
            totalRemainingYarnKg: Number(totalRemainingYarnKg.toFixed(2)),
            yarnUtilizationPct: Number(yarnUtilizationPct.toFixed(1))
        },
        process_allowances: allowances
    };
}

/**
 * Mode 2: Fabric -> Yarn Requirement Planner (Reverse Calculator)
 * @param {object} params
 * @param {number} params.targetFabricMeters - Desired fabric production in meters (e.g. 20,000)
 * @param {number} params.adjustedWarpKgM - Adjusted warp consumption (kg/m)
 * @param {number} params.adjustedWeftKgM - Adjusted weft consumption (kg/m)
 * @param {number} [params.warpRate=0] - Warp yarn rate (PKR/kg)
 * @param {number} [params.weftRate=0] - Weft yarn rate (PKR/kg)
 * @param {object} [params.processLosses] - Allowance buffers
 * @returns {object}
 */
function planFabricToYarn({
    targetFabricMeters,
    adjustedWarpKgM,
    adjustedWeftKgM,
    warpRate = 0,
    weftRate = 0,
    processLosses = {}
}) {
    const targetMeters = parseFloat(targetFabricMeters);
    const pAdjWarp = parseFloat(adjustedWarpKgM);
    const pAdjWeft = parseFloat(adjustedWeftKgM);
    const pWarpRate = Math.max(0, parseFloat(warpRate) || 0);
    const pWeftRate = Math.max(0, parseFloat(weftRate) || 0);

    if (!targetMeters || targetMeters <= 0) {
        throw new Error(`Invalid target fabric meters: ${targetFabricMeters}`);
    }
    if (!pAdjWarp || pAdjWarp <= 0 || !pAdjWeft || pAdjWeft <= 0) {
        throw new Error('Valid adjusted warp and weft consumption (kg/m) are required.');
    }

    // Process loss allowance buffer
    const allowances = calculateProcessAllowances(targetMeters, processLosses);
    const lossFactor = allowances.efficiencyPct > 0 ? (100 / allowances.efficiencyPct) : 1;
    const grossMetersToWeave = targetMeters * lossFactor;

    // Net Yarn Required for Target Usable Fabric
    const netWarpKg = targetMeters * pAdjWarp;
    const netWeftKg = targetMeters * pAdjWeft;
    const totalNetYarnKg = netWarpKg + netWeftKg;

    // Recommended Purchase/Issue Quantity (incorporating process loss buffer)
    const recommendedWarpKg = grossMetersToWeave * pAdjWarp;
    const recommendedWeftKg = grossMetersToWeave * pAdjWeft;
    const totalRecommendedYarnKg = recommendedWarpKg + recommendedWeftKg;

    // Procurement Cost Projections
    const estimatedWarpCost = recommendedWarpKg * pWarpRate;
    const estimatedWeftCost = recommendedWeftKg * pWeftRate;
    const totalEstimatedYarnCost = estimatedWarpCost + estimatedWeftCost;

    return {
        targetFabricMeters: targetMeters,
        grossMetersToWeave: Number(grossMetersToWeave.toFixed(1)),
        net_yarn: {
            warpKg: Number(netWarpKg.toFixed(2)),
            weftKg: Number(netWeftKg.toFixed(2)),
            totalKg: Number(totalNetYarnKg.toFixed(2))
        },
        recommended_procurement: {
            warpKg: Number(recommendedWarpKg.toFixed(2)),
            weftKg: Number(recommendedWeftKg.toFixed(2)),
            totalKg: Number(totalRecommendedYarnKg.toFixed(2)),
            bufferKg: Number((totalRecommendedYarnKg - totalNetYarnKg).toFixed(2))
        },
        estimated_costs: {
            warpCost: Number(estimatedWarpCost.toFixed(2)),
            weftCost: Number(estimatedWeftCost.toFixed(2)),
            totalYarnCost: Number(totalEstimatedYarnCost.toFixed(2)),
            currency: 'PKR'
        },
        process_allowances: allowances
    };
}

module.exports = {
    planYarnToFabric,
    planFabricToYarn
};
