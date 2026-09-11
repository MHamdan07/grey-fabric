const db = require('../config/database');

const Costing = {
    getAll: (filters = {}) => {
        let query = `
            SELECT c.*, u.name as creator_name
            FROM costings c
            LEFT JOIN users u ON c.created_by = u.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.search) {
            query += ` AND (c.article_name LIKE ? OR c.fabric_code LIKE ? OR c.costing_id LIKE ?)`;
            const s = `%${filters.search}%`;
            params.push(s, s, s);
        }

        if (filters.startDate) {
            query += ` AND DATE(c.created_at) >= ?`;
            params.push(filters.startDate);
        }

        if (filters.endDate) {
            query += ` AND DATE(c.created_at) <= ?`;
            params.push(filters.endDate);
        }

        if (filters.createdBy) {
            query += ` AND c.created_by = ?`;
            params.push(filters.createdBy);
        }

        query += ` ORDER BY c.id DESC`;

        if (filters.limit) {
            query += ` LIMIT ?`;
            params.push(parseInt(filters.limit, 10));
        }

        return db.prepare(query).all(...params);
    },
    findById: (id) => {
        return db.prepare(`
            SELECT c.*, u.name as creator_name, u.email as creator_email
            FROM costings c
            LEFT JOIN users u ON c.created_by = u.id
            WHERE c.id = ? OR c.costing_id = ?
        `).get(id, id);
    },
    create: (data) => {
        const stmt = db.prepare(`
            INSERT INTO costings (
                costing_id, fabric_id, article_name, fabric_code, width, epi, ppi,
                warp_count, warp_count_system, warp_rate, warp_crimp, warp_wastage,
                weft_count, weft_count_system, weft_rate, weft_crimp, weft_wastage,
                sizing_charges, sizing_charge_type, weaving_charges, weaving_charge_type, other_charges,
                warp_weight_kg, weft_weight_kg, total_weight_kg, gsm, glm,
                warp_cost, weft_cost, warp_wastage_cost, weft_wastage_cost,
                total_wastage_cost, grey_cost_per_meter, formula_version, assumptions_used, notes, created_by,
                created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            )
        `);

        const result = stmt.run(
            data.costing_id,
            data.fabric_id || null,
            data.article_name,
            data.fabric_code || '',
            data.width,
            data.epi,
            data.ppi,
            data.warp_count,
            data.warp_count_system || 'Ne',
            data.warp_rate,
            data.warp_crimp || 5.0,
            data.warp_wastage,
            data.weft_count,
            data.weft_count_system || 'Ne',
            data.weft_rate,
            data.weft_crimp || 5.0,
            data.weft_wastage,
            data.sizing_charges || 0,
            data.sizing_charge_type || 'per_meter',
            data.weaving_charges || 0,
            data.weaving_charge_type || 'per_meter',
            data.other_charges || 0,
            data.warp_weight_kg,
            data.weft_weight_kg,
            data.total_weight_kg,
            data.gsm,
            data.glm,
            data.warp_cost,
            data.weft_cost,
            data.warp_wastage_cost,
            data.weft_wastage_cost,
            data.total_wastage_cost,
            data.grey_cost_per_meter,
            data.formula_version || 'Standard Cotton v1.0',
            data.assumptions_used ? (typeof data.assumptions_used === 'string' ? data.assumptions_used : JSON.stringify(data.assumptions_used)) : null,
            data.notes || '',
            data.created_by || null
        );

        return Costing.findById(result.lastInsertRowid);
    },
    update: (id, data) => {
        const stmt = db.prepare(`
            UPDATE costings
            SET article_name = COALESCE(?, article_name),
                fabric_code = COALESCE(?, fabric_code),
                width = COALESCE(?, width),
                epi = COALESCE(?, epi),
                ppi = COALESCE(?, ppi),
                warp_count = COALESCE(?, warp_count),
                warp_count_system = COALESCE(?, warp_count_system),
                warp_rate = COALESCE(?, warp_rate),
                warp_crimp = COALESCE(?, warp_crimp),
                warp_wastage = COALESCE(?, warp_wastage),
                weft_count = COALESCE(?, weft_count),
                weft_count_system = COALESCE(?, weft_count_system),
                weft_rate = COALESCE(?, weft_rate),
                weft_crimp = COALESCE(?, weft_crimp),
                weft_wastage = COALESCE(?, weft_wastage),
                sizing_charges = COALESCE(?, sizing_charges),
                sizing_charge_type = COALESCE(?, sizing_charge_type),
                weaving_charges = COALESCE(?, weaving_charges),
                weaving_charge_type = COALESCE(?, weaving_charge_type),
                other_charges = COALESCE(?, other_charges),
                warp_weight_kg = COALESCE(?, warp_weight_kg),
                weft_weight_kg = COALESCE(?, weft_weight_kg),
                total_weight_kg = COALESCE(?, total_weight_kg),
                gsm = COALESCE(?, gsm),
                glm = COALESCE(?, glm),
                warp_cost = COALESCE(?, warp_cost),
                weft_cost = COALESCE(?, weft_cost),
                warp_wastage_cost = COALESCE(?, warp_wastage_cost),
                weft_wastage_cost = COALESCE(?, weft_wastage_cost),
                total_wastage_cost = COALESCE(?, total_wastage_cost),
                grey_cost_per_meter = COALESCE(?, grey_cost_per_meter),
                formula_version = COALESCE(?, formula_version),
                assumptions_used = COALESCE(?, assumptions_used),
                notes = COALESCE(?, notes),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);

        stmt.run(
            data.article_name,
            data.fabric_code,
            data.width,
            data.epi,
            data.ppi,
            data.warp_count,
            data.warp_count_system,
            data.warp_rate,
            data.warp_crimp,
            data.warp_wastage,
            data.weft_count,
            data.weft_count_system,
            data.weft_rate,
            data.weft_crimp,
            data.weft_wastage,
            data.sizing_charges,
            data.sizing_charge_type,
            data.weaving_charges,
            data.weaving_charge_type,
            data.other_charges,
            data.warp_weight_kg,
            data.weft_weight_kg,
            data.total_weight_kg,
            data.gsm,
            data.glm,
            data.warp_cost,
            data.weft_cost,
            data.warp_wastage_cost,
            data.weft_wastage_cost,
            data.total_wastage_cost,
            data.grey_cost_per_meter,
            data.formula_version,
            data.assumptions_used ? (typeof data.assumptions_used === 'string' ? data.assumptions_used : JSON.stringify(data.assumptions_used)) : null,
            data.notes,
            id
        );

        return Costing.findById(id);
    },
    delete: (id) => {
        return db.prepare('DELETE FROM costings WHERE id = ?').run(id);
    },
    getKpis: () => {
        const totalCostings = db.prepare('SELECT COUNT(*) as count FROM costings').get().count;
        const todayCostings = db.prepare(`SELECT COUNT(*) as count FROM costings WHERE DATE(created_at) = DATE('now')`).get().count;
        const totalFabrics = db.prepare("SELECT COUNT(*) as count FROM fabrics WHERE status = 'active'").get().count;
        const yarnUpdates = db.prepare("SELECT COUNT(*) as count FROM yarns WHERE status = 'active'").get().count;
        
        const avgRow = db.prepare('SELECT AVG(grey_cost_per_meter) as avg_cost FROM costings').get();
        const avgGreyCost = avgRow && avgRow.avg_cost ? Number(avgRow.avg_cost.toFixed(2)) : 0;

        return {
            totalCostings,
            todayCostings,
            totalFabrics,
            yarnUpdates,
            avgGreyCost
        };
    },
    getTrend: (days = 30) => {
        const stmt = db.prepare(`
            SELECT 
                DATE(created_at) as date,
                AVG(grey_cost_per_meter) as avg_cost,
                COUNT(*) as count
            FROM costings
            WHERE created_at >= DATE('now', '-' || ? || ' days')
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);
        return stmt.all(days);
    }
};

module.exports = Costing;
