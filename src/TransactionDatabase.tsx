import { useState } from "react";
import { useAppContext } from "./AppContext";
import type { Transaction } from "./AppContext";

interface ComparableScore {
    transaction: Transaction;
    score: number;
    reasons: string[];
}

const aircraftFamilies: Record<string, string> = {
    "A318": "A320 Family", "A319": "A320 Family", "A320ceo": "A320 Family",
    "A321ceo": "A320 Family", "A320neo": "A320 Family", "A321neo": "A320 Family",
    "B737-700": "737 Family", "B737-800": "737 Family", "B737-900": "737 Family",
    "B737 MAX 8": "737 Family", "B737 MAX 10": "737 Family",
    "ATR 42-600": "ATR Family", "ATR 72-600": "ATR Family",
    "Embraer E175": "E-Jet Family", "Embraer E190": "E-Jet Family",
    "Embraer E195": "E-Jet Family", "Embraer E195-E2": "E-Jet Family",
    "Bombardier Q400": "Q Series",
};

const aircraftTypes = ["All", "A320ceo", "A321ceo", "B737-800", "A320neo", "A321neo", "ATR 72-600", "Embraer E190", "Embraer E195", "Bombardier Q400"];
const regions = ["All", "Western Europe", "Eastern Europe", "North America", "Middle East", "Asia", "Latin America", "Africa"];

