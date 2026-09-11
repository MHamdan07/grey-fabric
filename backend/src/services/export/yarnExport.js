const ExcelJS = require('exceljs');
const {
    THEME,
    NUMBER_FORMATS,
    applyTitleBlock,
    applyHeaderRowStyle,
    applyDataRowStyles,
    autoFitColumns
} = require('./exportFormatter');

async function generateYarnWorkbook(yarns = [], { generatedBy = 'Operator', filterDesc = 'All Active Yarns' } = {}) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Grey Fabric Costing System';
    workbook.lastModifiedBy = generatedBy;
    workbook.created = new Date();

    const ws = workbook.addWorksheet('Yarn Master', {
        views: [{ state: 'frozen', xSplit: 0, ySplit: 4 }]
    });

    applyTitleBlock(ws, {
        title: 'Yarn Master Catalog & Rate Ledger',
        generatedBy,
        dateRange: filterDesc,
        recordCount: yarns.length
    });

    const headers = [
        'Yarn ID', 'Yarn Count Display', 'Count Value (Ne)', 'Count System',
        'Yarn Type', 'Yarn Rate (Rs/kg)', 'Supplier Name',
        'Effective Date', 'Status', 'Created At', 'Last Updated'
    ];

    const row4 = ws.getRow(4);
    row4.values = headers;
    applyHeaderRowStyle(row4);

    const configs = [
        { align: 'center', numFmt: NUMBER_FORMATS.INTEGER },
        { align: 'center' },
        { align: 'right', numFmt: NUMBER_FORMATS.DECIMAL },
        { align: 'center' },
        { align: 'left' },
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY },
        { align: 'left' },
        { align: 'center', numFmt: NUMBER_FORMATS.DATE },
        { align: 'center' },
        { align: 'center', numFmt: NUMBER_FORMATS.DATE },
        { align: 'center', numFmt: NUMBER_FORMATS.DATE }
    ];

    yarns.forEach((y) => {
        ws.addRow([
            y.id || '',
            y.yarn_count || '',
            Number(y.count_value) || 0,
            y.count_system || 'Ne',
            y.yarn_type || 'Cotton Combed',
            Number(y.yarn_rate) || 0,
            y.supplier_name || 'Internal Mill Stock',
            y.effective_date || '',
            (y.status || 'active').toUpperCase(),
            y.created_at ? y.created_at.slice(0, 10) : '',
            y.updated_at ? y.updated_at.slice(0, 10) : ''
        ]);
    });

    applyDataRowStyles(ws, 5, 4 + yarns.length, configs);
    autoFitColumns(ws, 10, 30);
    ws.autoFilter = {
        from: { row: 4, column: 1 },
        to: { row: 4 + yarns.length, column: headers.length }
    };

    return workbook;
}

module.exports = {
    generateYarnWorkbook
};
