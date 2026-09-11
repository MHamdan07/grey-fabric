/**
 * Grey Fabric Total Cost & Density Metrics Module
 */

/**
 * Calculates complete grey fabric cost per meter and physical metrics
 * @param {object} params
 * @param {number} params.adjustedWarpKgM
 * @param {number} params.warpRate - Warp yarn rate (PKR/kg)
 * @param {number} params.adjustedWeftKgM
 * @param {number} params.weftRate - Weft yarn rate (PKR/kg)
 * @param {number} params.sizingCostM - Sizing cost (PKR/m)
 * @param {number} params.weavingCostM - Weaving cost (PKR/m)
 * @param {number} [params.otherCharges=0] - Folding, inspection, overhead (PKR/m)
 * @param {number} params.widthInches - Fabric width in inches
 * @param {number} params.totalEnds - Total warp ends
 * @returns {object}
 */
function calculateGreyFabricCostMetrics({
    adjustedWarpKgM,
    warpRate,
    adjustedWeftKgM,
    weftRate,
    sizingCostM,
    weavingCostM,
    otherCharges = 0,
    widthInches,
    totalEnds
}) {
    const pWarpRate = Math.max(0, parseFloat(warpRate) || 0);
    const pWeftRate = Math.max(0, parseFloat(weftRate) || 0);
    const pOther = Math.max(0, parseFloat(otherCharges) || 0);

    // 1. Yarn Costs
    const warpCostM = adjustedWarpKgM * pWarpRate;
    const weftCostM = adjustedWeftKgM * pWeftRate;
    const totalYarnCostM = warpCostM + weftCostM;

    // 2. Process Costs
    const totalProcessChargesM = sizingCostM + weavingCostM + pOther;

    // 3. Final Grey Fabric Cost
    const greyCostPerMeter = totalYarnCostM + totalProcessChargesM;

    // 4. Physical Fabric Density Metrics
    const totalWeightKgM = adjustedWarpKgM + adjustedWeftKgM;
    const glm = totalWeightKgM * 1000; // Grams per Linear Meter
    const widthMeters = (parseFloat(widthInches) || 0) * 0.0254;
    const gsm = widthMeters > 0 ? (glm / widthMeters) : 0; // Grams per Square Meter
    const ozPerSqYd = gsm / 33.906; // Ounces per Square Yard

    // 5. Cost Breakdown Percentages
    const warpCostPct = greyCostPerMeter > 0 ? (warpCostM / greyCostPerMeter) * 100 : 0;
    const weftCostPct = greyCostPerMeter > 0 ? (weftCostM / greyCostPerMeter) * 100 : 0;
    const sizingCostPct = greyCostPerMeter > 0 ? (sizingCostM / greyCostPerMeter) * 100 : 0;
    const weavingCostPct = greyCostPerMeter > 0 ? (weavingCostM / greyCostPerMeter) * 100 : 0;
    const otherCostPct = greyCostPerMeter > 0 ? (pOther / greyCostPerMeter) * 100 : 0;
    const totalYarnPct = greyCostPerMeter > 0 ? (totalYarnCostM / greyCostPerMeter) * 100 : 0;
    const totalProcessPct = greyCostPerMeter > 0 ? (totalProcessChargesM / greyCostPerMeter) * 100 : 0;

    return {
        costs: {
            warpCostM: Number(warpCostM.toFixed(2)),
            weftCostM: Number(weftCostM.toFixed(2)),
            totalYarnCostM: Number(totalYarnCostM.toFixed(2)),
            sizingCostM: Number(sizingCostM.toFixed(2)),
            weavingCostM: Number(weavingCostM.toFixed(2)),
            otherCostM: Number(pOther.toFixed(2)),
            totalProcessChargesM: Number(totalProcessChargesM.toFixed(2)),
            greyCostPerMeter: Number(greyCostPerMeter.toFixed(2))
        },
        weights: {
            totalEnds: Math.round(totalEnds || 0),
            warpWeightKgM: Number(adjustedWarpKgM.toFixed(4)),
            weftWeightKgM: Number(adjustedWeftKgM.toFixed(4)),
            totalWeightKgM: Number(totalWeightKgM.toFixed(4)),
            glm: Number(glm.toFixed(2)),
            gsm: Number(gsm.toFixed(2)),
            ozPerSqYd: Number(ozPerSqYd.toFixed(2))
        },
        percentages: {
            warpShare: Number(warpCostPct.toFixed(1)),
            weftShare: Number(weftCostPct.toFixed(1)),
            sizingShare: Number(sizingCostPct.toFixed(1)),
            weavingShare: Number(weavingCostPct.toFixed(1)),
            otherShare: Number(otherCostPct.toFixed(1)),
            totalYarnShare: Number(totalYarnPct.toFixed(1)),
            totalProcessShare: Number(totalProcessPct.toFixed(1))
        }
    };
}

module.exports = {
    calculateGreyFabricCostMetrics
};