function scoreComparables(transactions: Transaction[], deal: {
    aircraftType: string;
    aircraftAge: number;
    lesseeRegion: string;
    tenorYears: number;
    monthlyRent: number;
}): ComparableScore[] {
    const dealFamily = aircraftFamilies[deal.aircraftType] || deal.aircraftType;
    return transactions
    .map(t => {
        let score = 0;
        const reasons: string[] = [];
        const txFamily = aircraftFamilies[t.aircraftType] || t.aircraftType;
        if (t.aircraftType === deal.aircraftType) {
            score += 40; reasons.push("Exact type match");
        } else if (txFamily === dealFamily) {
            score += 20; reasons.push("Same aircraft family");
        }
        const ageDiff = Math.abs(t.aircraftAge - deal.aircraftAge);
        if (ageDiff <= 2) { score +=25; reasons.push(`Age match (±${ageDiff}yr)`); }
        else if (ageDiff <= 3) { score += 15; reasons.push(`Age close (±${ageDiff}yr)`); }
        else if (ageDiff <= 5) { score += 5; }
        if (t.lesseeRegion === deal.lesseeRegion) {
            score += 20; reasons.push("Same region");
        }
        if (Math.abs(t.tenorYears - deal.tenorYears) <= 2) {
            score += 10; reasons.push("Similar tenor")
        }
        const txDate = new Date(t.date + "-01");
        const monthsAgo = (new Date().getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (monthsAgo <= 12) { score += 5; reasons.push("Recent (< 12mo)"); }
        else if (monthsAgo <= 18) { score += 2; reasons.push("Recent (< 18mo)"); }
        return { transaction: t, score, reasons };
    })
    .filter(c => c.score >= 15)
    .sort((a, b) => b.score - a.score);
}

function getMarketVerdict(proposedRent: number, comparables: ComparableScore[]): {
    label: string;
    color: string;
    detail: string;
    rangeMin: number;
    rangeMax: number;
    midpoint: number;
    vsMarket: number;
} | null {
    if (comparables.length === 0) return null;
    const rents = comparables.map(c => c.transaction.monthlyRent);
    const rangeMin = Math.min(...rents);
    const rangeMax = Math.max(...rents);
    const midpoint = rents.reduce((a, b) => a + b, 0) / rents.length;
    const vsMarket = ((proposedRent - midpoint) / midpoint) * 100;
    let label: string;
    let color: string;
    let detail: string;
    if (vsMarket > 8) {
        label = "Strong deal"; color = "var(--success)"; detail = "Significantly above market";
    } else if (vsMarket > 2) {
        label = "Above market"; color = "var(--success)"; detail = "Modestly above comparables";
    } else if (vsMarket >= -2) {
        label = "At market"; color = "var(--accent-bright)"; detail = "In line with comparables";
    } else if (vsMarket >= -8) {
        label = "Below marlet"; color = "#f97316"; detail = "Modestly below comparables";
    } else {
        label = "Weak deal"; color = "#ef4444"; detail = "Significantly below market";
    }
    return { label, color, detail, rangeMin, rangeMax, midpoint, vsMarket };
}

export default function TransactionDatabase() {
    const { transactions, addTransaction } = useAppContext();

    const [filterType, setFilterType] = useState("All");
    const [filterRegion, setFilterRegion] = useState("All");
    const [showAddForm, setShowAddForm] = useState(false);
    const [showBenchmark, setShowBenchmark] = useState(false);
    const [lrfError, setLrfError] = useState(false);
    const [newTx, setNewTx] = useState<Omit<Transaction, "id">>({
        date: "",
        aircraftType: "A320ceo",
        aircraftAge: 8,
        lessee: "",
        lesseeRegion: "Western Europe",
        tenorYears: 10,
        monthlyRent: 0,
        lrf: 0,
        notes: "",
    });

    const [benchmark, setBenchmark] = useState({
        aircraftType: "A320neo",
        aircraftAge: 4,
        lesseeRegion: "Western Europe",
        tenorYears: 10,
        monthlyRent: 310000,
    });

    const filtered = transactions.filter(t =>
    (filterType === "All" || t.aircraftType === filterType) &&
    (filterRegion === "All" || t.lesseeRegion === filterRegion)
    );

    // Average LRF by aircraft type
    const avgLrfByType = aircraftTypes.slice(1).map(type => {
        const typeTxs = transactions.filter(t => t.aircraftType === type);
        if (typeTxs.length === 0) return null;
        const avg = typeTxs.reduce((sum, t) => sum + t.lrf, 0) / typeTxs.length;
        return { type, avg, count: typeTxs.length };
    }).filter(Boolean);

    const comparables = showBenchmark ? scoreComparables(transactions, benchmark) : [];
    const verdict = showBenchmark && benchmark.monthlyRent > 0
    ? getMarketVerdict(benchmark.monthlyRent, comparables)
    : null;

    const gridCols = "80px 120px 50px 140px 115px 60px 115px 75px 1fr";

    function handleAdd() {
        if (newTx.lessee && newTx.date && newTx.monthlyRent > 0) {
            if (newTx.lrf <=0) return; // require explicit LRF entry
            addTransaction(newTx);
            setShowAddForm(false);
            setNewTx({ date: "", aircraftType: "A320ceo", aircraftAge: 8, lessee: "", lesseeRegion: "Western Europe", tenorYears: 10, monthlyRent: 0, lrf: 0, notes: "" });
        }
    }

    return (
        <div>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
                Transaction Database
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "24px" }}>
                Completed lease transaction comparables - benchmark new deals against market
            </p>

            {/* LRF Benchmarks by Type */}
            <div style={{ marginBottom: "24px" }}>
                <div className="pricing-title" style={{ marginBottom: "12px" }}>Average LRF by Aircraft Type</div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {avgLrfByType.map(item => item && (
                        <div key={item.type} className="kpi-card" style={{ minWidth: "150px" }}>
                            <div className="kpi-label">{item.type}</div>
                            <div className="kpi-value" style={{ fontSize: "20px", color: "var(--accent-bright)"}}>
                                {(item.avg * 100).toFixed(3)}%
                            </div>
                            <div className="kpi-sub">{item.count} transaction{item.count > 1 ? "s" : ""}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filters and Add Button */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px", alignItems: "center" }}>
                <select className="form-input" style={{ width: "160px" }}
                value={filterType} onChange={e => setFilterType(e.target.value)}>
                    {aircraftTypes.map(t => <option key={t}>{t}</option>)}
                </select>
                <select className="form-input" style={{ width: "160px" }}
                value={filterRegion} onChange={e => setFilterRegion(e.target.value)}>
                    {regions.map(r => <option key={r}>{r}</option>)}
                </select>
                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
                </div>
                <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                    <button
                    className="export-btn"
                    onClick={() => { setShowBenchmark(b => !b); setShowAddForm(false); }}
                    style={showBenchmark ? { backgroundColor: "var(--accent-bright)", color: "#fff", borderColor: "var(--accent-bright)" } : {}}
                >
                    {showBenchmark ? "X Close Benchmark" : "Benchmark a Deal"}
                </button>
                <button className="export-btn" onClick={() => { setShowAddForm(f => !f); setShowBenchmark(false); }}>
                    {showAddForm ? "X Cancel" : "+ Log Transaction"}
                </button>
                </div>
            </div>

            {/* Comparables Engine */}
            {showBenchmark && (
                <div style={{
                    backgroundColor: "var(--bg-card)",
                    border: "1px solid var(--accent-bright)",
                    borderRadius: "10px",
                    padding: "20px",
                    marginBottom: "20px",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                        <div className="pricing-title" style={{ margin: 0 }}>Comparables Engine</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)", backgroundColor: "var(--bg-surface)", padding: "2px 8px", borderRadius: "4px", border: "1px solid var(--border)" }}>
                            Scores transactions by type · age · region · tenor · recency
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px", marginBottom: "20px" }}>
                        <div className="form-field">
                            <label className="form-label">Aircraft Type</label>
                            <select className="form-input" value={benchmark.aircraftType}
                            onChange={e => setBenchmark(b => ({ ...b, aircraftType: e.target.value }))}>
                                {aircraftTypes.slice(1).map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Aircraft Age (yr)</label>
                            <input className="form-input" type="number" min="0" max="30"
                            value={benchmark.aircraftAge}
                            onChange={e => setBenchmark(b => ({ ...b, aircraftAge: parseFloat(e.target.value) }))} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Lessee Region</label>
                            <select className="form-input" value={benchmark.lesseeRegion}
                            onChange={e => setBenchmark(b => ({ ...b, lesseeRegion: e.target.value }))}>
                                {regions.slice(1).map(r => <option key={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Tenor (yr)</label>
                            <input className="form-input" type="number" min="1" max="20"
                            value={benchmark.tenorYears}
                            onChange={e => setBenchmark(b => ({ ...b, tenorYears: parseFloat(e.target.value) }))} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Proposed Monthly Rent (€)</label>
                            <input className="form-input" type="number"
                            value={benchmark.monthlyRent}
                            onChange={e => setBenchmark(b => ({ ...b, monthlyRent: parseFloat(e.target.value) }))} />
                        </div>
                    </div>

                    {verdict && (
                        <div style= {{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "20px" }}>
                            <div className="kpi-card">
                                <div className="kpi-label">Comparables found</div>
                                <div className="kpi-value" style={{ fontSize: "24px" }}>{comparables.length}</div>
                                <div className="kpi-sub">scored transactions</div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-label">Market rent range</div>
                                <div className="kpi-value" style={{ fontSize: "16px" }}>
                                    €{Math.round(verdict.rangeMin / 1000)}k - €{Math.round(verdict.rangeMax / 1000)}k
                                </div>
                                <div className="kpi-sub">from comparables</div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-label">Your deal vs midpoint</div>
                                <div className="kpi-value" style={{ fontSize: "18px", color: verdict.color }}>
                                    {verdict.vsMarket > 0 ? "+" : ""}{verdict.vsMarket.toFixed(1)}%
                                </div>
                                <div className="kpi-sub">vs €{Math.round(verdict.midpoint / 1000)}k mid</div>
                            </div>
                            <div className="kpi-card">
                                <div className="kpi-label">Market verdict</div>
                                <div className="kpi-value" style={{ fontSize: "16px", color: verdict.color }}>
                                    {verdict.label}
                                </div>
                                <div className="kpi-sub">{verdict.detail}</div>
                            </div>
                        </div>
                    )}

                    {comparables.length === 0 && (
                        <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px", backgroundColor: "var(--bg-surface)", borderRadius: "8px", marginBottom: "16px" }}>
                            No comparables found for this deal profile. Try broadening the aircraft type or region.
                        </div>
                    )}

                    {comparables.length > 0 && (
                        <div className="pricing-form-card" style={{ marginBottom: 0 }}>
                            <div style={{ display: "grid", gridTemplateColumns: `${gridCols} 90px`, gap: "8px", padding: "8px 12px", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
                                {["Date", "Type", "Age", "Lessee", "Region", "Tenor", "Monthly Rent", "LRF", "Notes", "Match"].map(h => (
                                    <div key={h} style= {{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>{h}</div>
                                ))}
                            </div>
                            <div style={{
                                display: "grid", gridTemplateColumns: `${gridCols} 90px`,
                                gap: "8px", padding: "10px 12px", borderBottom: "1px solid var(--border)",
                                backgroundColor: "rgba(37,99,235, 0.08)", alignItems: "center",
                            }}>
                                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--accent-bright)" }}>-</div>
                                <div style={{ fontSize: "12px", color: "var(--accent-bright)", fontWeight: "600" }}>{benchmark.aircraftType}</div>
                                <div style={{ fontSize: "12px", color: "var(--accent-bright)" }}>{benchmark.aircraftAge}yr</div>
                                <div style={{ fontSize: "12px", color: "var(--accent-bright)", fontWeight: "600" }}>Your deal</div>
                                <div style={{ fontSize: "11px", color: "var(--accent-bright)", }}>{benchmark.lesseeRegion}</div>
                                <div style={{ fontSize: "12px", color: "var(--accent-bright)" }}>{benchmark.tenorYears}yr</div>
                                <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--accent-bright)", fontWeight: "600" }}>
                                    €{benchmark.monthlyRent.toLocaleString()}
                                </div>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>-</div>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Proposed deal</div>
                                <div style={{ fontSize: "11px", color: "var(--accent-bright)", fontWeight: "600" }}>-</div>
                            </div>
                            {comparables.map(({ transaction: t, score, reasons }) => {
                                const rentDiff = ((t.monthlyRent - benchmark.monthlyRent) / benchmark.monthlyRent) * 100;
                                const rentColor = rentDiff > 0 ? "var(--success, #16a34a)" : rentDiff < 0 ? "#f97316" : "var(--text-primary)";
                                return (
                                    <div key={t.id} style={{
                                        display: "grid", gridTemplateColumns: `${gridCols} 90px`,
                                        gap: "8px", padding: "10px 12px", borderBottom: "1px solid var(--border)",
                                        alignItems: "center",
                                    }}>
                                        <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{t.date}</div>
                                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t.aircraftType}</div>
                                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t.aircraftAge}yr</div>
                                        <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: "500" }}>{t.lessee}</div>
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.lesseeRegion}</div>
                                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t.tenorYears}yr</div>
                                        <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: rentColor, fontWeight: "600" }}>
                                            €{t.monthlyRent.toLocaleString()}
                                            <span style={{ fontSize: "10px", marginLeft: "4px", opacity: 0.8 }}>
                                                ({rentDiff > 0 ? "+" : ""}{rentDiff.toFixed(1)}%)
                                            </span>
                                        </div>
                                        <div style= {{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: "600", color: "var(--text-primary)" }}>
                                            {(t.lrf * 100).toFixed(3)}%
                                        </div>
                                        <div style= {{ fontSize: "11px", color: "var(--text-muted)" }}>{t.notes}</div>
                                        <div>
                                            <div style= {{
                                                fontSize: "10px", fontWeight: "600",
                                                color: score >= 70 ? "var(--success, #16a34a)" : score >= 40 ? "var(--accent-bright)" : "var(--text-muted)",
                                                marginBottom: "3px"
                                            }}>
                                                {score}pt match
                                            </div>
                                            <div style={{ fontSize: "9px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                                                {reasons.slice(0, 2).join(" · ")}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Add Transaction Form */}
            {showAddForm && (
                <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "10px", padding: "20px", marginBottom: "16px" }}>
                    <div className="pricing-title" style={{ marginBottom: "16px" }}>Log New Transaction</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
                        <div className="form-field">
                            <label className="form-label">Date (YYYY-MM)</label>
                            <input className="form-input" type="text" placeholder="e.g. 2025-03"
                            value={newTx.date} onChange={e => setNewTx(p => ({ ...p, date: e.target.value }))} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Aircraft Type</label>
                            <select className="form-input" value={newTx.aircraftType}
                            onChange={e => setNewTx(p => ({ ...p, aircraftType: e.target.value }))}>
                                {aircraftTypes.slice(1).map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Aircraft Age (Years)</label>
                            <input className="form-input" type="number"
                            value={newTx.aircraftAge} onChange={e => setNewTx(p => ({ ...p, aircraftAge: parseFloat(e.target.value) }))} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Lessee</label>
                            <input className="form-input" type="text" placeholder="e.g. Ryanair"
                            value={newTx.lessee} onChange={e => setNewTx(p => ({ ...p, lessee: e.target.value }))} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Lessee Region</label>
                            <select className="form-input" value={newTx.lesseeRegion}
                            onChange={e => setNewTx(p => ({ ...p, lesseeRegion: e.target.value }))}>
                                {regions.slice(1).map(r => <option key={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="form-field">
                            <label className="form-label">Tenor (Years)</label>
                            <input className="form-input" type="number"
                            value={newTx.tenorYears} onChange={e => setNewTx(p => ({ ...p, tenorYears: parseFloat(e.target.value) }))} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Monthly Rent (€)</label>
                            <input className="form-input" type="number"
                            value={newTx.monthlyRent} onChange={e => setNewTx(p => ({ ...p, monthlyRent: parseFloat(e.target.value) }))} />
                        </div>
                        <div className="form-field">
                            <label className="form-label" style={{ color: lrfError ? "#ef4444" : undefined }}>
                                LRF (e.g. 0.671) {lrfError && <span style={{ fontWeight: "400", fontSize: "10px" }}> -</span>}
                            </label>
                            <input className="form-input" type="number" step="0.001"
                            style= {{ borderColor: lrfError ? "#ef4444" : undefined }}
                            value={newTx.lrf}
                            onChange={e => {setLrfError(false); setNewTx(p => ({ ...p, lrf: parseFloat(e.target.value) })); }} />
                        </div>
                        <div className="form-field" style={{ gridColumn: "span 4" }}>
                            <label className="form-label">Notes</label>
                            <input className="form-input" type="text" placeholder="e.g. Sale and leaseback"
                            value={newTx.notes} onChange={e => setNewTx(p => ({ ...p, notes: e.target.value }))} />
                        </div>
                    </div>
                    <button className="calculate-btn" style={{ marginTop: "12px" }} onClick={handleAdd}>
                        Log Transaction
                    </button>
                </div>
            )}

            {/* Transaction Table */}
            <div className="pricing-form-card">
                <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: "8px", padding: "8px 12px", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
                    {["Date", "Type", "Age", "Lessee", "Region", "Tenor", "Monthly Rent", "LRF", "Notes"].map(h => (
                        <div key={h} style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>{h}</div>
                    ))}
                </div>

                {filtered.map(t => (
                    <div key={t.id} style={{ display: "grid", gridTemplateColumns: gridCols, gap: "8px", padding: "12px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                        <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{t.date}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t.aircraftType}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t.aircraftAge}yr</div>
                        <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: "500" }}>{t.lessee}</div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.lesseeRegion}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t.tenorYears}yr</div>
                        <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", color: "var(--accent-bright)", fontWeight: "600" }}>
                            €{t.monthlyRent.toLocaleString()}
                        </div>
                        <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: "600", color: "var(--text-primary)" }}>
                            {(t.lrf * 100).toFixed(3)}%
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{t.notes}</div>
                    </div> 
                ))}

                {filtered.length === 0 && (
                    <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                        No transactions match the current Filters
                    </div>
                )}
            </div>
        </div>
    );
}