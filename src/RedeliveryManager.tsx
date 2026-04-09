import { useState } from "react";
import { useAppContext } from "./AppContext";

interface RedeliveryItem {
    registration: string;
    aircraftType: string;
    lessee: string;
    leaseEndDate: string;
    maintenanceReserveBalance: number;
    estimatedRedeliveryCost: number;
    checklistItems: ChecklistItem[];
    compensationItems: CompensationItem[];
}

interface ChecklistItem {
    id: string;
    category: string;
    description: string;
    completed: boolean;
    notes: string;
}

interface CompensationItem {
    id: string;
    description: string;
    amount: number;
}

const defaultChecklist: ChecklistItem[] = [
    { id: "c1", category: "Technical", description: "Final airworthiness review completed", completed: false, notes: "" },
    { id: "c2", category: "Technical", description: "Engine borescope inspection signed off", completed: false, notes: "" },
    { id: "c3", category: "Technical", description: "Landing gear inspection completed", completed: false, notes: "" },
    { id: "c4", category: "Technical", description: "APU inspection completed", completed: false, notes: "" },
    { id: "c5", category: "Documentation", description: "Aircraft Records package received", completed: false, notes: "" },
    {id: "c6", category: "Documentation", description: "Engine logbooks verified", completed: false, notes: "" },
    {id: "c7", category: "Documentation", description: "Airworthiness directives compliance confirmed", completed: false, notes: "" },
    {id: "c8", category: "Documentation", description: "Maintenance program transfer completed", completed: false, notes: "" },
    {id: "c9", category: "Commercial", description: "Final rent payment received", completed: false, notes: "" },
    {id: "c10", category: "Commercial", description: "Security deposit reconciled", completed: false, notes: "" },
    {id: "c11", category: "Commercial", description: "Maintenance reserve final accounting done", completed: false, notes: "" },
    {id: "c12", category: "Commercial", description: "Redelivery location confirmed", completed: false, notes: "" },
];

