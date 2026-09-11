const ExcelJS = require('exceljs');
const {
    THEME,
    NUMBER_FORMATS,
    applyTitleBlock,
    applyHeaderRowStyle,
    applyDataRowStyles,
    autoFitColumns
} = require('./exportFormatter');

async function generateProductionWorkbook(plans = [], { generatedBy = 'Operator', filterDesc = 'All Plans' } = {}) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Grey Fabric Costing System';
    workbook.lastModifiedBy = generatedBy;
    workbook.created = new Date();

    const ws = workbook.addWorksheet('Production Plans', {
        views: [{ state: 'frozen', xSplit: 0, ySplit: 4 }]
    });

    applyTitleBlock(ws, {
        title: 'Textile Production Planning & Buffer Ledger',
        generatedBy,
        dateRange: filterDesc,
        recordCount: plans.length
    });

    const headers = [
        'Plan ID', 'Date', 'Created By', 'Plan Type', 'Article Name', 'Fabric Code',
        'Width (in)', 'EPI', 'PPI',
        'Warp Count', 'Warp Rate (Rs/kg)', 'Avail. Warp (kg)',
        'Weft Count', 'Weft Rate (Rs/kg)', 'Avail. Weft (kg)',
        'Total Avail. Yarn (kg)', 'Adj. Warp (kg/m)', 'Adj. Weft (kg/m)', 'Total Yarn (kg/m)',
        'Theoretical Meters', 'Expected Meters', 'Planned Target (m)',
        'Process Loss (m)', 'Expected Usable Fabric (m)',
        'Remaining Warp (kg)', 'Remaining Weft (kg)', 'Total Remaining (kg)',
        'Yarn Utilization %', 'Production Efficiency %', 'Limiting Bottleneck'
    ];

    const row4 = ws.getRow(4);
    row4.values = headers;
    applyHeaderRowStyle(row4);

    const configs = [
        { align: 'center' }, // Plan ID
        { align: 'center', numFmt: NUMBER_FORMATS.DATE },
        { align: 'left' },   // Created By
        { align: 'center' }, // Plan Type
        { align: 'left' },   // Article
        { align: 'left' },   // Fabric Code
        { align: 'right', numFmt: NUMBER_FORMATS.DECIMAL },
        { align: 'right', numFmt: NUMBER_FORMATS.INTEGER },
        { align: 'right', numFmt: NUMBER_FORMATS.INTEGER },
        { align: 'right', numFmt: NUMBER_FORMATS.DECIMAL },
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY },
        { align: 'right', numFmt: NUMBER_FORMATS.WEIGHT },
        { align: 'right', numFmt: NUMBER_FORMATS.DECIMAL },
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY },
        { align: 'right', numFmt: NUMBER_FORMATS.WEIGHT },
        { align: 'right', numFmt: NUMBER_FORMATS.WEIGHT },
        { align: 'right', numFmt: NUMBER_FORMATS.WEIGHT },
        { align: 'right', numFmt: NUMBER_FORMATS.WEIGHT },
        { align: 'right', numFmt: NUMBER_FORMATS.WEIGHT },
        { align: 'right', numFmt: NUMBER_FORMATS.METERS },
        { align: 'right', numFmt: NUMBER_FORMATS.METERS },
        { align: 'right', numFmt: NUMBER_FORMATS.METERS },
        { align: 'right', numFmt: NUMBER_FORMATS.METERS },
        { align: 'right', numFmt: NUMBER_FORMATS.METERS },
        { align: 'right', numFmt: NUMBER_FORMATS.WEIGHT },
        { align: 'right', numFmt: NUMBER_FORMATS.WEIGHT },
        { align: 'right', numFmt: NUMBER_FORMATS.WEIGHT },
        { align: 'right', numFmt: NUMBER_FORMATS.PERCENT_1DEC },
        { align: 'right', numFmt: NUMBER_FORMATS.PERCENT_1DEC },
        { align: 'center' }
    ];

    plans.forEach((p) => {
        const theoM = Number(p.theoretical_fabric_meters) || 0;
        const expM = Number(p.expected_fabric_meters) || 0;
        const usableM = Number(p.expected_usable_meters) || expM;
        const lossM = theoM > expM ? theoM - expM : 0;

        ws.addRow([
            p.plan_id || '',
            p.created_at ? p.created_at.slice(0, 10) : '',
            p.creator_name || 'System',
            p.plan_type === 'yarn_to_fabric' ? 'Yarn → Fabric' : 'Fabric → Yarn',
            p.article_name || '',
            p.fabric_code || '',
            Number(p.width) || 0,
            Number(p.epi) || 0,
            Number(p.ppi) || 0,
            Number(p.warp_count) || 0,
            Number(p.warp_rate) || 0,
            Number(p.available_warp_kg) || 0,
            Number(p.weft_count) || 0,
            Number(p.weft_rate) || 0,
            Number(p.available_weft_kg) || 0,
            Number(p.available_yarn_kg) || 0,
            Number(p.consumed_warp_kg && p.expected_fabric_meters ? (p.consumed_warp_kg / p.expected_fabric_meters) : 0),
            Number(p.consumed_weft_kg && p.expected_fabric_meters ? (p.consumed_weft_kg / p.expected_fabric_meters) : 0),
            Number(p.available_yarn_kg && p.expected_fabric_meters ? (p.available_yarn_kg / p.expected_fabric_meters) : 0),
            theoM,
            expM,
            Number(p.target_fabric_meters) || 0,
            lossM,
            usableM,
            Number(p.remaining_warp_kg) || 0,
            Number(p.remaining_weft_kg) || 0,
            Number(p.total_remaining_kg) || 0,
            (Number(p.yarn_utilization_pct) || 100) / 100,
            (Number(p.production_efficiency_pct) || 100) / 100,
            p.limiting_yarn_type || 'balanced'
        ]);
    });

    applyDataRowStyles(ws, 5, 4 + plans.length, configs);
    autoFitColumns(ws, 10, 32);
    ws.autoFilter = {
        from: { row: 4, column: 1 },
        to: { row: 4 + plans.length, column: headers.length }
    };

    return workbook;
}

module.exports = {
    generateProductionWorkbook
};
