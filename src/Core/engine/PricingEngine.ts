// Aircraft Lease Pricing Engine
// Mirrors logic from Aircraft_Leasing_Pricing_Model_v1.xlsx

export interface PricingInputs {
    aircraftType: string;
    currentValue: number;
    aircraftAge: number;
    leaseTenorYears: number;
    annualFundingCost: number;
    targetReturnSpread: number;
}

export interface PricingOutputs {
    residualValue: number;
    monthlyRent: number;
    lrf: number;
    totalRentCollected: number;
    impliedReturn: number;
    irr: number;
}

// Depreciation assumptions by aircraft type
const depreciationRates: Record<string, { newBuildValue: number; annualDepRate: number; residualFloor: number }> = {
    "A320ceo": {newBuildValue: 50000000, annualDepRate: 0.045, residualFloor: 0.15 },
    "A321ceo": {newBuildValue: 58000000, annualDepRate: 0.0425, residualFloor: 0.15},
    "B737-800": {newBuildValue: 48000000, annualDepRate: 0.0475, residualFloor: 0.15},
    "A320neo": {newBuildValue: 70000000, annualDepRate: 0.035, residualFloor: 0.15},
    "A321neo": {newBuildValue: 78000000, annualDepRate: 0.033, residualFloor: 0.15},
    "ATR 72-600": {newBuildValue: 28000000, annualDepRate: 0.055, residualFloor: 0.15},
    "Embraer E190": {newBuildValue: 32000000, annualDepRate: 0.050, residualFloor: 0.15},
    "Embraer E195": {newBuildValue: 36000000, annualDepRate: 0.050, residualFloor: 0.15},
    "Bombardier Q400": {newBuildValue: 26000000, annualDepRate: 0.0575, residualFloor: 0.15},
};

// Calculate age-adjusted residual value
function calculateResidualValue(
    inputs: PricingInputs,
    assumptions: {newBuildValue: number; annualDepRate: number; residualFloor: number }
): number {
    const ageAtLeaseEnd = inputs.aircraftAge + inputs.leaseTenorYears;
    const depreciatedValue = assumptions.newBuildValue * Math.pow(1 -assumptions.annualDepRate, ageAtLeaseEnd);
    const floorValue = assumptions.newBuildValue * assumptions.residualFloor;
    return Math.max(depreciatedValue, floorValue);
}

// PMT function mirroring Excel PMT
function pmt(rate: number, nper: number, pv: number, fv: number): number {
    if (rate === 0) return -(pv + fv) / nper;
    const pvif = Math.pow(1 + rate, nper);
    return (rate * (pv * pvif + fv)) / (pvif - 1);
}

// XIRR approximation using Newton-Raphson method
function calculateIRR(cashflows: number[]): number {
    let rate = 0.08 / 12;
    for (let i = 0; i < 1000; i++) {
        let npv = 0;
        let dnpv = 0;
        for (let t = 0; t< cashflows.length; t++) {
            npv += cashflows[t] / Math.pow(1 + rate, t);
            dnpv -= t * cashflows[t] / Math.pow(1 + rate, t + 1);
        }
        const newRate = rate - npv / dnpv;
        if (Math.abs(newRate - rate) < 1e-8) break;
        rate=newRate;
    }
    return Math.pow(1 + rate, 12) - 1;
}

// Main pricing function
export function calculatePricing(inputs: PricingInputs): PricingOutputs {
    const assumptions = depreciationRates[inputs.aircraftType];
    if (!assumptions) throw new Error(`Unknown aircraft type: ${inputs.aircraftType}`);

    const totalRequiredReturn = inputs.annualFundingCost + inputs.targetReturnSpread;
    const monthlyRate = totalRequiredReturn / 12;
    const tenorMonths = inputs.leaseTenorYears * 12;

    const residualValue = calculateResidualValue(inputs, assumptions);
    const monthlyRent = pmt(monthlyRate, tenorMonths, inputs.currentValue, -residualValue);
    const lrf = monthlyRent / inputs.currentValue;
    const totalRentCollected = monthlyRent * tenorMonths;
    const impliedReturn = totalRentCollected - (inputs.currentValue - residualValue);

    // Build cashflow array for IRR calculation
    const cashflows: number[] = [-inputs.currentValue];
    for (let m = 1; m < tenorMonths; m++) {
        cashflows.push(monthlyRent);
    }
    cashflows.push(monthlyRent + residualValue);

    const irr = calculateIRR(cashflows);

    return {
        residualValue,
        monthlyRent,
        lrf,
        totalRentCollected,
        impliedReturn,
        irr,   
    };
}

export type {PricingInputs, PricingOutputs };