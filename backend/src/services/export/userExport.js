const ExcelJS = require('exceljs');
const {
    THEME,
    NUMBER_FORMATS,
    applyTitleBlock,
    applyHeaderRowStyle,
    applyDataRowStyles,
    autoFitColumns
} = require('./exportFormatter');

async function generateUserWorkbook(users = [], { generatedBy = 'Administrator', filterDesc = 'All Accounts' } = {}) {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Grey Fabric Costing System';
    workbook.lastModifiedBy = generatedBy;
    workbook.created = new Date();

    const ws = workbook.addWorksheet('User Accounts', {
        views: [{ state: 'frozen', xSplit: 0, ySplit: 4 }]
    });

    applyTitleBlock(ws, {
        title: 'User Accounts & Roles Registry',
        generatedBy,
        dateRange: filterDesc,
        recordCount: users.length
    });

    // Strictly SAFE fields only - no authentication secrets
    const headers = [
        'User ID', 'Full Name', 'Email Address', 'Assigned System Role',
        'Account Status', 'Assigned Permissions Count', 'Account Created Date', 'Last Updated'
    ];

    const row4 = ws.getRow(4);
    row4.values = headers;
    applyHeaderRowStyle(row4);

    const configs = [
        { align: 'center', numFmt: NUMBER_FORMATS.INTEGER },
        { align: 'left' },
        { align: 'left' },
        { align: 'center' },
        { align: 'center' },
        { align: 'right', numFmt: NUMBER_FORMATS.INTEGER },
        { align: 'center', numFmt: NUMBER_FORMATS.DATE },
        { align: 'center', numFmt: NUMBER_FORMATS.DATE }
    ];

    users.forEach((u) => {
        const permsCount = Array.isArray(u.permissions) ? u.permissions.length : 0;
        ws.addRow([
            u.id || '',
            u.name || '',
            u.email || '',
            (u.role || 'staff').toUpperCase(),
            (u.status || 'active').toUpperCase(),
            permsCount,
            u.created_at ? u.created_at.slice(0, 10) : '',
            u.updated_at ? u.updated_at.slice(0, 10) : ''
        ]);
    });

    applyDataRowStyles(ws, 5, 4 + users.length, configs);
    autoFitColumns(ws, 12, 32);
    ws.autoFilter = {
        from: { row: 4, column: 1 },
        to: { row: 4 + users.length, column: headers.length }
    };

    return workbook;
}

module.exports = {
    generateUserWorkbook
};
