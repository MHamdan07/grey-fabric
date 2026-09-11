/**
 * Comprehensive Unit Test Suite for Textile Calculation Engine
 */

const assert = require('assert');
const {
    calculateCosting,
    planYarnToFabric,
    planFabricToYarn,
    normalizeToNe,
    CONSTANTS
} = require('../src/services/calculation/calculationEngine');

console.log('------------------------------------------------------------');
console.log('RUNNING TEXTILE CALCULATION ENGINE TEST SUITE');
console.log('------------------------------------------------------------');

// 1. Test Count System Normalization
console.log('\n[1/7] Testing Yarn Count Normalization (Ne, Nm, Tex, Denier)...');
const neVal = normalizeToNe(40, 'Ne');
assert.strictEqual(neVal.equivalentNe, 40);
assert.strictEqual(neVal.tex, 14.764);

const nmVal = normalizeToNe(67.734, 'Nm');
assert(Math.abs(nmVal.equivalentNe - 40) < 0.1, 'Nm conversion mismatch');

const texVal = normalizeToNe(14.764, 'Tex');
assert(Math.abs(texVal.equivalentNe - 40) < 0.1, 'Tex conversion mismatch');

const denVal = normalizeToNe(132.87, 'Denier');
assert(Math.abs(denVal.equivalentNe - 40) < 0.1, 'Denier conversion mismatch');
console.log('✓ Count normalization passed!');

// 2. Test User's Worked Example
console.log('\n[2/7] Testing User Specification Example (60" 60x60 40sx40s, 5% crimp, 2% wastage)...');
const exampleInput = {
    width: 60,
    epi: 60,
    ppi: 60,
    warp_count: 40,
    warp_count_system: 'Ne',
    warp_rate: 500,
    warp_crimp: 5.0,
    warp_wastage: 2.0,
    weft_count: 40,
    weft_count_system: 'Ne',
    weft_rate: 500,
    weft_crimp: 5.0,
    weft_wastage: 2.0,
    sizing_charges: 0.85,
    sizing_charge_type: 'per_meter',
    weaving_charges: 10.00,
    weaving_charge_type: 'per_meter',
    other_charges: 0
};

const costingResult = calculateCosting(exampleInput);

// Step 1: Theoretical consumption ≈ 0.0531 kg/m
console.log(`- Theoretical Warp kg/m: ${costingResult.audit_breakdown.warp.theoreticalConsumptionKgM} (Expected ~0.05315)`);
assert(Math.abs(costingResult.audit_breakdown.warp.theoreticalConsumptionKgM - 0.05315) < 0.0005);

// Step 2 & 3: Adjusted consumption ≈ 0.0569 kg/m
console.log(`- Adjusted Warp kg/m: ${costingResult.audit_breakdown.warp.adjustedConsumptionKgM} (Expected ~0.0569)`);
assert(Math.abs(costingResult.audit_breakdown.warp.adjustedConsumptionKgM - 0.05692) < 0.0005);

// Total yarn ≈ 0.1138 kg/m
console.log(`- Total Yarn kg/m: ${costingResult.audit_breakdown.summary.totalYarnConsumptionKgM} (Expected ~0.1138)`);
assert(Math.abs(costingResult.audit_breakdown.summary.totalYarnConsumptionKgM - 0.11385) < 0.001);

// Costs: Warp Rs. 28.46, Weft Rs. 28.46, Sizing Rs. 0.85, Weaving Rs. 10.00 -> Total Rs. 67.77
console.log(`- Grey Fabric Cost / Meter: Rs. ${costingResult.costs.grey_cost_per_meter}`);
assert(costingResult.costs.grey_cost_per_meter > 67 && costingResult.costs.grey_cost_per_meter < 68);
console.log('✓ Worked example verified successfully!');

// 3. Test The Rs. 10 Lakh Yarn Budget Question
console.log('\n[3/7] Testing Rs. 10 Lakh Yarn-to-Fabric Planning...');
const budgetPlan = planYarnToFabric({
    budgetPKR: 1000000,
    adjustedWarpKgM: costingResult.audit_breakdown.warp.adjustedConsumptionKgM,
    adjustedWeftKgM: costingResult.audit_breakdown.weft.adjustedConsumptionKgM,
    warpRate: 500,
    weftRate: 500,
    processLosses: { sizingLossPct: 0, weavingLossPct: 0, rejectPct: 0 } // Theoretical comparison
});

console.log(`- Budget: Rs. ${budgetPlan.input.budgetPKR}`);
console.log(`- Available Yarn: ${budgetPlan.input.totalAvailableYarnKg} kg (Expected 2,000 kg)`);
assert.strictEqual(budgetPlan.input.totalAvailableYarnKg, 2000);

