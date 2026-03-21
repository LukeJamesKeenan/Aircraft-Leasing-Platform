import { useState } from "react";
import { calculatePricing } from "./Core/engine/PricingEngine";
import type { PricingInputs, PricingOutputs } from "./Core/engine/PricingEngine";

const aircraftTypes = ["A320ceo", "A321ceo", "B737-800", "A320neo", "A321neo", "ATR 72-600", "Embraer E190", "Embraer E195", "Bombardier Q400"];

const defaultInputs: PricingInputs = {
    aircraftType: "A320ceo",
    currentValue: 28000000,
    aircraftAge: 8,
    leaseTenorYears: 10,
    annualFundingCost: 0.055,
    targetReturnSpread: 0.01,
};

export default function PricingCalculator () {
    const [inputs, setInputs] = useState<PricingInputs>(defaultInputs);
    const [outputs, setOutputs] = useState<PricingOutputs | null>(null);

    function handleChange(field: keyof PricingInputs, value: string) {
        setInputs((prev) => ({
            ...prev,
            [field]: field === "aircraftType" ? value : parseFloat(value),
        }));
    }

    function handleCalculate() {
        const result = calculatePricing(inputs);
        setOutputs(result);
    }

    function formatCurrency(value: number): string {
        return new Intl.NumberFormat("en-IE", {
            style: "currency",
            currency: "EUR",
            maximumFractionDigits: 0,
        }).format(value);
    }

    function formatPercent(value: number): string {
        return (value * 100).toFixed(3) + "%";
    }

    return (
        <div style={{ padding: "24px", maxWidth: "600px" }}>
            <h2> Aircraft Lease Pricing Calculator</h2>
            <p style={{ color: "#666", fontSize: "14px" }}>
                Pricing engine based on age-adjusted residual value model
            </p>

            <div style={{ display: "grid", gap: "12px", marginTop: "20px" }}>

                <label> Aircraft Type
                    <select value={inputs.aircraftType} onChange={e => handleChange("aircraftType", e.target.value)}
                    style={{ display: "block", width: "100%", padding: "8px", marginTop: "4px", fontSize: "16px" }}>
                        {aircraftTypes.map(t => <option key={t}>{t}</option>)}
                    </select>
                </label>

                <label> Current Aircraft Value (€)
                    <input type="number" value={inputs.currentValue}
                    onChange={e => handleChange("currentValue", e.target.value)}
                    style={{ display: "block", width: "100%", padding: "8px", marginTop: "4px" }} />
                </label>

                <label> Aircraft Age (Years) 
                    <input type="number" value={inputs.aircraftAge}
                    onChange={e => handleChange("aircraftAge", e.target.value)}
                    style={{ display: "block", width: "100%", padding: "8px", marginTop: "4px" }} />
                </label>

                <label>Lease Tenor (Years) 
                    <input type="number" value={inputs.leaseTenorYears}
                    onChange={e => handleChange("leaseTenorYears", e.target.value)}
                    style={{ display: "block", width: "100%", padding: "8px", marginTop: "4px" }} />
                </label>

                <label>Annual Funding Cost (e.g. 0.055 for 5.5%)
                    <input type="number" step="0.001" value={inputs.annualFundingCost}
                    onChange={e => handleChange("annualFundingCost", e.target.value)}
                    style={{ display: "block", width: "100%", padding: "8px", marginTop: "4px" }} />
                </label>

                <label>Target return Spread (e.g. 0.01 for 1%)
                    <input type="number" step="0.001" value={inputs.targetReturnSpread}
                    onChange={e => handleChange("targetReturnSpread", e.target.value)}
                    style={{ display: "block", width: "100%", padding: "8px", marginTop: "4px" }} />
                </label>

                <button onClick={handleCalculate}
                style={{ padding: "12px", backgroundColor: "#1a56db", color: "white",
                    border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "16px"}}>
                        Calculate Pricing
                    </button>
            </div>

            {outputs && (
                <div style={{ marginTop: "32px", padding: "20px", backgroundColor: "#f8f9fa",
                    borderRadius: "8px", border: "1px solid #e0e0e0" }}>
                    <h3 style={{ marginTop: 0}}>Pricing Output</h3>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <tbody>
                            {[
                                ["Residual Value at Lease End", formatCurrency(outputs.residualValue)],
                                ["Monthly Rent", formatCurrency(outputs.monthlyRent)],
                                ["Lease Rate Factor (LRF)", formatPercent(outputs.lrf)],
                                ["Total Rent Collected", formatCurrency(outputs.totalRentCollected)],
                                ["Implied Return", formatCurrency(outputs.impliedReturn)],
                                ["Implied IRR (Annual)", formatPercent(outputs.irr)],
                            ].map (([label, value]) => (
                                <tr key={label} style={{ borderBottom: "1px solid #e0e0e0"}}>
                                    <td style={{ padding: "10px 0", color: "#444" }}>{label}</td>
                                    <td style={{ padding: "10px 0", fontWeight: "bold", textAlign: "right" }}>{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}