/**
 * Weft Yarn Consumption Calculation Module
 * 
 * Theoretical Weft kg/m Formula for Ne count:
 * Theoretical Weft kg/m = (PPI * Fabric Width in inches) / (1693.35 * Weft_Ne)
 */

const { CONSTANTS, normalizeToNe } = require('./yarnConversion');

/**
 * Calculates theoretical weft yarn consumption per linear meter of fabric
 * @param {object} params
 * @param {number} params.ppi - Picks Per Inch
 * @param {number} params.width - Fabric width in inches
 * @param {number} params.count - Weft yarn count numerical value
 * @param {string} [params.countSystem='Ne'] - Weft count system (Ne, Nm, Tex, Denier)
 * @returns {object}
 */
function calculateTheoreticalWeftConsumption({ ppi, width, count, countSystem = 'Ne' }) {
    const parsedPpi = parseFloat(ppi);
    const parsedWidth = parseFloat(width);

    if (!parsedPpi || parsedPpi <= 0) {
        throw new Error(`Invalid PPI: ${ppi}`);
    }
    if (!parsedWidth || parsedWidth <= 0) {
        throw new Error(`Invalid width: ${width}`);
    }

    const norm = normalizeToNe(count, countSystem);
    const weftNe = norm.equivalentNe;

    const theoreticalWeftKgM = (parsedPpi * parsedWidth) / (CONSTANTS.ENGLISH_COTTON_CONSTANT * weftNe);

    return {
        ppi: parsedPpi,
        width: parsedWidth,
        weftCount: norm.originalValue,
        weftCountSystem: norm.originalSystem,
        equivalentNe: weftNe,
        tex: norm.tex,
        denier: norm.denier,
        theoreticalWeftKgM: Number(theoreticalWeftKgM.toFixed(5)),
        formula: '(PPI * Width) / (1693.35 * Weft_Ne)'
    };
}

module.exports = {
    calculateTheoreticalWeftConsumption
};
