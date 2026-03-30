import { useAppContext } from "./AppContext";

function getDaysToExpiry(tenorYears: number): number {
    return Math.round(tenorYears * 365);
}

export default function PortfolioAnalytics() {
    const { transactions, leases } = useAppContext();

    // Portfolio KPIs
    const totalAssets = leases.length;
    const avgLrf = transactions.length > 0
    ? transactions.reduce((sum, t) => sum + t.lrf, 0) / transactions.length
    : 0;
    const avgAge = leases.length > 0
    ? leases.reduce((sum, l) => sum + (transactions.find(t => t.lessee === l.lessee)?.aircraftAge || 8), 0) / leases.length
    : 0;
    const waltYears = leases.length > 0
    ? leases.reduce((sum, l) => sum + l.tenorYears, 0) / leases.length
    : 0;

    // Lessee Concentration
    const lesseeCounts: Record<string, number> = {};
    leases.forEach(l => {
        lesseeCounts[l.lessee] = (lesseeCounts[l.lessee] || 0) + 1;
    });
    const lesseeConcentration = Object.entries(lesseeCounts)
    .sort((a, b) => b[1] - a[1]);

    // Region Concentration
    const regionCounts: Record<string, number> = {};
    transactions.forEach(t => {
        regionCounts[t.lesseeRegion] = (regionCounts[t.lesseeRegion] || 0) + 1;
    });
    const regionConcentration = Object.entries(regionCounts)
    .sort((a, b) => b[1] - a[1]);

    // Aircraft Type Concentration
    const typeCounts: Record<string, number> = {};
    leases.forEach(l => {
        typeCounts[l.aircraftType] = (typeCounts[l.aircraftType] || 0) + 1;
    });
    const typeConcentration = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1]);

    // Lease Expiry Profile
    const expiryBuckets: Record<string, number> = {
        "0-1yr": 0, "1-2yr": 0, "2-3yr": 0, "3-5yr": 0, "5yr+": 0,
    };
    leases.forEach(l => {
        const years = l.tenorYears;
        if (years <= 1) expiryBuckets["0-1yr"]++;
        else if (years <= 2) expiryBuckets["1-2yr"]++;
        else if (years <= 3) expiryBuckets["2-3yr"]++;
        else if (years <=5) expiryBuckets["3-5yr"]++;
        else expiryBuckets["5yr+"]++;
    });

    // Lrf Trend
    const sortedTx = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

    const maxBar = (arr: number[]) => Math.max(...arr, 1);

    return (
        <div>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
                Portfolio Analytics
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "24px" }}>
                Live portfolio metrics - fleet composition, concentration risk and lease expiry profile
            </p>

            {/* KPI Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "32px" }}>
                <div className="kpi-card">
                    <div className="kpi-label">Total Assets</div>
                    <div className="kpi-value">{totalAssets}</div>
                    <div className="kpi-sub">aircraft in portfolio</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Avg LRF</div>
                    <div className="kpi-value" style={{ color: "var(--accent-bright)" }}>
                        {(avgLrf * 100).toFixed(2)}%
                    </div>
                    <div className="kpi-sub">across all transactions</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">WALT</div>
                    <div className="kpi-value">{waltYears.toFixed(1)}yr</div>
                    <div className="kpi-sub">weighted avg lease term</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Avg Fleet Age</div>
                    <div className="kpi-value">{avgAge.toFixed(1)}yr</div>
                    <div className="kpi-sub">estimated from transactions</div>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>

                {/* Lessee Concentration */}
                <div className="pricing-form-card">
                        <div className="pricing-title" style={{ marginBottom: "16px" }}>Lessee Concentration</div>
                        {lesseeConcentration.map(([lessee, count]) => (
                            <div key={lessee} style={{ marginBottom: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                                    <span style={{ color: "var(--text-primary)" }}>{lessee}</span>
                                    <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                                        {count} asset{count > 1 ? "s" : ""} · {Math.round((count / totalAssets) * 100)}%
                                    </span>
                                </div>
                                <div style={{ height: "6px", backgroundColor: "var(--bg-secondary)", borderRadius: "3px", overflow: "hidden" }}>
                                    <div style={{
                                        height: "100%",
                                        width: `${(count / maxBar(Object.values(lesseeCounts))) * 100}%`,
                                        backgroundColor: "var(--accent-bright)",
                                        borderRadius: "3px",
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Aircraft Type Concentration */}
                    <div className="pricing-form-card">
                        <div className="pricing-title" style={{ marginBottom: "16px" }}>Fleet Type Breakdown</div>
                        {typeConcentration.map(([type, count]) => (
                            <div key ={type} style={{ marginBottom: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                                    <span style={{ color: "var(--text-primary)" }}>{type}</span>
                                    <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                                        {count} asset{count > 1 ? "s" : ""} · {Math.round((count / totalAssets) * 100)}%
                                    </span>
                                </div>
                                <div style= {{ height: "6px", backgroundColor: "var(--bg-secondary)", borderRadius: "3px", overflow: "hidden" }}>
                                    <div style={{
                                        height: "100%",
                                        width: `${(count / maxBar(Object.values(typeCounts))) * 100}%`,
                                        backgroundColor: "var(--success, #16a34a)",
                                        borderRadius: "3px",
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>

                    {/* Region Concentration */}
                    <div className="pricing-form-card">
                        <div className="pricing-title" style={{ marginBottom: "16px" }}>Regional Exposure</div>
                        {regionConcentration.map(([region, count]) => (
                            <div key={region} style={{ marginBottom: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                                    <span style={{ color: "var(--text-primary)" }}>{region}</span>
                                    <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                                        {count} transaction{count > 1 ? "s" : ""} · {Math.round((count / transactions.length) * 100)}%
                                    </span>
                                </div>
                                <div style={{ height: "6px", backgroundColor: "var(--bg-secondary)", borderRadius: "3px", overflow: "hidden" }}>
                                    <div style={{
                                        height: "100%",
                                        width: `${(count / maxBar(Object.values(regionCounts))) * 100}%`,
                                        backgroundColor: "#f97316",
                                        borderRadius: "3px",
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Lease Expiry Profile */}
                    <div className="pricing-form-card">
                        <div className="pricing-title" style={{ marginBottom: "16px" }}>Lease Expiry Profile</div>
                        {Object.entries(expiryBuckets).map(([bucket, count]) => (
                            <div key={bucket} style={{ marginBottom: "10px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                                    <span style={{ color: "var(--text-primary)" }}>{bucket}</span>
                                    <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                                        {count} lease{count !== 1 ? "s" : ""}
                                    </span>
                                </div>
                                <div style={{ height: "6px", backgroundColor: "var(--bg-secondary)", borderRadius: "3px", overflow: "hidden" }}>
                                    <div style={{
                                        height: "100%",
                                        width: `${(count / maxBar(Object.values(expiryBuckets))) * 100}%`,
                                        backgroundColor: count === 0 ? "var(--bg-secondary)" :
                                        bucket === "0-1yr" ? "#ef4444" :
                                        bucket === "1-2yr" ? "#f97316" :
                                        "var(--accent-bright)",
                                        borderRadius: "3px",
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* LRF Trend */}
                <div className="pricing-form-card">
                    <div className="pricing-title" style={{ marginBottom: "16px" }}>LRF Trend - Transaction History</div>
                    <div style={{ display: "grid", gridTemplateColumns: "80px 120px 140px 70px 1fr", gap: "8px", padding: "6px 12px", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
                        {["Date", "Type", "Lessee", "LRF", "Trend"].map(h => (
                            <div key={h} style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>{h}</div>
                        ))}
                    </div>
                    {sortedTx.map((t, i) => {
                        const prev = i > 0 ? sortedTx[i - 1].lrf :t.lrf;
                        const diff = t.lrf - prev;
                        const arrow = i === 0 ? "—": diff > 0 ? "▲" : diff < 0 ? "▼" : "—";
                        const arrowColor = i === 0 ? "var(--text-muted)" : diff > 0 ? "var(--success, #16a34a)" : diff < 0 ? "#ef4444" : "var(--text-muted)";
                        return (
                            <div key={t.id} style={{ display: "grid", gridTemplateColumns: "80px 120px 140px 70px 1fr", gap: "8px", padding: "10px 12px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                                <div style={{ fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>{t.date}</div>
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{t.aircraftType}</div>
                                <div style={{ fontSize: "12px", color: "var(--text-primary)", fontWeight: "500" }}>{t.lessee}</div>
                                <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: "600", color: "var(--accent-bright)" }}>
                                    {(t.lrf * 100).toFixed(2)}%
                                </div>
                                <div style= {{ fontSize: "13px", color: arrowColor, fontWeight: "600" }}>
                                    {arrow} {i > 0 && diff !== 0 ? `${diff > 0 ? "+" : ""}${(diff * 100).toFixed(2)}%` : ""}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
    );
}