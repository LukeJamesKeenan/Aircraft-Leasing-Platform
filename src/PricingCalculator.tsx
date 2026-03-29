import { useState } from "react";
import { useAppContext } from "./AppContext";
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

interface PricingCalculatorProps {
    onAddToPortfolio?: (aircraftType: string, registration: string, lessee: string, monthlyRent: number, tenorYears: number) => void;
    onTransactionLogged?: () => void;
}
export default function PricingCalculator ({ onAddToPortfolio, onTransactionLogged }: PricingCalculatorProps) {
    const { addTransaction } = useAppContext();
    const [inputs, setInputs] = useState<PricingInputs>(defaultInputs);
    const [outputs, setOutputs] = useState<PricingOutputs | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [registration, setRegistration] = useState("");
    const [lessee, setLessee] = useState("");

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
        <div>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
                Aircraft Lease Pricing Calculator
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "24px" }}>
                Pricing engine based on age-adjusted residual value model
            </p>

            <div className="pricing-layout">
                <div className="pricing-form-card">
                    <div className="pricing-title">Deal Parameters</div>

                    <div className="form-field">
                        <label className="form-label">Aircraft Type</label>
                        <select className="form-input" value={inputs.aircraftType}
                        onChange={e => handleChange("aircraftType", e.target.value)}>
                            {aircraftTypes.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>

                    <div className="form-field">
                        <label className="form-label">Current Aircraft Value (€)</label>
                        <input className="form-input" type="number" value={inputs.currentValue}
                        onChange={e => handleChange("currentValue", e.target.value)} />
                    </div>

                    <div className="form-field">
                        <label className="form-label">Aircraft Age (Years)</label>
                        <input className="form-input" type="number" value={inputs.aircraftAge}
                        onChange={e => handleChange("aircraftAge", e.target.value)} />
                    </div>

                    <div className="form-field">
                        <label className="form-label">Lease Tenor (Years)</label>
                        <input className="form-input" type="number" value={inputs.leaseTenorYears}
                        onChange={e => handleChange("leaseTenorYears", e.target.value)} />
                    </div>

                    <div className="form=field">
                        <label className="form-label">Annual Funding Cost (e.g. 0.055 for 5.5%)</label>
                        <input className="form-input" type="number" step="0.001" value={inputs.annualFundingCost}
                        onChange={e => handleChange("annualFundingCost", e.target.value)} />
                    </div>

                    <div className="form-field">
                        <label className="form-label">Target Return Spread (e.g. 0.01 for 1%)</label>
                        <input className="form-input" type="number" step="0.001" value={inputs.targetReturnSpread}
                        onChange={e => handleChange("targetReturnSpread", e.target.value)} />
                    </div>

                    <button className="calculate-btn" onClick={handleCalculate}>
                        Calculate Pricing
                    </button>
                </div>

                <div className="pricing-output-card">
                    <div className="pricing-title">Pricing Output</div>
                    
                    {outputs ? (
                        [
                            ["Residual Value at Lease End", formatCurrency(outputs.residualValue), false],
                            ["Monthly Rent", formatCurrency(outputs.monthlyRent), true],
                            ["lease Rate Factor (LRF)", formatPercent(outputs.lrf), true],
                            ["Total Rent Collected", formatCurrency(outputs.totalRentCollected), false],
                            ["Implied Return", formatCurrency(outputs.impliedReturn), false],
                            ["Implied IRR (Annual)", formatPercent(outputs.irr), false],
                        ].map(([label, value, highlight]) => (
                            <div className="output-row" key={label as string}>
                                <span className="output-label">{label}</span>
                                <span className={`output-value ${highlight ? "highlight" : ""}`}>{value}</span>
                            </div>
                        ))
                    ) : (
                        <div className="output-placeholder">
                            Enter deal parameters and click <strong style={{ color: "var(--accent-bright)" }}>Calculate Pricing</strong> to generate outputs
                        </div>
                    )}
                    {outputs && onAddToPortfolio && (
                        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                            {!showAddForm ? (
                                <button className="calculate-btn" onClick={() => setShowAddForm(true)}>
                                    + Add to Portfolio
                                </button>
                            ) : (
                                <div>
                                    <div className="pricing-title">Add to Portfolio</div>
                                    <div className="form-field">
                                        <label className="form-label">Aircraft Registration</label>
                                        <input className="form-input" type="text" placeholder="e.g. EI-XYZ"
                                        value={registration} onChange={e => setRegistration(e.target.value)} />
                                        </div>
                                        <div className="form-field">
                                            <label className="form-label">Lessee</label>
                                            <input className="form-input" type="text" placeholder="e.g. Ryanair"
                                            value={lessee} onChange={e => setLessee(e.target.value)} />
                                        </div>
                                        <button className="calculate-btn" onClick={() => {
                                            if (registration && lessee && outputs) {
                                                onAddToPortfolio(
                                                    inputs.aircraftType,
                                                    registration,
                                                    lessee,
                                                    Math.round(outputs.monthlyRent),
                                                    inputs.leaseTenorYears
                                                );
                                                addTransaction({
                                                    date: new Date().toISOString().slice(0, 7),
                                                    aircraftType: inputs.aircraftType,
                                                    aircraftAge: inputs.aircraftAge,
                                                    lessee,
                                                    lesseeRegion: "Western Europe",
                                                    tenorYears: inputs.leaseTenorYears,
                                                    monthlyRent: Math.round(outputs.monthlyRent),
                                                    lrf: outputs.lrf,
                                                    notes: "Logged from Pricing Calculator",
                                                });

                                                if (onTransactionLogged) onTransactionLogged();

                                                setShowAddForm(false);
                                                setRegistration("");
                                                setLessee("");
                                            }
                                        }}>
                                            Confirm - Add to Portfolio
                                        </button>
                                    </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}