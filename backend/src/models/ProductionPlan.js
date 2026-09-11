const db = require('../config/database');

const ProductionPlan = {
    getAll: (filters = {}) => {
        let query = `
            SELECT p.*, u.name as creator_name
            FROM production_plans p
            LEFT JOIN users u ON p.created_by = u.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.search) {
            query += ` AND (p.article_name LIKE ? OR p.fabric_code LIKE ? OR p.plan_id LIKE ?)`;
            const s = `%${filters.search}%`;
            params.push(s, s, s);
        }

        if (filters.planType) {
            query += ` AND p.plan_type = ?`;
            params.push(filters.planType);
        }

        if (filters.startDate) {
            query += ` AND DATE(p.created_at) >= ?`;
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += ` AND DATE(p.created_at) <= ?`;
            params.push(filters.endDate);
        }

        query += ` ORDER BY p.id DESC`;

        if (filters.limit) {
            query += ` LIMIT ?`;
            params.push(parseInt(filters.limit, 10));
        }

        return db.prepare(query).all(...params);
    },

    findById: (id) => {
        return db.prepare(`
            SELECT p.*, u.name as creator_name, u.email as creator_email
            FROM production_plans p
            LEFT JOIN users u ON p.created_by = u.id
            WHERE p.id = ? OR p.plan_id = ?
        `).get(id, id);
    },

    create: (data) => {
        const stmt = db.prepare(`
            INSERT INTO production_plans (
                plan_id, plan_type, article_name, fabric_code, width, epi, ppi,
                warp_count, warp_count_system, warp_rate, warp_crimp, warp_wastage,
                weft_count, weft_count_system, weft_rate, weft_crimp, weft_wastage,
                budget_pkr, available_yarn_kg, available_warp_kg, available_weft_kg,
                target_fabric_meters, theoretical_fabric_meters, expected_fabric_meters, expected_usable_meters,
                consumed_warp_kg, consumed_weft_kg, remaining_warp_kg, remaining_weft_kg, total_remaining_kg,
                yarn_utilization_pct, production_efficiency_pct, limiting_yarn_type,
                notes, created_by, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
        `);

        const info = stmt.run(
            data.plan_id,
            data.plan_type || 'yarn_to_fabric',
            data.article_name,
            data.fabric_code || null,
            data.width,
            data.epi,
            data.ppi,
            data.warp_count,
            data.warp_count_system || 'Ne',
            data.warp_rate,
            data.warp_crimp || 5.0,
            data.warp_wastage || 2.0,
            data.weft_count,
            data.weft_count_system || 'Ne',
            data.weft_rate,
            data.weft_crimp || 5.0,
            data.weft_wastage || 2.0,
            data.budget_pkr || 0,
            data.available_yarn_kg || 0,
            data.available_warp_kg || 0,
            data.available_weft_kg || 0,
            data.target_fabric_meters || 0,
            data.theoretical_fabric_meters || 0,
            data.expected_fabric_meters || 0,
            data.expected_usable_meters || 0,
            data.consumed_warp_kg || 0,
            data.consumed_weft_kg || 0,
            data.remaining_warp_kg || 0,
            data.remaining_weft_kg || 0,
            data.total_remaining_kg || 0,
            data.yarn_utilization_pct || 100,
            data.production_efficiency_pct || 100,
            data.limiting_yarn_type || 'balanced',
            data.notes || null,
            data.created_by || null
        );

        return ProductionPlan.findById(info.lastInsertRowid);
    },

    delete: (id) => {
        return db.prepare(`DELETE FROM production_plans WHERE id = ?`).run(id);
    },

    getSummaryStats: () => {
        return db.prepare(`
            SELECT 
                COUNT(*) as total_plans,
                COALESCE(SUM(available_yarn_kg), 0) as total_yarn_planned_kg,
                COALESCE(SUM(expected_usable_meters), 0) as total_expected_fabric_meters,
                COALESCE(AVG(yarn_utilization_pct), 0) as avg_yarn_utilization,
                COALESCE(AVG(production_efficiency_pct), 0) as avg_production_efficiency
            FROM production_plans
        `).get();
    }
};

module.exports = ProductionPlan;
