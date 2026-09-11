const ExcelJS = require('exceljs');
const {
    THEME,
    NUMBER_FORMATS,
    applyTitleBlock,
    applyHeaderRowStyle,
    applyDataRowStyles,
    autoFitColumns
} = require('./exportFormatter');

async function generateFabricWorkbook(fabrics = [], { generatedBy = 'Operator', filterDesc = 'All Master Fabrics' } = {}) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Grey Fabric Costing System';
    workbook.lastModifiedBy = generatedBy;
    workbook.created = new Date();

    const ws = workbook.addWorksheet('Fabric Master', {
        views: [{ state: 'frozen', xSplit: 0, ySplit: 4 }]
    });

    applyTitleBlock(ws, {
        title: 'Fabric Master Specifications Library',
        generatedBy,
        dateRange: filterDesc,
        recordCount: fabrics.length
    });

    const headers = [
        'Fabric ID', 'Article Name', 'Fabric Code', 'Reed Width (in)', 'EPI', 'PPI',
        'Construction Spec', 'Warp Yarn Details', 'Weft Yarn Details',
        'Std Warp Wastage %', 'Std Weft Wastage %', 'Std Warp Crimp %', 'Std Weft Crimp %',
        'Standard Sizing (Rs/m)', 'Standard Weaving (Rs/m)', 'Status', 'Created At'
    ];

    const row4 = ws.getRow(4);
    row4.values = headers;
    applyHeaderRowStyle(row4);

    const configs = [
        { align: 'center', numFmt: NUMBER_FORMATS.INTEGER },
        { align: 'left' },
        { align: 'left' },
        { align: 'right', numFmt: NUMBER_FORMATS.DECIMAL },
        { align: 'right', numFmt: NUMBER_FORMATS.INTEGER },
        { align: 'right', numFmt: NUMBER_FORMATS.INTEGER },
        { align: 'center' },
        { align: 'left' },
        { align: 'left' },
        { align: 'right', numFmt: NUMBER_FORMATS.PERCENT_1DEC },
        { align: 'right', numFmt: NUMBER_FORMATS.PERCENT_1DEC },
        { align: 'right', numFmt: NUMBER_FORMATS.PERCENT_1DEC },
        { align: 'right', numFmt: NUMBER_FORMATS.PERCENT_1DEC },
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY },
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY },
        { align: 'center' },
        { align: 'center', numFmt: NUMBER_FORMATS.DATE }
    ];

    fabrics.forEach((f) => {
        const warpDesc = f.warp_count ? `${f.warp_count} ${f.warp_yarn_type || ''}` : 'Standard Warp';
        const weftDesc = f.weft_count ? `${f.weft_count} ${f.weft_yarn_type || ''}` : 'Standard Weft';
        const construction = `${f.epi}x${f.ppi} / ${f.width}"`;

        ws.addRow([
            f.id || '',
            f.article_name || '',
            f.fabric_code || '',
            Number(f.width) || 0,
            Number(f.epi) || 0,
            Number(f.ppi) || 0,
            construction,
            warpDesc,
            weftDesc,
            Number(f.standard_wastage || 3.5) / 100,
            Number(f.standard_wastage || 4.0) / 100,
            Number(f.standard_crimp || 5.0) / 100,
            Number(f.standard_crimp || 5.0) / 100,
            Number(f.sizing_charges) || 0,
            Number(f.weaving_charges) || 0,
            (f.status || 'active').toUpperCase(),
            f.created_at ? f.created_at.slice(0, 10) : ''
        ]);
    });

    applyDataRowStyles(ws, 5, 4 + fabrics.length, configs);
    autoFitColumns(ws, 10, 32);
    ws.autoFilter = {
        from: { row: 4, column: 1 },
        to: { row: 4 + fabrics.length, column: headers.length }
    };

    return workbook;
}

module.exports = {
    generateFabricWorkbook
};
