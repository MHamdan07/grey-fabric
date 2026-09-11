/**
 * Textile Crimp, Wastage, and Process Allowances Calculation Module
 * 
 * Crucial Textile Engineering Distinction:
 * 1. Crimp / Take-up %:
 *    Extra yarn length required because yarn undulates and interlaces around perpendicular threads.
 * 2. Wastage %:
 *    Physical yarn fiber lost as hard/soft waste during winding, warping, sizing, and loom tying.
 * 3. Process Allowances:
 *    Sizing gain/loss %, loom stop/defect loss %, and fabric inspection reject %.
 */

/**
 * Calculates adjusted warp & weft consumption per meter
 * @param {object} params
 * @param {number} params.theoreticalWarpKgM
 * @param {number} [params.warpCrimp=0] - Warp crimp / take-up percentage (e.g. 5 for 5%)
 * @param {number} [params.warpWastage=0] - Warp processing wastage percentage (e.g. 2 for 2%)
 * @param {number} params.theoreticalWeftKgM
 * @param {number} [params.weftCrimp=0] - Weft crimp / take-up percentage (e.g. 5 for 5%)
 * @param {number} [params.weftWastage=0] - Weft processing wastage percentage (e.g. 2 for 2%)
 * @returns {object}
 */
function calculateAdjustedYarnConsumption({
    theoreticalWarpKgM,
    warpCrimp = 0,
    warpWastage = 0,
    theoreticalWeftKgM,
    weftCrimp = 0,
    weftWastage = 0
}) {
    const pWarpCrimp = Math.max(0, parseFloat(warpCrimp) || 0);
    const pWarpWastage = Math.max(0, parseFloat(warpWastage) || 0);
    const pWeftCrimp = Math.max(0, parseFloat(weftCrimp) || 0);
    const pWeftWastage = Math.max(0, parseFloat(weftWastage) || 0);

    // Sequential step calculation for auditable tracking
    // Step 1: Add crimp
    const warpWithCrimpKgM = theoreticalWarpKgM * (1 + (pWarpCrimp / 100));
    // Step 2: Add wastage
    const adjustedWarpKgM = warpWithCrimpKgM * (1 + (pWarpWastage / 100));

    // Weft sequential steps
    const weftWithCrimpKgM = theoreticalWeftKgM * (1 + (pWeftCrimp / 100));
    const adjustedWeftKgM = weftWithCrimpKgM * (1 + (pWeftWastage / 100));

    // Total Yarn Consumption
    const totalYarnKgM = adjustedWarpKgM + adjustedWeftKgM;

    return {
        warp: {
            theoreticalKgM: theoreticalWarpKgM,
            crimpPct: pWarpCrimp,
            crimpWeightKgM: Number((warpWithCrimpKgM - theoreticalWarpKgM).toFixed(5)),
            wastagePct: pWarpWastage,
            wastageWeightKgM: Number((adjustedWarpKgM - warpWithCrimpKgM).toFixed(5)),
            adjustedKgM: Number(adjustedWarpKgM.toFixed(5)),
            adjustedGM: Number((adjustedWarpKgM * 1000).toFixed(2))
        },
        weft: {
            theoreticalKgM: theoreticalWeftKgM,
            crimpPct: pWeftCrimp,
            crimpWeightKgM: Number((weftWithCrimpKgM - theoreticalWeftKgM).toFixed(5)),
            wastagePct: pWeftWastage,
            wastageWeightKgM: Number((adjustedWeftKgM - weftWithCrimpKgM).toFixed(5)),
            adjustedKgM: Number(adjustedWeftKgM.toFixed(5)),
            adjustedGM: Number((adjustedWeftKgM * 1000).toFixed(2))
        },
        totalYarnKgM: Number(totalYarnKgM.toFixed(5)),
        totalYarnGM: Number((totalYarnKgM * 1000).toFixed(2)),
        warpSharePct: totalYarnKgM > 0 ? Number(((adjustedWarpKgM / totalYarnKgM) * 100).toFixed(1)) : 50,
        weftSharePct: totalYarnKgM > 0 ? Number(((adjustedWeftKgM / totalYarnKgM) * 100).toFixed(1)) : 50
    };
}

/**
 * Calculates process loss allowances for fabric production
 * @param {number} theoreticalMeters
 * @param {object} options
 * @param {number} [options.sizingLossPct=0]
 * @param {number} [options.weavingLossPct=1.5]
 * @param {number} [options.rejectPct=2.0]
 */
function calculateProcessAllowances(theoreticalMeters, {
    sizingLossPct = 0,
    weavingLossPct = 1.5,
    rejectPct = 2.0
} = {}) {
    const pSizing = Math.max(0, parseFloat(sizingLossPct) || 0);
    const pWeaving = Math.max(0, parseFloat(weavingLossPct) || 0);
    const pReject = Math.max(0, parseFloat(rejectPct) || 0);

    const totalLossPct = pSizing + pWeaving + pReject;
    const efficiencyPct = Math.max(0, 100 - totalLossPct);

    const expectedUsableMeters = theoreticalMeters * (efficiencyPct / 100);
    const totalLossMeters = theoreticalMeters - expectedUsableMeters;

    return {
        theoreticalMeters: Number(theoreticalMeters.toFixed(1)),
        sizingLossPct: pSizing,
        weavingLossPct: pWeaving,
        rejectPct: pReject,
        totalLossPct: Number(totalLossPct.toFixed(2)),
        efficiencyPct: Number(efficiencyPct.toFixed(2)),
        lossMeters: Number(totalLossMeters.toFixed(1)),
        expectedUsableMeters: Number(expectedUsableMeters.toFixed(1))
    };
}

module.exports = {
    calculateAdjustedYarnConsumption,
    calculateProcessAllowances
};
