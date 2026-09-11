const db = require('../config/database');

const Fabric = {
    getAll: () => {
        return db.prepare(`
            SELECT f.*, 
                   wy.yarn_count AS warp_yarn_name, wy.count_value AS warp_count_val, wy.yarn_rate AS warp_rate_val,
                   fy.yarn_count AS weft_yarn_name, fy.count_value AS weft_count_val, fy.yarn_rate AS weft_rate_val
            FROM fabrics f
            LEFT JOIN yarns wy ON f.warp_yarn_id = wy.id
            LEFT JOIN yarns fy ON f.weft_yarn_id = fy.id
            ORDER BY f.id DESC
        `).all();
    },
    findById: (id) => {
        return db.prepare(`
            SELECT f.*, 
                   wy.yarn_count AS warp_yarn_name, wy.count_value AS warp_count_val, wy.yarn_rate AS warp_rate_val,
                   fy.yarn_count AS weft_yarn_name, fy.count_value AS weft_count_val, fy.yarn_rate AS weft_rate_val
            FROM fabrics f
            LEFT JOIN yarns wy ON f.warp_yarn_id = wy.id
            LEFT JOIN yarns fy ON f.weft_yarn_id = fy.id
            WHERE f.id = ?
        `).get(id);
    },
    create: (data) => {
        const stmt = db.prepare(`
            INSERT INTO fabrics (article_name, fabric_code, width, epi, ppi, warp_yarn_id, weft_yarn_id, standard_wastage, sizing_charges, weaving_charges, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, COALESCE(?, 4.0), COALESCE(?, 0.0), COALESCE(?, 0.0), COALESCE(?, 'active'), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);
        const result = stmt.run(
            data.article_name,
            data.fabric_code,
            data.width,
            data.epi,
            data.ppi,
            data.warp_yarn_id || null,
            data.weft_yarn_id || null,
            data.standard_wastage,
            data.sizing_charges,
            data.weaving_charges,
            data.status
        );
        return Fabric.findById(result.lastInsertRowid);
    },
    update: (id, data) => {
        const stmt = db.prepare(`
            UPDATE fabrics
            SET article_name = COALESCE(?, article_name),
                fabric_code = COALESCE(?, fabric_code),
                width = COALESCE(?, width),
                epi = COALESCE(?, epi),
                ppi = COALESCE(?, ppi),
                warp_yarn_id = COALESCE(?, warp_yarn_id),
                weft_yarn_id = COALESCE(?, weft_yarn_id),
                standard_wastage = COALESCE(?, standard_wastage),
                sizing_charges = COALESCE(?, sizing_charges),
                weaving_charges = COALESCE(?, weaving_charges),
                status = COALESCE(?, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        stmt.run(
            data.article_name,
            data.fabric_code,
            data.width,
            data.epi,
            data.ppi,
            data.warp_yarn_id,
            data.weft_yarn_id,
            data.standard_wastage,
            data.sizing_charges,
            data.weaving_charges,
            data.status,
            id
        );
        return Fabric.findById(id);
    },
    delete: (id) => {
        return db.prepare('DELETE FROM fabrics WHERE id = ?').run(id);
    }
};

module.exports = Fabric;
