/**
 * Weaving Cost Calculation Module
 * 
 * Supported Weaving Charge Types:
 * - per_meter: Standard weaving conversion rate per linear meter (most common in airjet/rapier mills)
 * - per_kg: Weaving charge billed on total grey fabric weight (PKR/kg)
 * - fixed: Fixed machine allotment per meter
 */

/**
 * Calculates weaving insertion cost per linear meter
 * @param {object} params
 * @param {number} params.totalYarnKgM - Total yarn weight per meter (warp + weft)
 * @param {number} params.rate - Weaving charge rate
 * @param {string} [params.chargeType='per_meter'] - 'per_meter', 'per_kg', or 'fixed'
 * @returns {object}
 */
function calculateWeavingCost({ totalYarnKgM, rate, chargeType = 'per_meter' }) {
    const pRate = Math.max(0, parseFloat(rate) || 0);
    const type = String(chargeType).trim().toLowerCase();

    let costPerMeter = 0;
    let calculationFormula = '';

    switch (type) {
        case 'per_kg':
        case 'rs_per_kg':
            costPerMeter = (totalYarnKgM || 0) * pRate;
            calculationFormula = `Total Yarn kg/m (${totalYarnKgM}) * Weaving Rate (Rs. ${pRate}/kg)`;
            break;

        case 'per_meter':
        case 'rs_per_meter':
            costPerMeter = pRate;
            calculationFormula = `Rate per Meter (Rs. ${pRate}/m)`;
            break;

        case 'fixed':
        default:
            costPerMeter = pRate;
            calculationFormula = `Fixed Allowance (Rs. ${pRate}/m)`;
            break;
    }

    return {
        weavingChargeType: type,
        weavingRate: pRate,
        weavingCostM: Number(costPerMeter.toFixed(2)),
        formula: calculationFormula
    };
}

module.exports = {
    calculateWeavingCost
};
