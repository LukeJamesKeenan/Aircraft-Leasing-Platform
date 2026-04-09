import { useState } from "react";
import { useAppContext } from "./AppContext";
import type { LeaseEntry } from "./AppContext";

const statusOptions = ["Monitoring", "Renewal Negotiation", "Remarketing", "LOI Signed", "At Risk", "Sold"];

function getRecommendation(daysToExpiry: number, status: string): string {
    if (status === "LOI Signed") return "LOI signed - proceed to lease execution.";
    if (status === "Sold") return "Asset disposed - no action required,";
    if (status === "At Risk") return "At risk - escalate to senior management immediately";
    if (status === "Remarketing") return "Active remarketing - target lessee identification underway.";
    if (status === "Renewal Negotiation") return "Renewal in progress - monitor negotiation timeline.";
    if (daysToExpiry <= 90) return "Critical - immediate remarketing action required.";
    if (daysToExpiry <= 180) return "Urgent - initiate lessee discussions or remarketing process.";
    if (daysToExpiry <= 365) return "Begin renewal conversations with current lessee.";
    return "Monitor - no immediate action required.";
}

function getDaysToExpiry(tenorYears: number): number {
    return Math.round(tenorYears * 365);
}

function getTrafficLight(daysToExpiry: number, status: string) : { color: string; label: string } {
    if (status === "LOI Signed" || status === "Sold") return { color: "var(--green)", label: status };
    if (daysToExpiry <=180) return { color: "var(--red)", label: "Urgent" };
    if (daysToExpiry <=365) return { color: "var(--amber)", label: "Watch" };
    return { color: "var(--green)", label: "On Track" };
}

function getRiskScore(lease: LeaseEntry): number {
    const days = getDaysToExpiry(lease.tenorYears);
    let score =0;

    // Days to expiry (max 50pts)
    if (days <=90) score +=50;
    else if (days <=180) score +=40;
    else if (days <=365) score +=25;
    else if (days <=730) score +=10;

    // Status (max 30pts)
    if (lease.status === "At Risk") score +=30;
    else if (lease.status === "Remarketing") score +=20;
    else if (lease.status === "Monitoring") score +=10;
    else if (lease.status === "Renewal Negotiation") score +=5;

    // Aircraft type demand (max 20pts) - narrowbodies score lower risk
    const highDemand = ["A320neo", "A321neo", "B737 MAX 8"];
    const medDemand = ["A320ceo", "A321ceo", "B737-800"];
    if (highDemand.includes(lease.aircraftType)) score += 0;
    else if (medDemand.includes(lease.aircraftType)) score += 10;
    else score += 20;

    return Math.min(score, 100);
}

