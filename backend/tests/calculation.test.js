const { calculateGreyFabricCost, TEXTILE_CONSTANT } = require('../src/services/calculationService');

console.log('Testing Textile Calculation Engine...');

const sampleInput = {
    width: 63,
    epi: 133,
    ppi: 72,
    warp_count: 40,
    warp_rate: 340,
    warp_wastage: 3.5,
    weft_count: 40,
    weft_rate: 330,
    weft_wastage: 4.0,
    sizing_charges: 4.0,
    weaving_charges: 8.0,
    other_charges: 1.5
};

const result = calculateGreyFabricCost(sampleInput);

console.log('Calculated Result:', JSON.stringify(result, null, 2));

if (result.weights.total_ends === 8379 &&
    result.weights.gsm > 115 && result.weights.gsm < 135 &&
    result.costs.grey_cost_per_meter > 70) {
    console.log('Calculation Engine Unit Test PASSED!');
    process.exit(0);
} else {
    console.error('Calculation Engine Test FAILED values unexpected.');
    process.exit(1);
}
