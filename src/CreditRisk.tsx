import { useState, useEffect } from "react";
import { useAppContext } from "./AppContext";

interface CreditInputs {
    airlineName: string;
    revenueTrend: string;
    profitability: string;
    debtLevel: string;
    fleetSize: string;
    routeNetwork: string;
    countryRegion: string;
    repossessionEnv: string;
    airlineType: string;
    loadFactor: string;
    recentNews: string;
}

const defaultInputs: CreditInputs = {
    airlineName: "",
    revenueTrend: "",
    profitability: "",
    debtLevel: "",
    fleetSize: "",
    routeNetwork: "",
    countryRegion: "",
    repossessionEnv: "",
    airlineType: "",
    loadFactor: "",
    recentNews: "",
};

function scoreValue(field: string, value: string): number {
    const scores: Record<string, Record<string, number>> = {
        revenueTrend: { "Growing": 100, "Stable": 60, "Declining": 20 },
        profitability: { "Profitable": 100, "Breakeven": 50, "Loss-making": 10 },
        debtLevel: { "Low": 100, "Medium":60, "High": 20 },
        fleetSize: { "100+": 100, "50-100": 75, "20-50": 50, "Under 20": 25 },
        routeNetwork: { "International": 100, "Regional": 65, "Domestic only": 40 },
        countryRegion: { "Western Europe / North America": 100, "Eastern Europe / Asia": 75, "Middle East / Latin America": 50, "Africa": 25 },
        repossessionEnv: { "Strong": 100, "Moderate": 60, "Weak": 20 },
        airlineType: { "Low cost": 90, "Full service": 85, "Regional": 70, "Charter": 60 },
        loadFactor: { "Above 85%": 100, "75-85%": 65, "Below 75%": 30 },
        recentNews: { "Positive": 100, "Neutral": 70, "Negative": 30, "Distressed": 0 },
    };
    return scores[field]?.[value] ?? 0;
}

function calculateScore(inputs: CreditInputs): {
    total: number;
    financial: number;
    operational: number;
    country: number;
    airlineType: number;
    performance: number;
} {
    const financial = (
        scoreValue("revenueTrend", inputs.revenueTrend) +
        scoreValue("profitability", inputs.profitability) +
        scoreValue("debtLevel", inputs.debtLevel)
    ) / 3;

    const operational = (
        scoreValue("fleetSize",inputs.fleetSize) +
        scoreValue("routeNetwork", inputs.routeNetwork)
    ) / 2;

    const country = (
        scoreValue("countryRegion", inputs.countryRegion) +
        scoreValue("repossessionEnv", inputs.repossessionEnv)
    ) / 2;

    const airlineType = scoreValue("airlineType", inputs.airlineType);

    const performance = (
        scoreValue("loadFactor", inputs.loadFactor) +
        scoreValue("recentNews", inputs.recentNews)
    ) / 2;

    const total = (
        financial * 0.30 +
        operational * 0.20 +
        country * 0.20 +
        airlineType * 0.15 +
        performance * 0.15
    );

    return {total, financial, operational, country, airlineType, performance };
}

function getRating(score: number): { label: string; color: string } {
    if (score >=70) return { label: "LOW RISK", color: "var(--green)" };
    if (score >= 40) return { label: "MEDIUM RISK", color: "var(--amber)" };
    return { label: "HIGH RISK", color: "var(--red)" };
}

