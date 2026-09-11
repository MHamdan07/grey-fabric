/**
 * Yarn Count System Conversion Module
 * 
 * Supports:
 * - Ne: English Cotton Count (Number of 840-yard hanks per pound) [Indirect]
 * - Nm: Metric Count (Kilometers of yarn per kilogram) [Indirect]
 * - Tex: Linear Density (Grams per 1,000 meters) [Direct]
 * - Denier: Linear Density (Grams per 9,000 meters) [Direct]
 * 
 * Relationships:
 * - Nm = Ne * 1.69335  =>  Ne = Nm / 1.69335
 * - Tex = 590.541 / Ne  =>  Ne = 590.541 / Tex
 * - Denier = 5314.87 / Ne => Ne = 5314.87 / Denier
 * - Tex = Denier / 9
 */

const CONSTANTS = {
    TEX_CONSTANT: 590.541,
    DENIER_CONSTANT: 5314.87,
    METRIC_FACTOR: 1.69335,
    ENGLISH_COTTON_CONSTANT: 1693.35 // (840 yd / 0.45359237 kg / 1.0936133 m)
};

/**
 * Converts any count system value to equivalent English Cotton Count (Ne)
 * @param {number} value - Numerical count value
 * @param {string} system - Count system ('Ne', 'Nm', 'Tex', 'Denier')
 * @returns {object} { equivalentNe, tex, denier, originalSystem, originalValue }
 */
function normalizeToNe(value, system = 'Ne') {
    const num = parseFloat(value);
    if (!num || num <= 0) {
        throw new Error(`Invalid yarn count value: ${value}`);
    }

    const sys = String(system).trim();
    let equivalentNe;
    let tex;
    let denier;

    switch (sys.toLowerCase()) {
        case 'ne':
        case 'english':
        case 'cotton':
            equivalentNe = num;
            tex = CONSTANTS.TEX_CONSTANT / num;
            denier = CONSTANTS.DENIER_CONSTANT / num;
            break;

        case 'nm':
        case 'metric':
            equivalentNe = num / CONSTANTS.METRIC_FACTOR;
            tex = 1000 / num;
            denier = 9000 / num;
            break;

        case 'tex':
            equivalentNe = CONSTANTS.TEX_CONSTANT / num;
            tex = num;
            denier = num * 9;
            break;

        case 'denier':
        case 'den':
            equivalentNe = CONSTANTS.DENIER_CONSTANT / num;
            tex = num / 9;
            denier = num;
            break;

        default:
            throw new Error(`Unsupported yarn count system: "${system}". Allowed systems: Ne, Nm, Tex, Denier.`);
    }

    return {
        originalValue: num,
        originalSystem: sys.toUpperCase(),
        equivalentNe: Number(equivalentNe.toFixed(4)),
        tex: Number(tex.toFixed(3)),
        denier: Number(denier.toFixed(2))
    };
}

module.exports = {
    normalizeToNe,
    CONSTANTS
};
