const Costing = require('../../models/Costing');
const ProductionPlan = require('../../models/ProductionPlan');
const Yarn = require('../../models/Yarn');
const Fabric = require('../../models/Fabric');
const Charge = require('../../models/Charge');
const User = require('../../models/User');

const { generateCostingWorkbook } = require('./costingExport');
const { generateProductionWorkbook } = require('./productionExport');
const { generateYarnWorkbook } = require('./yarnExport');
const { generateFabricWorkbook } = require('./fabricExport');
const { generateChargesWorkbook } = require('./chargesExport');
const { generateUserWorkbook } = require('./userExport');

function formatDateSlug(d = new Date()) {
    return d.toISOString().slice(0, 10);
}

const excelExportService = {
    exportCostingsExcel: async ({ filters = {}, user }) => {
        const records = Costing.getAll({
            search: filters.search,
            startDate: filters.startDate || filters.dateFrom,
            endDate: filters.endDate || filters.dateTo,
            createdBy: filters.createdBy !== 'all' ? filters.createdBy : null
        });

        if (records.length === 0) {
            return { records: [], recordCount: 0 };
        }

        const dateSlug = formatDateSlug();
        const articleSlug = filters.search ? `-${filters.search.replace(/[^a-zA-Z0-9]/g, '-')}` : '';
        const filename = `Grey-Costing-Export${articleSlug}-${dateSlug}.xlsx`;

        let filterDesc = 'All Records';
        if (filters.startDate || filters.endDate) {
            filterDesc = `${filters.startDate || 'Start'} to ${filters.endDate || 'Present'}`;
        }

        const workbook = await generateCostingWorkbook(records, {
            generatedBy: user?.name || 'Authorized Operator',
            filterDesc
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return { buffer, filename, recordCount: records.length };
    },

    exportCostingsCsv: async ({ filters = {}, user }) => {
        const records = Costing.getAll({
            search: filters.search,
            startDate: filters.startDate || filters.dateFrom,
            endDate: filters.endDate || filters.dateTo,
            createdBy: filters.createdBy !== 'all' ? filters.createdBy : null
        });

        if (records.length === 0) {
            return { records: [], recordCount: 0 };
        }

        const headers = [
            'Costing ID', 'Date', 'Created By', 'Article Name', 'Fabric Code',
            'Width (in)', 'EPI', 'PPI', 'Warp Count', 'Warp Count System', 'Warp Rate',
            'Weft Count', 'Weft Count System', 'Weft Rate',
            'Warp Weight (kg/m)', 'Weft Weight (kg/m)', 'Total Weight (kg/m)',
            'GSM', 'GLM', 'Warp Cost/M', 'Weft Cost/M',
            'Sizing Charges', 'Weaving Charges', 'Other Charges',
            'Grey Cost / Meter', 'Formula Version'
        ];

        const rows = records.map(c => [
            c.costing_id,
            c.created_at ? c.created_at.slice(0, 10) : '',
            `"${(c.creator_name || 'System').replace(/"/g, '""')}"`,
            `"${(c.article_name || '').replace(/"/g, '""')}"`,
            c.fabric_code || '',
            c.width,
            c.epi,
            c.ppi,
            c.warp_count,
            c.warp_count_system || 'Ne',
            c.warp_rate,
            c.weft_count,
            c.weft_count_system || 'Ne',
            c.weft_rate,
            c.warp_weight_kg,
            c.weft_weight_kg,
            c.total_weight_kg,
            c.gsm,
            c.glm,
            c.warp_cost,
            c.weft_cost,
            c.sizing_charges,
            c.weaving_charges,
            c.other_charges,
            c.grey_cost_per_meter,
            c.formula_version || 'Standard Cotton v1.0'
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const filename = `Grey-Costing-Export-${formatDateSlug()}.csv`;
        return { csv: csvContent, filename, recordCount: records.length };
    },

    exportProductionExcel: async ({ filters = {}, user }) => {
        const plans = ProductionPlan.getAll({
            search: filters.search,
            planType: filters.planType !== 'all' ? filters.planType : null,
            startDate: filters.startDate || filters.dateFrom,
            endDate: filters.endDate || filters.dateTo
        });

        if (plans.length === 0) {
            return { records: [], recordCount: 0 };
        }

        const filename = `Production-Planning-Export-${formatDateSlug()}.xlsx`;
        const workbook = await generateProductionWorkbook(plans, {
            generatedBy: user?.name || 'Authorized Planner',
            filterDesc: filters.planType || 'All Production Plans'
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return { buffer, filename, recordCount: plans.length };
    },

    exportYarnsExcel: async ({ filters = {}, user }) => {
        const yarns = Yarn.getAll();
        if (yarns.length === 0) {
            return { records: [], recordCount: 0 };
        }

        const filename = `Yarn-Master-Export-${formatDateSlug()}.xlsx`;
        const workbook = await generateYarnWorkbook(yarns, {
            generatedBy: user?.name || 'Authorized Manager',
            filterDesc: 'Complete Yarn Master Catalog'
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return { buffer, filename, recordCount: yarns.length };
    },

    exportFabricsExcel: async ({ filters = {}, user }) => {
        const fabrics = Fabric.getAll();
        if (fabrics.length === 0) {
            return { records: [], recordCount: 0 };
        }

        const filename = `Fabric-Master-Export-${formatDateSlug()}.xlsx`;
        const workbook = await generateFabricWorkbook(fabrics, {
            generatedBy: user?.name || 'Authorized Manager',
            filterDesc: 'Complete Fabric Master Catalog'
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return { buffer, filename, recordCount: fabrics.length };
    },

    exportChargesExcel: async ({ filters = {}, user }) => {
        const charges = Charge.getAll();
        if (charges.length === 0) {
            return { records: [], recordCount: 0 };
        }

        const filename = `Process-Charges-Export-${formatDateSlug()}.xlsx`;
        const workbook = await generateChargesWorkbook(charges, {
            generatedBy: user?.name || 'Authorized Manager',
            filterDesc: 'Active Conversion Tariffs'
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return { buffer, filename, recordCount: charges.length };
    },

    exportUsersExcel: async ({ filters = {}, user }) => {
        const users = User.getAll();
        if (users.length === 0) {
            return { records: [], recordCount: 0 };
        }

        const filename = `User-Accounts-Export-${formatDateSlug()}.xlsx`;
        const workbook = await generateUserWorkbook(users, {
            generatedBy: user?.name || 'System Administrator',
            filterDesc: 'System Users Registry'
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return { buffer, filename, recordCount: users.length };
    }
};

module.exports = excelExportService;
