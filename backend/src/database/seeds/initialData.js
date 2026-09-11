const bcrypt = require('bcryptjs');
const db = require('../../config/database');
const { calculateGreyFabricCost } = require('../../services/calculationService');

async function seedDatabase() {
    console.log('Seeding initial database data...');

    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('admin123', salt);
    const staffHash = await bcrypt.hash('staff123', salt);

    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    if (userCount === 0) {
        db.prepare(`
            INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at)
            VALUES 
            ('Taylor Morgan', 'admin@greycost.com', ?, 'admin', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
            ('Alex Rivera', 'staff@greycost.com', ?, 'staff', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `).run(adminHash, staffHash);
        console.log('Default users created: admin@greycost.com / admin123, staff@greycost.com / staff123');
    }

    // 2. Seed Yarns
    const yarnCount = db.prepare('SELECT COUNT(*) as count FROM yarns').get().count;
    if (yarnCount === 0) {
        const insertYarn = db.prepare(`
            INSERT INTO yarns (yarn_count, count_value, yarn_type, yarn_rate, supplier_name, effective_date, status)
            VALUES (?, ?, ?, ?, ?, DATE('now'), 'active')
        `);

        insertYarn.run('40s Ne', 40.0, '100% Combed Compact Cotton', 1120.00, 'Indus Valley Spinning Mills');
        insertYarn.run('30s Ne', 30.0, '100% Carded Ring Spun', 980.00, 'Crescent Textile Spinners');
        insertYarn.run('20s Ne', 20.0, '100% Carded Cotton', 840.00, 'Al-Karam Spinning Co.');
        insertYarn.run('16s Ne', 16.0, 'Open End Rotor Cotton', 720.00, 'Nishat Open End Division');
        insertYarn.run('50s Ne', 50.0, 'Pima Long Staple Cotton', 1480.00, 'Sapphire Premium Fiber');
        insertYarn.run('20D/40s', 38.0, 'Core Spun Lycra Stretch Yarn', 1320.00, 'Kohinoor Stretch Specialty');
        console.log('Sample textile yarns seeded in PKR.');
    }

    // 3. Seed Charges
    const chargeCount = db.prepare('SELECT COUNT(*) as count FROM charges').get().count;
    if (chargeCount === 0) {
        const insertCharge = db.prepare(`
            INSERT INTO charges (charge_type, name, value, unit, status)
            VALUES (?, ?, ?, ?, 'active')
        `);

        insertCharge.run('sizing', 'Standard Warping & Sizing', 14.50, 'per_meter');
        insertCharge.run('weaving', 'Airjet High-Speed Weaving', 32.00, 'per_meter');
        insertCharge.run('weaving', 'Rapier Weaving (Heavy Twill)', 36.50, 'per_meter');
        insertCharge.run('inspection', 'Grey Inspection & 4-Point Grading', 4.50, 'per_meter');
        insertCharge.run('freight', 'Grey Folding, Baling & Local Transport', 3.00, 'per_meter');
        console.log('Sample manufacturing process charges seeded in PKR.');
    }

    // 4. Seed Fabrics
    const fabricCount = db.prepare('SELECT COUNT(*) as count FROM fabrics').get().count;
    if (fabricCount === 0) {
        const yarns = db.prepare('SELECT * FROM yarns').all();
        const y40 = yarns.find(y => y.count_value === 40) || yarns[0];
        const y30 = yarns.find(y => y.count_value === 30) || yarns[1];
        const y20 = yarns.find(y => y.count_value === 20) || yarns[2];

        const insertFabric = db.prepare(`
            INSERT INTO fabrics (article_name, fabric_code, width, epi, ppi, warp_yarn_id, weft_yarn_id, standard_wastage, sizing_charges, weaving_charges, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
        `);

        insertFabric.run('Poplin 40x40 133x72 63"', 'ART-POP-4040', 63.0, 133, 72, y40.id, y40.id, 4.0, 14.50, 32.00);
        insertFabric.run('Sheeting 30x30 68x68 63"', 'ART-SHT-3030', 63.0, 68, 68, y30.id, y30.id, 3.8, 12.50, 26.00);
        insertFabric.run('Twill 2/1 20x16 128x60 63"', 'ART-TWL-2016', 63.0, 128, 60, y20.id, yarns.find(y => y.count_value === 16)?.id || y20.id, 4.5, 16.00, 36.50);
        insertFabric.run('Cambric 50x50 144x80 58"', 'ART-CAM-5050', 58.0, 144, 80, yarns.find(y => y.count_value === 50)?.id || y40.id, yarns.find(y => y.count_value === 50)?.id || y40.id, 3.5, 15.00, 34.00);
        console.log('Sample master fabrics seeded in PKR.');
    }

    // 5. Seed Historical Costings with past dates
    const costingCount = db.prepare('SELECT COUNT(*) as count FROM costings').get().count;
    if (costingCount === 0) {
        const fabrics = db.prepare('SELECT * FROM fabrics').all();
        const adminUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@greycost.com');

        const samples = [
            {
                fabric: fabrics[0],
                name: 'Poplin Plain Weave 40x40',
                code: 'CST-2026-001',
                width: 63, epi: 133, ppi: 72,
                warp_count: 40, warp_rate: 1120, warp_wastage: 3.5,
                weft_count: 40, weft_rate: 1080, weft_wastage: 4.0,
                sizing: 14.50, weaving: 32.00, other: 5.50,
                daysAgo: 28
            },
            {
                fabric: fabrics[1],
                name: 'Standard Sheeting 30x30',
                code: 'CST-2026-002',
                width: 63, epi: 68, ppi: 68,
                warp_count: 30, warp_rate: 980, warp_wastage: 3.8,
                weft_count: 30, weft_rate: 960, weft_wastage: 4.2,
                sizing: 12.50, weaving: 26.00, other: 4.50,
                daysAgo: 24
            },
            {
                fabric: fabrics[2],
                name: 'Heavy Drill Twill 20x16',
                code: 'CST-2026-003',
                width: 63, epi: 128, ppi: 60,
                warp_count: 20, warp_rate: 840, warp_wastage: 4.5,
                weft_count: 16, weft_rate: 720, weft_wastage: 5.0,
                sizing: 16.00, weaving: 36.50, other: 6.00,
                daysAgo: 21
            },
            {
                fabric: fabrics[3],
                name: 'Fine Cambric 50x50 58"',
                code: 'CST-2026-004',
                width: 58, epi: 144, ppi: 80,
                warp_count: 50, warp_rate: 1480, warp_wastage: 3.2,
                weft_count: 50, weft_rate: 1450, weft_wastage: 3.8,
                sizing: 15.00, weaving: 34.00, other: 5.50,
                daysAgo: 16
            },
            {
                fabric: fabrics[0],
                name: 'Poplin 40x40 Export Quality',
                code: 'CST-2026-005',
                width: 63, epi: 133, ppi: 72,
                warp_count: 40, warp_rate: 1140, warp_wastage: 3.5,
                weft_count: 40, weft_rate: 1100, weft_wastage: 4.0,
                sizing: 14.50, weaving: 32.00, other: 5.50,
                daysAgo: 12
            },
            {
                fabric: fabrics[1],
                name: 'Hospital Bedding Sheeting',
                code: 'CST-2026-006',
                width: 63, epi: 68, ppi: 68,
                warp_count: 30, warp_rate: 990, warp_wastage: 3.8,
                weft_count: 30, weft_rate: 970, weft_wastage: 4.2,
                sizing: 12.50, weaving: 26.00, other: 4.50,
                daysAgo: 8
            },
            {
                fabric: fabrics[0],
                name: 'Pocketing Fabric 40x40 100x80',
                code: 'CST-2026-007',
                width: 60, epi: 100, ppi: 80,
                warp_count: 40, warp_rate: 1080, warp_wastage: 3.5,
                weft_count: 40, weft_rate: 1050, weft_wastage: 4.0,
                sizing: 13.50, weaving: 28.00, other: 5.00,
                daysAgo: 4
            },
            {
                fabric: fabrics[0],
                name: 'High Density Poplin 133x72 Fresh',
                code: 'CST-2026-008',
                width: 63, epi: 133, ppi: 72,
                warp_count: 40, warp_rate: 1150, warp_wastage: 3.5,
                weft_count: 40, weft_rate: 1120, weft_wastage: 4.0,
                sizing: 14.50, weaving: 32.00, other: 5.50,
                daysAgo: 0
            }
        ];

        const insertCosting = db.prepare(`
            INSERT INTO costings (
                costing_id, fabric_id, article_name, fabric_code, width, epi, ppi,
                warp_count, warp_rate, warp_wastage,
                weft_count, weft_rate, weft_wastage,
                sizing_charges, weaving_charges, other_charges,
                warp_weight_kg, weft_weight_kg, total_weight_kg, gsm, glm,
                warp_cost, weft_cost, warp_wastage_cost, weft_wastage_cost,
                total_wastage_cost, grey_cost_per_meter, notes, created_by,
                created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?, ?, ?,
                ?, ?, ?, ?,
                ?, ?, ?, ?,
                DATETIME('now', '-' || ? || ' days'), DATETIME('now', '-' || ? || ' days')
            )
        `);

        for (const s of samples) {
            const calc = calculateGreyFabricCost({
                width: s.width,
                epi: s.epi,
                ppi: s.ppi,
                warp_count: s.warp_count,
                warp_rate: s.warp_rate,
                warp_wastage: s.warp_wastage,
                weft_count: s.weft_count,
                weft_rate: s.weft_rate,
                weft_wastage: s.weft_wastage,
                sizing_charges: s.sizing,
                weaving_charges: s.weaving,
                other_charges: s.other
            });

            insertCosting.run(
                s.code,
                s.fabric?.id || null,
                s.name,
                s.fabric?.fabric_code || s.code,
                s.width, s.epi, s.ppi,
                s.warp_count, s.warp_rate, s.warp_wastage,
                s.weft_count, s.weft_rate, s.weft_wastage,
                s.sizing, s.weaving, s.other,
                calc.weights.warp_weight_kg,
                calc.weights.weft_weight_kg,
                calc.weights.total_weight_kg,
                calc.weights.gsm,
                calc.weights.glm,
                calc.costs.warp_cost,
                calc.costs.weft_cost,
                calc.costs.warp_wastage_cost,
                calc.costs.weft_wastage_cost,
                calc.costs.total_wastage_cost,
                calc.costs.grey_cost_per_meter,
                'Standard bulk production estimation',
                adminUser.id,
                s.daysAgo,
                s.daysAgo
            );
        }
        console.log('Sample historical costings seeded.');
    }

    console.log('Seeding finished successfully.');
}

if (require.main === module) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Seed error:', err);
            process.exit(1);
        });
}

module.exports = seedDatabase;