function generateSummary(inputs: CreditInputs, scores: ReturnType<typeof calculateScore>): string {
    const rating = getRating(scores.total);
    const weaknesses = [];
    const strengths = [];

    if (scores.financial < 50) weaknesses.push("weak financial position");
    else strengths.push("solid financial fundamentals");

    if (scores.country < 50) weaknesses.push("challenging country risk environment");
    else strengths.push("favourable jurisdiction");

    if (scores.operational < 50) weaknesses.push("limited operational scale");
    else strengths.push("strong operational footprint");

    if (scoreValue("recentNews", inputs.recentNews) < 50) weaknesses.push("concerning recent developments");

    const strengthText = strengths.length > 0 ? `Strengths include ${strengths.join(" and ")}.` : "";
    const weaknessText = weaknesses.length > 0 ? `Key risk factors include ${weaknesses.join(" and ")}.` : "";

    return `${inputs.airlineName || "This lessee"} has been assessed as ${rating.label} with an overall score of ${scores.total.toFixed(1)}/100. ${strengthText} ${weaknessText} ${rating.label === "HIGH RISK" ? "Enhanced due diligence and additional security provisions are recommended before proceeding." : rating.label === "MEDIUM RISK" ? "Standard due diligence is recommended with close monitoring of financial performance." : "Standard lease terms are appropriate subject to final legal and financial review."}`;
}

