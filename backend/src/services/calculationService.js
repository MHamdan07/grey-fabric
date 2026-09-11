/**
 * Textile Engineering Grey Fabric Calculation Engine Service Facade
 * Forwards requests to the modular calculation engine
 */

const calculationEngine = require('./calculation/calculationEngine');

function calculateGreyFabricCost(input) {
    return calculationEngine.calculateCosting(input);
}

module.exports = {
    calculateGreyFabricCost,
    calculateCosting: calculationEngine.calculateCosting,
    planYarnToFabric: calculationEngine.planYarnToFabric,
    planFabricToYarn: calculationEngine.planFabricToYarn,
    normalizeToNe: calculationEngine.normalizeToNe,
    TEXTILE_CONSTANT: calculationEngine.CONSTANTS.ENGLISH_COTTON_CONSTANT,
    FORMULA_METADATA: calculationEngine.FORMULA_METADATA
};
