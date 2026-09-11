const validateCostingInput = (req, res, next) => {
    const { width, epi, ppi, warp_count, warp_rate, weft_count, weft_rate } = req.body;
    const errors = [];

    if (!width || isNaN(width) || Number(width) <= 0) errors.push('Valid fabric width (in inches) is required.');
    if (!epi || isNaN(epi) || Number(epi) <= 0) errors.push('Valid EPI (Ends Per Inch) is required.');
    if (!ppi || isNaN(ppi) || Number(ppi) <= 0) errors.push('Valid PPI (Picks Per Inch) is required.');
    if (!warp_count || isNaN(warp_count) || Number(warp_count) <= 0) errors.push('Valid Warp Yarn Count (Ne) is required.');
    if (warp_rate === undefined || isNaN(warp_rate) || Number(warp_rate) < 0) errors.push('Valid Warp Yarn Rate is required.');
    if (!weft_count || isNaN(weft_count) || Number(weft_count) <= 0) errors.push('Valid Weft Yarn Count (Ne) is required.');
    if (weft_rate === undefined || isNaN(weft_rate) || Number(weft_rate) < 0) errors.push('Valid Weft Yarn Rate is required.');

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed on textile parameters',
            errors
        });
    }

    next();
};

module.exports = {
    validateCostingInput
};