export default function Remarketing({ onSelectLessee, onSelectRegistration }: {onSelectLessee: (name: string) => void, onSelectRegistration: (reg: string) => void }) {
    const { leases, addLease, updateLeaseStatus } = useAppContext();
    const [showAddForm, setShowAddForm] = useState(false);
    const [newLease, setNewLease] = useState<LeaseEntry>({
        registration: "",
        aircraftType: "A320ceo",
        lessee: "",
        leaseStartDay: 0,
        tenorYears: 10,
        status: "Monitoring",
    });

    const aircraftTypes = ["A320ceo", "A321ceo", "B737-800", "A320neo", "A321neo", "Embraer E190", "Embraer E195", "Bombardier Q400"];

    const sortedLeases = [...leases].sort((a, b) =>
    getDaysToExpiry(a.tenorYears) - getDaysToExpiry(b.tenorYears)
);

function handleStatusChange(registration: string, newStatus: string) {
    updateLeaseStatus(registration, newStatus);
}

function handleAddLease() {
    if (newLease.registration && newLease.lessee) {
        addLease(newLease),
        setShowAddForm(false);
        setNewLease({ registration: "", aircraftType: "A320ceo", lessee: "", leaseStartDay: 0, tenorYears: 10, status: "Monitoring" });
    }
}

const urgentCount = leases.filter(l => getDaysToExpiry(l.tenorYears) <= 180 && l.status !== "LOI Signed" && l.status !== "Sold").length;
const watchCount = leases.filter(l => getDaysToExpiry(l.tenorYears) > 180 && getDaysToExpiry(l.tenorYears) <= 365).length;
const onTrackCount = leases.filter(l => getDaysToExpiry(l.tenorYears) > 365 || l.status === "LOI Signed").length;

return (
    <div>
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
            Remarketing Pipeline
        </h2>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "24px" }}>
            Lease expiry tracking and remarketing status across the portfolio
        </p>

        {/* Summary KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "24px", maxWidth: "600px" }}>
            <div className="kpi-card">
                <div className="kpi-label">URGENT</div>
                <div className="kpi-value" style={{ color: "var(--red)" }}>{urgentCount}</div>
                <div className="kpi-sub">expiring within 180 days</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-label">WATCH</div>
                <div className="kpi-value" style={{ color: "var(--amber)" }}>{watchCount}</div>
                <div className="kpi-sub">expiring within 365 days</div>
            </div>
            <div className="kpi-card">
                <div className="kpi-label">ON TRACK</div>
                <div className="kpi-value" style={{ color: "var(--green)" }}>{onTrackCount}</div>
                <div className="kpi-sub">beyond 365 days or LOI signed</div>
            </div>
        </div>

        {/* Pipeline Table */}
        <div className="pricing-form-card" style={{ maxWidth: "1500px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div className="pricing-title" style={{ marginBottom: 0 }}>Lease Expiry Pipeline</div>
                <button className="export-btn" onClick={() => setShowAddForm(!showAddForm)}>
                    + Add Lease
                </button>
            </div>

            {/* Add Lease Form */}
            {showAddForm && (
                <div style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "8px", padding: "16px", marginBottom: "16px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    <div className="form-field">
                        <label className="form-label">Registration</label>
                        <input className="form-input" type="text" placeholder="e.g. EI-XYZ"
                        value={newLease.registration}
                        onChange={e => setNewLease(prev => ({ ...prev, registration: e.target.value }))} />
                    </div>
                    <div className="form-field">
                        <label className="form-label">Aircraft Type</label>
                        <select className="form-input"
                        value={newLease.aircraftType}
                        onChange={e => setNewLease(prev => ({ ...prev, aircraftType: e.target.value }))}>
                            {aircraftTypes.map(t => <option key={t}>{t}</option>)}
                        </select>
                    </div>
                    <div className="form-field">
                        <label className="form-label">Lessee</label>
                        <input className="form-input" type="text" placeholder="e.g. Ryanair"
                        value={newLease.lessee}
                        onChange={e => setNewLease(prev => ({ ...prev, lessee: e.target.value }))} />
                    </div>
                    <div className="form-field">
                        <label className="form-label">Remaining Tenor (Years)</label>
                        <input className="form-input" type="number"
                        value={newLease.tenorYears}
                        onChange={e => setNewLease(prev => ({ ...prev, tenorYears: parseFloat(e.target.value) }))} />
                    </div>
                    <div className="form-field">
                        <label className="form-label">Status</label>
                        <select className="form-input"
                        value={newLease.status}
                        onChange={e => setNewLease(prev => ({ ...prev, status: e.target.value }))}>
                            {statusOptions.map(s => <option key={s}>{s}</option>)}
                        </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                        <button className="calculate-btn" onClick={handleAddLease}>
                            Add to Pipeline
                        </button>
                    </div>
                </div>
            )}

            {/* Table Header */}
            <div style={{ display: "grid", gridTemplateColumns: "110px 120px 140px 90px 90px 160px 2fr", gap: "12px", padding: "8px 12px", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
                {["Registration", "Type", "Lessee", "Days Left", "Risk Score", "Status", "Recommendation"].map(h => (
                    <div key={h} style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>{h}</div>
                ))}
            </div>

            {/* Table Rows */}
            {sortedLeases.map(lease => {
                const days = getDaysToExpiry(lease.tenorYears);
                const light = getTrafficLight(days, lease.status);
                const recommendation = getRecommendation(days, lease.status);
                const riskScore = getRiskScore(lease);
                const riskColor = riskScore >= 70 ? "var(--red)" : riskScore >= 40 ? "var(--amber)" : "var(--green)";

                return (
                    <div key={lease.registration} style={{ display: "grid", gridTemplateColumns: "110px 120px 140px 90px 90px 160px 2fr", gap: "12px", padding: "12px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                        <div
                        onClick={() => onSelectRegistration(lease.registration)}
                        style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: "600", color: "var(--accent-bright)", cursor: "pointer", textDecoration: "underline" }}
                        >
                            {lease.registration}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                            {lease.aircraftType}
                        </div>
                        <div 
                        onClick={() => onSelectLessee(lease.lessee)}
                        style= {{ fontSize: "12px", color: "var(--accent-bright)", cursor: "pointer", textDecoration: "underline" }}
                    >
                        {lease.lessee}
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: "600", color: light.color }}>
                            {days}d
                        </div>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: "600", color: riskColor }}>
                            {riskScore}
                        </div>
                        <div>
                            <select
                            value={lease.status}
                            onChange={e => handleStatusChange(lease.registration, e.target.value)}
                            style={{ fontSize: "11px", padding: "4px 8px", backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "4px", color: light.color, fontWeight: "600", cursor: "pointer" }}>
                                {statusOptions.map(s => <option key={s}>{s}</option>)}
                            </select>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                            {recommendation}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);
}