export default function RedeliveryManager() {
    const { leases } = useAppContext();

    const [selectedReg, setSelectedReg] = useState<string | null>(null);
    const [redeliveries, setRedeliveries] = useState<RedeliveryItem[]>(
        leases.map(l => ({
            registration: l.registration,
            aircraftType: l.aircraftType,
            lessee: l.lessee,
            leaseEndDate: "",
            maintenanceReserveBalance: 0,
            estimatedRedeliveryCost: 0,
            checklistItems: defaultChecklist.map(item => ({ ...item })),
            compensationItems: [],
        }))
    );

    const selected = redeliveries.find (r => r.registration === selectedReg) || null;

    function updateRedelivery(reg: string, updates: Partial<RedeliveryItem>) {
        setRedeliveries(prev => prev.map(r =>
            r.registration === reg ? { ...r, ...updates } : r
        ));
    }

    function toggleChecklist(reg: string, itemId: string) {
        setRedeliveries(prev => prev.map(r =>
            r.registration === reg ? {
                ...r,
                checklistItems: r.checklistItems.map(item =>
                    item.id === itemId ? { ...item, completed: !item.completed } : item
                )
            } : r
        ));
    }

    function addCompensation(reg: string) {
        const newItem: CompensationItem = {
            id: `comp-${Date.now()}`,
            description: "",
            amount: 0,
        };
        setRedeliveries(prev => prev.map(r =>
            r.registration === reg ? {
                ...r,
                compensationItems: [...r.compensationItems, newItem]
            } : r
        ));
    }

    function updateCompensation(reg: string, itemId: string, updates: Partial<CompensationItem>) {
        setRedeliveries(prev => prev.map(r =>
            r.registration === reg ? {
                ...r,
                compensationItems: r.compensationItems.map(item =>
                    item.id === itemId ? { ...item, ...updates } : item
                )
            } : r
        ));
    }

    const surplusDeficit = selected 
    ? selected.maintenanceReserveBalance
    - selected.estimatedRedeliveryCost
    + selected.compensationItems.reduce((sum, c) => sum + c.amount, 0)
    : 0;

    const checklistProgress = selected
    ? Math.round((selected.checklistItems.filter(c => c.completed).length / selected.checklistItems.length) * 100)
    : 0;

    const categories = ["Technical", "Documentation", "Commercial"];

    function exportToPDF() {
        if (!selected) return;
        const surplus = selected.maintenanceReserveBalance - selected.estimatedRedeliveryCost + selected.compensationItems.reduce((sum, c) => sum + c.amount, 0);
        const progress = Math.round((selected.checklistItems.filter(c => c.completed).length / selected.checklistItems.length) * 100);

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
        <title>Redelivery Report - ${selected.registration}</title>
        <style>
        body { font-family: -apple-system, sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { font-size: 22px, font-weight: 700; margin-bottom: 4px; }
        .subtitle { font-size: 13px; color: #64748b; margin-bottom: 32px; }
        .meta { font-size: 13px; color: #475569; margin-bottom: 24px; }
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
        .kpi { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
        .kpi-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 6px; }
        .kpi-value { font-size: 20px; font-weight: 700; }
        .kpi-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
        .section { margin-bottom: 28px; }
        .section-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 12px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
        .checklist-category { font-size: 11px; font-weight: 600; text-transform: uppercase; color: #94a3b8; margin: 12px 0 6px; }
        .checklist-item { display: flex; align-items: center; gap: 10px; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
        .check { width: 14px; height: 14px; border: 1.5px solid #cbd5e1; border-radius: 3px; display: inline-block; flex-shrink: 0; }
        .check-done { background: #16a34a; border-color: #16a34a; }
        .comp-row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #f1f5f9; }
        .surplus { color: ${surplus >=0 ? "#16a34a" : "#ef4444"}; font-weight: 700; }
        .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8, display: flex; justify-content: space-between; }
        </style>
        </head>
        <body>
        <h1>Redelivery Report - ${selected.registration}</h1>
        <div class="subtitle">LeasePlatform · Generated ${new Date().toLocaleDateString("en-IE")}</div>
        <div class="meta">
        <strong>Aircraft:</strong> ${selected.aircraftType} &nbsp;|&nbsp
        <strong>Lessee:</strong> ${selected.lessee} &nbsp;|&nbsp
        <strong>Lease End:</strong> ${selected.leaseEndDate || "TBC"} &nbsp;|&nbsp
        <strong>Checklist:</strong> ${progress}% complete
        </div>
        <div class="kpi-grid">
        <div class="kpi">
        <div class="kpi-label">MR Balance</div>
        <div class="kpi-value">€${selected.maintenanceReserveBalance.toLocaleString()}</div>
        <div class="kpi-sub">reserves Collected</div>
        </div>
        <div class="kpi">
        <div class="kpi-label">Est. Redelivery Cost</div>
        <div class="kpi-value">€${selected.estimatedRedeliveryCost.toLocaleString()}</div>
        <div class="kpi-sub">estimated cost</div>
        </div>
        <div class="kpi">
        <div class="kpi-label">Compensation Total</div>
        <div class="kpi-value">€${selected.compensationItems.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</div>
        <div class="kpi-sub">compensation items</div>
        </div>
        <div class="kpi">
        <div class="kpi-label">Surplus / Deficit</div>
        <div class="kpi-value surplus">${surplus >= 0 ? "+" : ""}€${surplus.toLocaleString()}</div>
        <div class="kpi-sub">net position</div>
        </div>
        </div>
        ${selected.compensationItems.length > 0 ? `
        <div class="section">
        <div class="section-title">Compensation Items</div>
        ${selected.compensationItems.map(c => `
            <div class="comp-row">
            <span>${c.description || "—"}</span>
            <span>€${c.amount.toLocaleString()}</span>
            </div>
            `).join("")}
        </div>` : ""}
        <div class="section">
        <div class="section">
        <div class="section-title">Redelivery Checklist</div>
        ${["Technical", "Documentation", "Commercial"].map(cat => `
            <div class="checklist-category">${cat}</div>
            ${selected.checklistItems.filter(i => i.category === cat).map(i => `
                <div class="checklist-item">
                <div class="check ${i.completed ? "done" : ""}"></div>
                <span style="color: ${i.completed ? "#94a3b8" : "#1e293b"}; text-decoration: ${i.completed ? "line-through" : "none"}">${i.description}</spam>
                </div>
            `).join("")}
        `).join("")}
        </div>
        <div class="footer">
        <span>LeasePlatform — Aircraft Leasing Intelligence</span>
        <span>${selected.registration} · ${selected.aircraftType} · ${selected.lessee}</span>
        </div>
    </body>
    </html>`;

    const win = window.open("", "_blank");
    if (win) {
        win.document.write(html);
        win.document.close();
        win.print();
    }

    }

    return (
        <div>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
                Redelivery Manager
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "24px" }}>
                Maintenance reserve tracking, redelivery checklists and compensation calculations
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "24px" }}>

                {/* Left - Aircraft List */}
                <div>
                    <div style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "8px" }}>
                        Fleet
                    </div>
                    {redeliveries.map(r => {
                        const progress = Math.round((r.checklistItems.filter(c => c.completed).length / r.checklistItems.length) * 100);
                        return (
                            <div
                            key={r.registration}
                            onClick={() => setSelectedReg(r.registration)}
                            className={`aircraft-item ${selectedReg === r.registration ? "selected" : ""}`}
                            style={{ marginBottom: "8px", padding: "10px 12px", cursor: "pointer" }}
                        >
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{r.registration}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{r.aircraftType}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{r.lessee}</div>
                            <div style={{ marginTop: "6px", height: "3px", backgroundColor: "var(--bg-secondary)", borderRadius: "2px" }}>
                                <div style={{ height: "100%", width: `${progress}%`, backgroundColor: progress === 100 ? "var(--green)" : "var(--accent-bright)", borderRadius: "2px" }} />
                                </div>
                                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "3px" }}>{progress}% complete</div>
                                </div>
                        );
                    })}
                </div>

                {/* Right - Detail Panel */}
                {selected ? (
                    <div>
                        <div style ={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                            <button className="export-btn" onClick={exportToPDF}>
                                Export PDF Report
                            </button>
                        </div>
                    {/* Header KPIs */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
                    <div className="kpi-card">
                    <div className="kpi-label">MR Balance</div>
                    <div className="kpi-value" style={{ fontSize: "18px", color: "var(--accent-bright)" }}>
                    €{selected?.maintenanceReserveBalance.toLocaleString()}
                    </div>
                    <div className="kpi-sub">reserves collected</div>
                    </div>
                    <div className="kpi-card">
                    <div className="kpi-label">Est. Redelivery Cost</div>
                    <div className="kpi-value" style={{ fontSize: "18px", color: "#f97316" }}>
                    €{selected?.estimatedRedeliveryCost.toLocaleString()}
                    </div>
                    <div className="kpi-sub">estimated cost</div>
                    </div>
                    <div className="kpi-card">
                    <div className="kpi-label">Surplus / Deficit</div>
                    <div className="kpi-value" style={{ fontSize: "18px", color: surplusDeficit >= 0 ? "var(--green)" : "#ef4444" }}>
                    {surplusDeficit >= 0 ? "+" : ""}€{surplusDeficit.toLocaleString()}
                    </div>
                    <div className="kpi-sub">net position</div>
                    </div>
                    <div className="kpi-card">
                    <div className="kpi-label">Checklist</div>
                    <div className="kpi-value" style={{ fontSize: "18px", color: checklistProgress === 100 ? "var(--green)" : "var(--accent-bright)" }}>
                    {checklistProgress}%
                    </div>
                    <div className="kpi-sub">items complete</div>
                    </div>
                </div>

                {/* MR and Cost Inputs */}
                <div className="pricing-form-card" style={{ marginBottom: "16px" }}>
                    <div className="pricing-title" style={{ marginBottom: "16px" }}>Financial Position</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                        <div className="form-field">
                            <label className="form-label">Lease End Date</label>
                            <input className="form-input" type="text" placeholder="e.g. 2026-06"
                            value={selected.leaseEndDate}
                            onChange={e => updateRedelivery(selected.registration, { leaseEndDate: e.target.value })} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Maintenance Reserve Balance (€)</label>
                            <input className="form-input" type="number"
                            value={selected.maintenanceReserveBalance}
                            onChange={e => updateRedelivery(selected.registration, {maintenanceReserveBalance: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <div className="form-field">
                            <label className="form-label">Estimated Redelivery Cost (€)</label>
                            <input className="form-input" type="number"
                            value={selected.estimatedRedeliveryCost}
                            onChange={e => updateRedelivery(selected.registration, {estimatedRedeliveryCost: parseFloat(e.target.value) || 0 })} />
                        </div>
                    </div>
                </div>

                {/* Compensation Items */}
                <div className="pricing-form-card" style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                        <div className="pricing-title" style={{ marginBottom: 0 }}>Compensation Items</div>
                        <button className="export-btn" onClick={() => addCompensation(selected.registration)}>
                            + Add Item
                        </button>
                    </div>
                    {selected.compensationItems.length === 0 && (
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "12px 0" }}>
                            No compensation items. Add items for paint, interior, missing equipment etc.
                        </div>
                    )}
                    {selected.compensationItems.map(item => (
                        <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: "12px", marginBottom: "8px" }}>
                            <input className="form-input" type="text" placeholder="e.g. Paint compensation"
                            value={item.description}
                            onChange={e => updateCompensation(selected.registration, item.id, { description: e.target.value })} />
                            <input className="form-input" type="number" placeholder="Amount (€)"
                            value={item.amount}
                            onChange={e => updateCompensation(selected.registration, item.id, { amount: parseFloat(e.target.value) || 0 })} />
                        </div>
                    ))}
                    {selected.compensationItems.length > 0 && (
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "8px", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                            Total compensation: <span style={{ color: "var(--accent-bright)", fontFamily: "var(--font-mono)" }}>
                                €{selected.compensationItems.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>

                {/* Checklist */}
                <div className="pricing-form-card">
                    <div className="pricing-title" style={{ marginBottom: "16px" }}>Redelivery Checklist</div>
                    {categories.map(category => (
                        <div key={category} style={{ marginBottom: "20px" }}>
                            <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                                {category}
                            </div>
                            {selected.checklistItems.filter(item => item.category === category).map(item => (
                                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
                                    <input
                                    type="checkbox"
                                    checked={item.completed}
                                    onChange={() => toggleChecklist(selected.registration, item.id)}
                                    style={{ width: "16px", height: "16px", cursor: "pointer" }}
                                />
                                <span style={{ fontSize: "12px", color: item.completed ? "var(--text-muted)" : "var(--text-primary)", textDecoration: item.completed ? "line-through" : "none", flex: 1 }}>
                                    {item.description}
                                </span>
                            </div>
                        ))}
                    </div>
                    ))}
                </div>
            </div>
                ) : (
                    <div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px" }}>
                        Select an aircraft from the list to view its redelivery status
                    </div>
                )}
            </div>
        </div>
    
    );
}