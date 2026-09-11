/**
 * Export Formatter & Styling Utilities for ExcelJS Workbooks
 * Consistent with Grey Fabric Costing branding (Charcoal #1E2028 + Orange #FF6B00)
 */

const THEME = {
    primaryDark: 'FF1E2028',
    primaryOrange: 'FFFF6B00',
    accentOrangeLight: 'FFFFF0E6',
    tableHeaderBg: 'FF2A2D3A',
    tableHeaderFont: 'FFFFFFFF',
    borderGray: 'FFE0E0E0',
    zebraLight: 'FFF9FAFB',
    textMain: 'FF1A1A1A',
    textMuted: 'FF666666'
};

const NUMBER_FORMATS = {
    CURRENCY: '"Rs. "#,##0.00',
    PERCENT: '0.00"%"',
    PERCENT_1DEC: '0.0"%"',
    WEIGHT: '#,##0.0000',
    METERS: '#,##0.00" m"',
    INTEGER: '#,##0',
    DECIMAL: '#,##0.00',
    DATE: 'YYYY-MM-DD'
};

function applyTitleBlock(worksheet, { title, generatedBy = 'Admin', dateRange = 'All Records', recordCount = null }) {
    // Row 1: App Title Banner
    const row1 = worksheet.getRow(1);
    row1.height = 28;
    worksheet.mergeCells('A1:F1');
    const cellA1 = worksheet.getCell('A1');
    cellA1.value = `GREY FABRIC COSTING SYSTEM — ${title.toUpperCase()}`;
    cellA1.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
    cellA1.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: THEME.primaryDark }
    };
    cellA1.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

    // Row 2: Metadata row
    const row2 = worksheet.getRow(2);
    row2.height = 20;
    worksheet.mergeCells('A2:F2');
    const cellA2 = worksheet.getCell('A2');
    const metaParts = [
        `Generated On: ${new Date().toISOString().slice(0, 10)} ${new Date().toLocaleTimeString()}`,
        `Operator: ${generatedBy}`,
        `Filter: ${dateRange}`
    ];
    if (recordCount !== null) metaParts.push(`Matching Records: ${recordCount}`);
    cellA2.value = metaParts.join('  |  ');
    cellA2.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FFFFFFFF' } };
    cellA2.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: THEME.primaryOrange }
    };
    cellA2.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

    // Blank spacing row 3
    worksheet.getRow(3).height = 10;
}

function applyHeaderRowStyle(row, { height = 24, bgColor = THEME.tableHeaderBg, fontColor = THEME.tableHeaderFont } = {}) {
    row.height = height;
    row.eachCell({ includeEmpty: true }, (cell) => {
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: fontColor } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: bgColor }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FF444754' } },
            left: { style: 'thin', color: { argb: 'FF444754' } },
            bottom: { style: 'medium', color: { argb: THEME.primaryOrange } },
            right: { style: 'thin', color: { argb: 'FF444754' } }
        };
    });
}

function applyDataRowStyles(worksheet, startRow, endRow, columnsConfig = []) {
    for (let r = startRow; r <= endRow; r++) {
        const row = worksheet.getRow(r);
        row.height = 20;
        const isZebra = r % 2 === 0;

        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const config = columnsConfig[colNumber - 1] || {};
            cell.font = { name: 'Segoe UI', size: 9.5, color: { argb: THEME.textMain } };
            
            if (isZebra) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: THEME.zebraLight }
                };
            }

            cell.border = {
                top: { style: 'thin', color: { argb: THEME.borderGray } },
                left: { style: 'thin', color: { argb: THEME.borderGray } },
                bottom: { style: 'thin', color: { argb: THEME.borderGray } },
                right: { style: 'thin', color: { argb: THEME.borderGray } }
            };

            // Formatting
            if (config.numFmt) {
                cell.numFmt = config.numFmt;
            }

            // Alignment
            if (config.align) {
                cell.alignment = { vertical: 'middle', horizontal: config.align };
            } else if (config.numFmt === NUMBER_FORMATS.CURRENCY || config.numFmt === NUMBER_FORMATS.WEIGHT || config.numFmt === NUMBER_FORMATS.DECIMAL) {
                cell.alignment = { vertical: 'middle', horizontal: 'right' };
            } else {
                cell.alignment = { vertical: 'middle', horizontal: 'left' };
            }
        });
    }
}

function autoFitColumns(worksheet, minWidth = 12, maxWidth = 35) {
    worksheet.columns.forEach((column) => {
        let maxLen = 0;
        column.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
            if (rowNumber <= 3) return; // Skip merged title rows
            const cellVal = cell.value ? String(cell.value) : '';
            if (cellVal.length > maxLen) {
                maxLen = cellVal.length;
            }
        });
        column.width = Math.max(minWidth, Math.min(maxWidth, maxLen + 3));
    });
}

module.exports = {
    THEME,
    NUMBER_FORMATS,
    applyTitleBlock,
    applyHeaderRowStyle,
    applyDataRowStyles,
    autoFitColumns
};