export default function CreditRisk() {
    const { creditPrefill, setCreditPrefill } = useAppContext();
    const [inputs, setInputs] = useState<CreditInputs>({ ...defaultInputs, airlineName: creditPrefill });
    const [result, setResult] = useState<ReturnType<typeof calculateScore> | null>(null);

    function handleChange(field: keyof CreditInputs, value: string) {
        setInputs(prev => ({ ...prev, [field]: value }));
    }

    useEffect(() => {
        if (creditPrefill) {
            setInputs(prev => ({ ...prev, airlineName: creditPrefill }));
            setCreditPrefill("");
        }
    }, [creditPrefill]);

    function handleAssess() {
        setResult(calculateScore(inputs));
    }

    const rating = result ? getRating(result.total) : null;
    const summary = result ? generateSummary(inputs, result) : null;

    const categories = result ? [
        { label: "Financial Health", score: result.financial, weight: "30%" },
        { label: "Operational Scale", score: result.operational, weight: "20%" },
        { label: "Country Risk", score: result.country, weight: "20%" },
        {label: "Airline Type", score: result.airlineType, weight: "15%" },
        { label: "Recent Performance", score: result.performance, weight: "15%" },
    ] : [];

    return (
        <div>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
                Lessee Credit Risk Assessment
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "24px" }}>
                Structured scoring framework for aircraft lessee creditworthiness
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>

                {/* Left - Inputs */}
                <div className="pricing-form-card">
                    <div className="pricing-title">Lessee Details</div>

                    <div className="form-field">
                        <label className="form-label">Airline Name</label>
                        <input className="form-input" type="text" placeholder="e.g. Ryanair"
                        value={inputs.airlineName}
                        onChange={e => handleChange("airlineName", e.target.value)} />
                    </div>

                    <div className="pricing-title" style={{ marginTop: "16px" }}>Financial Health</div>

                    {[
                        { field: "revenueTrend", label: "Revenue Trend", options: ["Growing", "Stable", "Declining"] },
                        { field: "profitability", label: "Profitability", options: ["Profitable", "Breakeven", "Loss-making"] },
                        { field: "debtLevel", label: "Debt Level", options: ["Low", "Medium", "High"] },
                    ].map(({ field, label, options }) => (
                        <div className="form-field" key={field}>
                            <label className="form-label">{label}</label>
                            <select className="form-input"
                            value={inputs[field as keyof CreditInputs]}
                            onChange={e => handleChange(field as keyof CreditInputs, e.target.value)}>
                                <option value="">Select...</option>
                                {options.map(o => <option key={o}>{o}</option>)}
                            </select>
                        </div>
                    ))}

                    <div className="pricing-title" style={{ marginTop: "16px" }}>Operational Scale</div>

                    {[
                        { field: "fleetSize", label: "Fleet Size", options: ["100+", "50-100", "20-50", "Under 20"] },
                        { field: "routeNetwork", label: "Route Network", options: ["International", "Regional", "Domestic only"] },
                    ].map(({ field, label, options }) => (
                        <div className="form-field" key={field}>
                            <label className="form-label">{label}</label>
                            <select className="form-input"
                            value={inputs[field as keyof CreditInputs]}
                            onChange={e => handleChange(field as keyof CreditInputs, e.target.value)}>
                                <option value="">Select...</option>
                                {options.map(o => <option key={o}>{o}</option>)}
                            </select>
                        </div>
                    ))}

                    <div className="pricing-title" style={{ marginTop: "16px" }}>Country Risk</div>

                    {[
                        { field: "countryRegion", label: "Region", options: ["Western Europe / North America", "Eastern Europe / Asia", "Middle East / Latin America", "Africa"] },
                        { field: "repossessionEnv", label: "Repossessional Environment", options: ["Strong", "Moderate", "Weak"] },
                    ].map(({ field, label, options }) => (
                        <div className="form-field" key={field}>
                            <label className="form-label">{label}</label>
                            <select className="form-input"
                            value={inputs[field as keyof CreditInputs]}
                            onChange={e => handleChange(field as keyof CreditInputs, e.target.value)}>
                                <option value="">Select...</option>
                                {options.map(o => <option key={o}>{o}</option>)}
                            </select>
                        </div>
                    ))}

                    <div className="pricing-title" style={{ marginTop: "16px" }}>Airline Profile</div>

                    {[
                        { field: "airlineType", label: "Airline Type", options: ["Full service", "Low cost", "Regional", "Charter"] },
                        { field: "loadFactor", label: "Load Factor", options: ["Above 85%", "75-85%", "Below 75%"] },
                        { field: "recentNews", label: "Recent News / Sentiment", options: ["Positive", "Neutral", "Negative", "Distressed"] },
                    ].map(({ field, label, options }) => (
                        <div className="form-field" key={field}>
                            <label className="form-label">{label}</label>
                            <select className="form-input"
                            value={inputs[field as keyof CreditInputs]}
                            onChange={e => handleChange(field as keyof CreditInputs, e.target.value)}>
                                <option value="">Select...</option>
                                {options.map(o => <option key={o}>{o}</option>)}
                            </select>
                        </div>
                    ))}

                    <button className="calculate-btn" onClick={handleAssess}>
                        Assess Credit Risk
                    </button>
                </div>

                {/* Right - Output */}
                <div className="pricing-output-card">
                    <div className="pricing-title">Risk Assessment</div>

                    {result && rating ? (
                        <div>
                            {/* Overall Score */}
                            <div style={{ textAlign: "center", padding: "24px 0", borderBottom: "1px solid var(--border)" }}>
                                <div style={{ fontSize: "56px", fontWeight: "700", fontFamily: "var(--font-mono)", color: rating.color, lineHeight: 1 }}>
                                    {result.total.toFixed(0)}
                                </div>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>OUT OF 100</div>
                                <div style={{ fontSize: "14px", fontWeight: "700", color: rating.color, marginTop: "8px", letterSpacing: "0.08em" }}>
                                    {rating.label}
                                </div>
                            </div>

                            {/* Category Breakdown */}
                            <div style={{ padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
                                <div className="pricing-title">Score Breakdown</div>
                                {categories.map(({ label, score, weight }) => (
                                    <div key={label} style={{ marginBottom: "10px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                                            <span style={{ color: "var(--text-secondary)" }}>{label} <span style={{ color: "var(--text-muted)" }}>({weight})</span></span>
                                            <span style={{ color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>{score.toFixed(0)}</span>
                                        </div>
                                        <div style={{ height: "6px", backgroundColor: "var(--bg-secondary)", borderRadius: "3px", overflow: "hidden" }}>
                                            <div style={{
                                                height: "100%",
                                                width: `${score}%`,
                                                backgroundColor: score >= 70 ? "var(--green)" : score >= 40 ? "var(--amber)" : "var(--red)",
                                                borderRadius: "3px",
                                                transition: "width 0.5s ease",
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Written Summary */}
                            <div style={{ paddingTop: "16px" }}>
                                <div className="pricing-title">Analyst Summary</div>
                                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                                    {summary}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="output-placeholder">
                            Complete the assessment form and click <strong style={{ color: "var(--accent-bright)" }}>Assess Credit Risk</strong> to generate a risk rating
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}