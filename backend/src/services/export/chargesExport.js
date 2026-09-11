const ExcelJS = require('exceljs');
const {
    THEME,
    NUMBER_FORMATS,
    applyTitleBlock,
    applyHeaderRowStyle,
    applyDataRowStyles,
    autoFitColumns
} = require('./exportFormatter');

async function generateChargesWorkbook(charges = [], { generatedBy = 'Operator', filterDesc = 'All Process Charges' } = {}) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Grey Fabric Costing System';
    workbook.lastModifiedBy = generatedBy;
    workbook.created = new Date();

    const ws = workbook.addWorksheet('Process Charges', {
        views: [{ state: 'frozen', xSplit: 0, ySplit: 4 }]
    });

    applyTitleBlock(ws, {
        title: 'Textile Conversion Tariffs & Process Charges',
        generatedBy,
        dateRange: filterDesc,
        recordCount: charges.length
    });

    const headers = [
        'Charge ID', 'Charge Name', 'Process Type', 'Billing Unit',
        'Tariff Rate', 'Currency', 'Effective Date', 'Status',
        'Created At', 'Last Updated'
    ];

    const row4 = ws.getRow(4);
    row4.values = headers;
    applyHeaderRowStyle(row4);

    const configs = [
        { align: 'center', numFmt: NUMBER_FORMATS.INTEGER },
        { align: 'left' },
        { align: 'left' },
        { align: 'center' },
        { align: 'right', numFmt: NUMBER_FORMATS.CURRENCY },
        { align: 'center' },
        { align: 'center', numFmt: NUMBER_FORMATS.DATE },
        { align: 'center' },
        { align: 'center', numFmt: NUMBER_FORMATS.DATE },
        { align: 'center', numFmt: NUMBER_FORMATS.DATE }
    ];

    charges.forEach((c) => {
        ws.addRow([
            c.id || '',
            c.name || '',
            c.charge_type || 'Processing',
            c.unit ? c.unit.replace('_', ' ') : 'per linear meter',
            Number(c.value) || 0,
            'PKR',
            c.effective_date || '',
            (c.status || 'active').toUpperCase(),
            c.created_at ? c.created_at.slice(0, 10) : '',
            c.updated_at ? c.updated_at.slice(0, 10) : ''
        ]);
    });

    applyDataRowStyles(ws, 5, 4 + charges.length, configs);
    autoFitColumns(ws, 12, 32);
    ws.autoFilter = {
        from: { row: 4, column: 1 },
        to: { row: 4 + charges.length, column: headers.length }
    };

    return workbook;
}

module.exports = {
    generateChargesWorkbook
};
