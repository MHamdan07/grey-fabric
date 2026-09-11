const http = require('http');

function postJson(path, data, token = null) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify(data);
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload),
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        }, (res) => {
            const chunks = [];
            res.on('data', chunk => chunks.push(chunk));
            res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: buffer
                });
            });
        });
        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

function getJson(path, token = null) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path,
            method: 'GET',
            headers: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers,
                    body: data ? JSON.parse(data) : null
                });
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function runTests() {
    console.log('--- Starting Enterprise Export System Tests ---');
    let passed = 0;
    let failed = 0;

    function assert(cond, name) {
        if (cond) {
            console.log(`✓ PASS: ${name}`);
            passed++;
        } else {
            console.error(`✗ FAIL: ${name}`);
            failed++;
        }
    }

    try {
        // 1. Admin Login
        const loginRes = await postJson('/api/auth/login', {
            email: 'admin@greycost.com',
            password: 'admin123'
        });
        const loginBody = JSON.parse(loginRes.body.toString());
        assert(loginRes.statusCode === 200 && loginBody.token, 'Admin login successful and token received');
        const adminToken = loginBody.token;

        // 2. Export Costings Excel
        const costExcelRes = await postJson('/api/exports/costings/excel', {}, adminToken);
        assert(costExcelRes.statusCode === 200, 'Costings Excel export returns 200 OK');
        assert(costExcelRes.headers['content-type'].includes('spreadsheetml'), 'Costings Excel content-type is spreadsheetml');
        assert(costExcelRes.body.length > 5000, `Costings Excel file received (${costExcelRes.body.length} bytes)`);

        // 3. Export Costings CSV
        const costCsvRes = await postJson('/api/exports/costings/csv', {}, adminToken);
        assert(costCsvRes.statusCode === 200, 'Costings CSV export returns 200 OK');
        assert(costCsvRes.headers['content-type'].includes('text/csv'), 'Costings CSV content-type is text/csv');
        assert(costCsvRes.body.toString().includes('Costing ID'), 'Costings CSV contains headers');

        // 4. Export Production Excel
        const prodExcelRes = await postJson('/api/exports/production/excel', {}, adminToken);
        assert(prodExcelRes.statusCode === 200, 'Production Excel export returns 200 OK');

        // 5. Export Yarn Master Excel
        const yarnExcelRes = await postJson('/api/exports/yarns/excel', {}, adminToken);
        assert(yarnExcelRes.statusCode === 200, 'Yarn Master Excel export returns 200 OK');

        // 6. Export Fabric Master Excel
        const fabricExcelRes = await postJson('/api/exports/fabrics/excel', {}, adminToken);
        assert(fabricExcelRes.statusCode === 200, 'Fabric Master Excel export returns 200 OK');

        // 7. Export Charges Excel
        const chargesExcelRes = await postJson('/api/exports/charges/excel', {}, adminToken);
        assert(chargesExcelRes.statusCode === 200, 'Charges Excel export returns 200 OK');

        // 8. Export Users Excel (Admin Only, No Passwords)
        const userExcelRes = await postJson('/api/exports/users/excel', {}, adminToken);
        assert(userExcelRes.statusCode === 200, 'Users Excel export returns 200 OK');
        const userExcelStr = userExcelRes.body.toString('latin1');
        assert(!userExcelStr.includes('password_hash') && !userExcelStr.includes('super_secret'), 'Users Excel strictly excludes password hashes or secrets');

        // 9. Filtered Costing Export (Respects search criteria)
        const filteredRes = await postJson('/api/exports/costings/excel', { search: 'Poplin' }, adminToken);
        assert(filteredRes.statusCode === 200, 'Filtered costing export returns 200 OK');

        // 10. Empty Search Result returns 404 with descriptive message
        const emptyRes = await postJson('/api/exports/costings/excel', { search: 'NON_EXISTENT_FABRIC_XYZ_123' }, adminToken);
        const emptyBody = JSON.parse(emptyRes.body.toString());
        assert(emptyRes.statusCode === 404 && emptyBody.message.includes('No records found'), 'Empty filter returns 404 descriptive message');

        // 11. RBAC Permission Test (Staff without permission denied with 403)
        // Create staff user without COSTING_EXPORT
        const testEmail = `staff_noperms_${Date.now()}@greycost.com`;
        const createStaffRes = await postJson('/api/users', {
            name: 'Restricted Staff',
            email: testEmail,
            password: 'password123',
            role: 'staff',
            status: 'active',
            permissions: ['REPORT_VIEW'] // No COSTING_EXPORT!
        }, adminToken);
        assert(createStaffRes.statusCode === 201, 'Created test staff user without COSTING_EXPORT');

        const staffLoginRes = await postJson('/api/auth/login', {
            email: testEmail,
            password: 'password123'
        });
        const staffToken = JSON.parse(staffLoginRes.body.toString()).token;

        // Staff tries to call COSTING_EXPORT endpoint -> must return 403 Forbidden!
        const staffDeniedRes = await postJson('/api/exports/costings/excel', {}, staffToken);
        assert(staffDeniedRes.statusCode === 403, 'Staff without COSTING_EXPORT receives HTTP 403 Forbidden');

        // 12. Export Audit Logging
        const logsRes = await getJson('/api/exports/logs', adminToken);
        assert(logsRes.statusCode === 200 && logsRes.body.count > 0, `Export audit logs verified (${logsRes.body.count} logs recorded)`);

        console.log(`\nTests completed: ${passed} passed, ${failed} failed.`);
        if (failed > 0) process.exit(1);
    } catch (err) {
        console.error('Test runner error:', err);
        process.exit(1);
    }
}

runTests();
