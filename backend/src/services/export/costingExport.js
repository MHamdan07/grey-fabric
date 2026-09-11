const ExcelJS = require('exceljs');
const {
    THEME,
    NUMBER_FORMATS,
    applyTitleBlock,
    applyHeaderRowStyle,
    applyDataRowStyles,
    autoFitColumns
} = require('./exportFormatter');

/**
 * Generates the multi-sheet Grey Fabric Costing Excel Workbook
 * Sheet 1: Costing Summary
 * Sheet 2: Calculation Breakdown
 * Sheet 3: Inputs / Assumptions
 */
async function generateCostingWorkbook(costings = [], { generatedBy = 'Operator', filterDesc = 'All Records' } = {}) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Grey Fabric Costing System';
    workbook.lastModifiedBy = generatedBy;
    workbook.created = new Date();
    workbook.modified = new Date();

    // ==========================================
    // SHEET 1: COSTING SUMMARY
    // ==========================================
    const ws1 = workbook.addWorksheet('Costing Summary', {
        views: [{ state: 'frozen', xSplit: 0, ySplit: 4 }]
    });

    applyTitleBlock(ws1, {
        title: 'Grey Fabric Costing Summary Ledger',
        generatedBy,
        dateRange: filterDesc,
        recordCount: costings.length
    });

    const summaryHeaders = [
        'Costing ID', 'Date', 'Created By', 'Article Name', 'Fabric Code',
        'Construction', 'Width', 'Width Unit', 'EPI', 'PPI',
        'Warp Count', 'Warp Count System', 'Warp Rate (Rs/kg)',
        'Weft Count', 'Weft Count System', 'Weft Rate (Rs/kg)',
        'Warp Crimp %', 'Weft Crimp %', 'Warp Wastage %', 'Weft Wastage %',
        'Sizing Charges (Rs/m)', 'Weaving Charges (Rs/m)', 'Other Charges (Rs/m)',
        'Total Yarn Cons. (kg/m)', 'Warp Cost / M', 'Weft Cost / M',
        'Sizing Cost / M', 'Weaving Cost / M', 'Other Cost / M',
        'Grey Fabric Cost / M', 'Formula Version'
    ];

    const row4 = ws1.getRow(4);
    row4.values = summaryHeaders;
    applyHeaderRowStyle(row4);

    const summaryConfigs = [
        { align: 'center' }, // Costing ID
        { align: 'center', numFmt: NUMBER_FORMATS.DATE }, // Date
        { align: 'left' }, // Created By
        { align: 'left' }, // Article Name
        { align: 'left' }, // Fabric Code
        { align: 'center' }, // Construction
        { align: 'right', numFmt: NUMBER_FORMATS.DECIMAL }, // Width
        { align: 'center' }, // Width Unit
        { align: 'right', numFmt: NUMBER_FORMATS.INTEGER }, // EPI
        { align: 'right', numFmt: NUMBER_FORMATS.INTEGER }, // PPI
        { align: 'right', numFmt: NUMBER_FORMATS.DECIMAL }, // Warp Count
        { align: 'center' }, // Warp Count System
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY }, // Warp Rate
        { align: 'right', numFmt: NUMBER_FORMATS.DECIMAL }, // Weft Count
        { align: 'center' }, // Weft Count System
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY }, // Weft Rate
        { align: 'right', numFmt: NUMBER_FORMATS.PERCENT_1DEC }, // Warp Crimp
        { align: 'right', numFmt: NUMBER_FORMATS.PERCENT_1DEC }, // Weft Crimp
        { align: 'right', numFmt: NUMBER_FORMATS.PERCENT_1DEC }, // Warp Wastage
        { align: 'right', numFmt: NUMBER_FORMATS.PERCENT_1DEC }, // Weft Wastage
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY }, // Sizing Charges
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY }, // Weaving Charges
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY }, // Other Charges
        { align: 'right', numFmt: NUMBER_FORMATS.WEIGHT }, // Total Yarn Cons.
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY }, // Warp Cost / M
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY }, // Weft Cost / M
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY }, // Sizing Cost / M
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY }, // Weaving Cost / M
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY }, // Other Cost / M
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY }, // Grey Fabric Cost / M
        { align: 'center' } // Formula Version
    ];

    costings.forEach((c) => {
        const construction = `${c.warp_count}x${c.weft_count} / ${c.epi}x${c.ppi}`;
        ws1.addRow([
            c.costing_id || '',
            c.created_at ? c.created_at.slice(0, 10) : '',
            c.creator_name || 'System',
            c.article_name || '',
            c.fabric_code || '',
            construction,
            Number(c.width) || 0,
            'inches',
            Number(c.epi) || 0,
            Number(c.ppi) || 0,
            Number(c.warp_count) || 0,
            c.warp_count_system || 'Ne',
            Number(c.warp_rate) || 0,
            Number(c.weft_count) || 0,
            c.weft_count_system || 'Ne',
            Number(c.weft_rate) || 0,
            Number(c.warp_crimp != null ? c.warp_crimp : 5.0) / 100,
            Number(c.weft_crimp != null ? c.weft_crimp : 5.0) / 100,
            Number(c.warp_wastage != null ? c.warp_wastage : 2.0) / 100,
            Number(c.weft_wastage != null ? c.weft_wastage : 2.0) / 100,
            Number(c.sizing_charges) || 0,
            Number(c.weaving_charges) || 0,
            Number(c.other_charges) || 0,
            Number(c.total_weight_kg) || 0,
            Number(c.warp_cost) || 0,
            Number(c.weft_cost) || 0,
            Number(c.sizing_charges) || 0,
            Number(c.weaving_charges) || 0,
            Number(c.other_charges) || 0,
            Number(c.grey_cost_per_meter) || 0,
            c.formula_version || 'Standard Cotton v1.0'
        ]);
    });

    applyDataRowStyles(ws1, 5, 4 + costings.length, summaryConfigs);
    autoFitColumns(ws1, 10, 36);
    ws1.autoFilter = {
        from: { row: 4, column: 1 },
        to: { row: 4 + costings.length, column: summaryHeaders.length }
    };

    // ==========================================
    // SHEET 2: CALCULATION BREAKDOWN
    // ==========================================
    const ws2 = workbook.addWorksheet('Calculation Breakdown', {
        views: [{ state: 'frozen', xSplit: 0, ySplit: 4 }]
    });

    applyTitleBlock(ws2, {
        title: 'Detailed Textile Calculation Breakdown',
        generatedBy,
        dateRange: filterDesc,
        recordCount: costings.length
    });

    const calcHeaders = [
        'Costing ID', 'Article Name', 'Width (in)',
        'EPI', 'Warp Count (Ne)', 'Theoretical Warp (kg/m)', 'Warp Crimp %', 'Warp Wastage %', 'Adjusted Warp (kg/m)', 'Warp Rate (Rs/kg)', 'Warp Cost / M',
        'PPI', 'Weft Count (Ne)', 'Theoretical Weft (kg/m)', 'Weft Crimp %', 'Weft Wastage %', 'Adjusted Weft (kg/m)', 'Weft Rate (Rs/kg)', 'Weft Cost / M',
        'Total Yarn Weight (kg/m)', 'Sizing Cost / M', 'Weaving Cost / M', 'Other Mfg Cost / M',
        'Total Process Charges / M', 'FINAL GREY COST / M'
    ];

    const row4_ws2 = ws2.getRow(4);
    row4_ws2.values = calcHeaders;
    applyHeaderRowStyle(row4_ws2);

    const calcConfigs = [
        { align: 'center' }, // Costing ID
        { align: 'left' },   // Article Name
        { align: 'right', numFmt: NUMBER_FORMATS.DECIMAL },
        // Warp
        { align: 'right', numFmt: NUMBER_FORMATS.INTEGER },
        { align: 'right', numFmt: NUMBER_FORMATS.DECIMAL },
        { align: 'right', numFmt: NUMBER_FORMATS.WEIGHT },
        { align: 'right', numFmt: NUMBER_FORMATS.PERCENT_1DEC },
        { align: 'right', numFmt: NUMBER_FORMATS.PERCENT_1DEC },
        { align: 'right', numFmt: NUMBER_FORMATS.WEIGHT },
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY },
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY },
        // Weft
        { align: 'right', numFmt: NUMBER_FORMATS.INTEGER },
        { align: 'right', numFmt: NUMBER_FORMATS.DECIMAL },
        { align: 'right', numFmt: NUMBER_FORMATS.WEIGHT },
        { align: 'right', numFmt: NUMBER_FORMATS.PERCENT_1DEC },
        { align: 'right', numFmt: NUMBER_FORMATS.PERCENT_1DEC },
        { align: 'right', numFmt: NUMBER_FORMATS.WEIGHT },
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY },
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY },
        // Summary
        { align: 'right', numFmt: NUMBER_FORMATS.WEIGHT },
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY },
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY },
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY },
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY },
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY }
    ];

    costings.forEach((c) => {
        const warpCrimp = Number(c.warp_crimp != null ? c.warp_crimp : 5.0);
        const warpWastage = Number(c.warp_wastage != null ? c.warp_wastage : 2.0);
        const weftCrimp = Number(c.weft_crimp != null ? c.weft_crimp : 5.0);
        const weftWastage = Number(c.weft_wastage != null ? c.weft_wastage : 2.0);

        // Theoretical consumption approximation
        const adjWarpKg = Number(c.warp_weight_kg) || 0;
        const adjWeftKg = Number(c.weft_weight_kg) || 0;
        const theoWarpKg = adjWarpKg > 0 ? (adjWarpKg / (1 + (warpCrimp + warpWastage) / 100)) : 0;
        const theoWeftKg = adjWeftKg > 0 ? (adjWeftKg / (1 + (weftCrimp + weftWastage) / 100)) : 0;

        const totalProcess = (Number(c.sizing_charges) || 0) + (Number(c.weaving_charges) || 0) + (Number(c.other_charges) || 0);

        ws2.addRow([
            c.costing_id || '',
            c.article_name || '',
            Number(c.width) || 0,
            Number(c.epi) || 0,
            Number(c.warp_count) || 0,
            theoWarpKg,
            warpCrimp / 100,
            warpWastage / 100,
            adjWarpKg,
            Number(c.warp_rate) || 0,
            Number(c.warp_cost) || 0,
            Number(c.ppi) || 0,
            Number(c.weft_count) || 0,
            theoWeftKg,
            weftCrimp / 100,
            weftWastage / 100,
            adjWeftKg,
            Number(c.weft_rate) || 0,
            Number(c.weft_cost) || 0,
            Number(c.total_weight_kg) || 0,
            Number(c.sizing_charges) || 0,
            Number(c.weaving_charges) || 0,
            Number(c.other_charges) || 0,
            totalProcess,
            Number(c.grey_cost_per_meter) || 0
        ]);
    });

    applyDataRowStyles(ws2, 5, 4 + costings.length, calcConfigs);
    autoFitColumns(ws2, 10, 32);
    ws2.autoFilter = {
        from: { row: 4, column: 1 },
        to: { row: 4 + costings.length, column: calcHeaders.length }
    };

    // ==========================================
    // SHEET 3: INPUTS / ASSUMPTIONS
    // ==========================================
    const ws3 = workbook.addWorksheet('Inputs & Assumptions', {
        views: [{ state: 'frozen', xSplit: 0, ySplit: 4 }]
    });

    applyTitleBlock(ws3, {
        title: 'Manufacturing Assumptions & Standards',
        generatedBy,
        dateRange: filterDesc,
        recordCount: costings.length
    });

    const assumptionHeaders = [
        'Costing ID', 'Article Name', 'Formula Version', 'Count System',
        'Textile Constant (K)', 'Warp Crimp Method', 'Warp Wastage Method',
        'Weft Crimp Method', 'Weft Wastage Method', 'Sizing Tariff Basis', 'Weaving Tariff Basis',
        'Currency', 'Phase Boundary'
    ];

    const row4_ws3 = ws3.getRow(4);
    row4_ws3.values = assumptionHeaders;
    applyHeaderRowStyle(row4_ws3);

    costings.forEach((c) => {
        ws3.addRow([
            c.costing_id || '',
            c.article_name || '',
            c.formula_version || 'Standard Cotton v1.0',
            `${c.warp_count_system || 'Ne'} / ${c.weft_count_system || 'Ne'}`,
            1693.35,
            'Thread interlacing take-up (%)',
            'Warping & tying fiber loss (%)',
            'Crosswise contraction (%)',
            'Selvedge & loom waste (%)',
            c.sizing_charge_type || 'per_meter (Rs./m)',
            c.weaving_charge_type || 'per_meter (Rs./m)',
            'PKR (Pakistani Rupee)',
            'Phase 1: Zero-margin pure manufacturing cost'
        ]);
    });

    applyDataRowStyles(ws3, 5, 4 + costings.length);
    autoFitColumns(ws3, 12, 36);

    return workbook;
}

module.exports = {
    generateCostingWorkbook
};