console.log(`- Theoretical Fabric Meters: ${budgetPlan.production_output.theoreticalFabricMeters} m (Expected ~17,567-17,575 m)`);
assert(Math.abs(budgetPlan.production_output.theoreticalFabricMeters - 17567) < 30);
console.log('✓ Rs. 10 Lakh planning verified successfully!');

// 4. Test Warp vs. Weft Production Imbalance Constraint
console.log('\n[4/7] Testing Imbalanced Yarn Stock (1,000 kg Warp vs 1,100 kg Weft)...');
const imbalancedPlan = planYarnToFabric({
    availableWarpKg: 1000,
    availableWeftKg: 1100,
    adjustedWarpKgM: costingResult.audit_breakdown.warp.adjustedConsumptionKgM,
    adjustedWeftKgM: costingResult.audit_breakdown.weft.adjustedConsumptionKgM,
    warpRate: 500,
    weftRate: 500
});

console.log(`- Warp Capacity: ${imbalancedPlan.supported_capacity.warpSupportedMeters} m`);
console.log(`- Weft Capacity: ${imbalancedPlan.supported_capacity.weftSupportedMeters} m`);
console.log(`- Limiting Type: ${imbalancedPlan.supported_capacity.limitingYarnType}`);
assert.strictEqual(imbalancedPlan.supported_capacity.limitingYarnType, 'warp');
assert(imbalancedPlan.production_output.theoreticalFabricMeters <= imbalancedPlan.supported_capacity.warpSupportedMeters);

console.log(`- Remaining Weft Yarn: ${imbalancedPlan.yarn_balance.remainingWeftKg} kg (Expected ~100 kg buffer)`);
assert(Math.abs(imbalancedPlan.yarn_balance.remainingWeftKg - 100) < 5);
assert.strictEqual(imbalancedPlan.yarn_balance.remainingWarpKg, 0);
console.log('✓ Imbalance bottleneck logic verified!');

// 5. Test Reverse Calculator: Fabric -> Yarn
console.log('\n[5/7] Testing Reverse Calculator (Target 20,000 meters fabric)...');
const reversePlan = planFabricToYarn({
    targetFabricMeters: 20000,
    adjustedWarpKgM: costingResult.audit_breakdown.warp.adjustedConsumptionKgM,
    adjustedWeftKgM: costingResult.audit_breakdown.weft.adjustedConsumptionKgM,
    warpRate: 500,
    weftRate: 500,
    processLosses: { sizingLossPct: 0, weavingLossPct: 0, rejectPct: 0 }
});

console.log(`- Net Warp Required: ${reversePlan.net_yarn.warpKg} kg (Expected ~1,138 kg)`);
assert(Math.abs(reversePlan.net_yarn.warpKg - 1138.4) < 2);

console.log(`- Total Net Yarn: ${reversePlan.net_yarn.totalKg} kg (Expected ~2,276.8 kg)`);
assert(Math.abs(reversePlan.net_yarn.totalKg - 2276.8) < 4);

console.log(`- Total Estimated Yarn Cost: Rs. ${reversePlan.estimated_costs.totalYarnCost}`);
assert(Math.abs(reversePlan.estimated_costs.totalYarnCost - 1138400) < 2000);
console.log('✓ Reverse Fabric -> Yarn calculation verified!');

// 6. Test Sizing Charge Type: per_kg_warp
console.log('\n[6/7] Testing Sizing Charge Type (per_kg_warp)...');
const sizingKgInput = {
    ...exampleInput,
    sizing_charges: 15,
    sizing_charge_type: 'per_kg_warp' // 0.0569 kg/m * 15 = Rs. 0.85/m
};
const sizingKgResult = calculateCosting(sizingKgInput);
console.log(`- Sizing Cost: Rs. ${sizingKgResult.costs.sizing_charges}/m (Expected ~0.85/m)`);
assert(Math.abs(sizingKgResult.costs.sizing_charges - 0.85) < 0.05);
console.log('✓ Sizing per_kg_warp verified!');

// 7. Test Weaving Charge Type: per_kg
console.log('\n[7/7] Testing Weaving Charge Type (per_kg total yarn)...');
const weavingKgInput = {
    ...exampleInput,
    weaving_charges: 88,
    weaving_charge_type: 'per_kg' // 0.1138 kg/m * 88 = Rs. 10.01/m
};
const weavingKgResult = calculateCosting(weavingKgInput);
console.log(`- Weaving Cost: Rs. ${weavingKgResult.costs.weaving_charges}/m (Expected ~10.01/m)`);
assert(Math.abs(weavingKgResult.costs.weaving_charges - 10.01) < 0.1);
console.log('✓ Weaving per_kg verified!');

console.log('\n============================================================');
console.log('ALL 7 TEXTILE CALCULATION ENGINE TESTS PASSED WITH 100% SUCCESS!');
console.log('============================================================');
