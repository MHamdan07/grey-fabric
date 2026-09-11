/**
 * Sizing Cost Calculation Module
 * 
 * Sizing applies to warp yarn only.
 * Supported Charge Types:
 * - per_kg_warp: Sizing tariff is in PKR/kg of sized warp yarn
 * - per_meter: Standard sizing charge per linear meter of fabric
 * - fixed: Fixed process allotment per meter
 */

/**
 * Calculates sizing cost per linear meter
 * @param {object} params
 * @param {number} params.adjustedWarpKgM - Sized warp yarn consumption in kg/m
 * @param {number} params.rate - Sizing rate/charge value
 * @param {string} [params.chargeType='per_meter'] - 'per_meter', 'per_kg_warp', or 'fixed'
 * @returns {object}
 */
function calculateSizingCost({ adjustedWarpKgM, rate, chargeType = 'per_meter' }) {
    const pRate = Math.max(0, parseFloat(rate) || 0);
    const type = String(chargeType).trim().toLowerCase();

    let costPerMeter = 0;
    let calculationFormula = '';

    switch (type) {
        case 'per_kg_warp':
        case 'per_kg':
        case 'rs_per_kg':
            costPerMeter = (adjustedWarpKgM || 0) * pRate;
            calculationFormula = `Adjusted Warp kg/m (${adjustedWarpKgM}) * Sizing Rate (Rs. ${pRate}/kg)`;
            break;

        case 'per_meter':
        case 'rs_per_meter':
            costPerMeter = pRate;
            calculationFormula = `Fixed Rate (Rs. ${pRate}/meter)`;
            break;

        case 'fixed':
        default:
            costPerMeter = pRate;
            calculationFormula = `Fixed Allowance (Rs. ${pRate}/meter)`;
            break;
    }

    return {
        sizingChargeType: type,
        sizingRate: pRate,
        sizingCostM: Number(costPerMeter.toFixed(2)),
        formula: calculationFormula
    };
}

module.exports = {
    calculateSizingCost
};
