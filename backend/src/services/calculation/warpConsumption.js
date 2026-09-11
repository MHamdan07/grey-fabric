/**
 * Warp Yarn Consumption Calculation Module
 * 
 * Theoretical Warp kg/m Formula for Ne count:
 * Total Ends = EPI * Fabric Width (inches)
 * Theoretical Warp kg/m = Total Ends / (1693.35 * Warp_Ne)
 */

const { CONSTANTS, normalizeToNe } = require('./yarnConversion');

/**
 * Calculates theoretical warp yarn consumption per linear meter of fabric
 * @param {object} params
 * @param {number} params.epi - Ends Per Inch
 * @param {number} params.width - Fabric width in inches
 * @param {number} params.count - Warp yarn count numerical value
 * @param {string} [params.countSystem='Ne'] - Warp count system (Ne, Nm, Tex, Denier)
 * @returns {object}
 */
function calculateTheoreticalWarpConsumption({ epi, width, count, countSystem = 'Ne' }) {
    const parsedEpi = parseFloat(epi);
    const parsedWidth = parseFloat(width);

    if (!parsedEpi || parsedEpi <= 0) {
        throw new Error(`Invalid EPI: ${epi}`);
    }
    if (!parsedWidth || parsedWidth <= 0) {
        throw new Error(`Invalid width: ${width}`);
    }

    const norm = normalizeToNe(count, countSystem);
    const warpNe = norm.equivalentNe;

    const totalEnds = Math.round(parsedEpi * parsedWidth);
    const theoreticalWarpKgM = totalEnds / (CONSTANTS.ENGLISH_COTTON_CONSTANT * warpNe);

    return {
        totalEnds,
        warpCount: norm.originalValue,
        warpCountSystem: norm.originalSystem,
        equivalentNe: warpNe,
        tex: norm.tex,
        denier: norm.denier,
        theoreticalWarpKgM: Number(theoreticalWarpKgM.toFixed(5)),
        formula: '(EPI * Width) / (1693.35 * Warp_Ne)'
    };
}

module.exports = {
    calculateTheoreticalWarpConsumption
};
