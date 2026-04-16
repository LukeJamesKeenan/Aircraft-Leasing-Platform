import { useState } from "react";
import { useAppContext } from "./AppContext";

// Fuel burn coefficients (kg CO2 per block hour)
// Based on industry standard values aligned with AWG Carbon Calculator methodology
const emissionsCoefficients: Record<string, number> = {
    "A320ceo": 7100,
    "A321ceo": 7800,
    "A320neo": 5800,
    "A321neo": 6400,
    "B737-800": 7900,
    "B737 MAX 8": 5900,
    "ATR 72-600": 3200,
    "Embraer E190": 4800,
    "Embraer E195": 5100,
    "Bombardier Q400": 2900,
};

// EU Taxonomy - aircraft considered "green technology" (post 2015 new generation types)
const greenTechTypes = ["A320neo", "A321neo", "B737 MAX 8"];
const transitionalTypes = ["ATR 72-600", "Embraer E190", "Embraer E195", "Bombardier Q400"];

interface AircraftEmissions {
    registration: string;
    aircraftType: string;
    lessee: string;
    blockHours: number;
    safPercent: number;
}

function getEUTaxonomyStatus(aircraftType: string, age: number): {
    label: string;
    color: string;
    description: string;
} {
    if (greenTechTypes.includes(aircraftType)) {
        return { label: "Green Technology", color: "var(--green)", description: "New generation aircraft meeting EU Taxonomy climate criteria" };
    }
    if (transitionalTypes.includes(aircraftType)) {
        return { label: "Transitional", color: "var(--amber)", description: "Regional aircraft - transitional activity under EU Taxonomy" };
    }
    if (age <= 10) {
        return { label: "Compliant", color: "var(--accent-bright)", description: "Aircraft meets age threshold for EU Taxonomy alignment" };
    }
    return { label: "Review Required", color: "#f97316", description: "Aircraft age or type requires further assessment for EU Taxonomy alignment" };
}

function calculateCO2(aircraftType: string, blockHours: number, safPercent: number): number {
    const coefficient = emissionsCoefficients[aircraftType] || 6500;
    const fuelBurnKg = coefficient * blockHours / 3.16;
    const safReduction = safPercent / 100 * 0.80;
    const netFuelBurnKg = fuelBurnKg * (1 - safReduction);
    return Math.round(netFuelBurnKg * 3.16);
}

function formatTonnes(kg: number): string {
    return (kg / 1000).toFixed(1) + "t";
}

export default function ESGEmissions() {
    const { leases } = useAppContext();

    const [aircraftData, setAircraftData] = useState<AircraftEmissions[]>(
        leases.map(l => ({
            registration: l.registration,
            aircraftType: l.aircraftType,
            lessee: l.lessee,
            blockHours: 3200,
            safPercent: 2,
        }))
    );

    const [reportingYear, setReportingYear] = useState("2025");
    const [companyName, setCompanyName] = useState("LeasePlatform Portfolio");

    function updateAircraft(registration: string, field: keyof AircraftEmissions, value: number) {
        setAircraftData(prev => prev.map(a =>
            a.registration === registration ? { ...a, [field]: value } : a
        ));
    }

    // Portfolio level calculations
    const totalCO2kg = aircraftData.reduce((sum, a) =>
        sum + calculateCO2(a.aircraftType, a.blockHours, a.safPercent), 0
    );

    const totalBlockHours = aircraftData.reduce((sum, a) => sum + a.blockHours, 0);
    const avgSAF = aircraftData.length > 0
    ? aircraftData.reduce((sum, a) => sum + a.safPercent, 0) / aircraftData.length
    : 0;

    const greenCount = aircraftData.filter(a => greenTechTypes.includes(a.aircraftType)).length;
    const taxonomyScore = Math.round((greenCount / aircraftData.length) * 100);

    const currentYear = new Date().getFullYear();

    function exportPDF() {
        const rows = aircraftData.map(a => {
            const co2kg = calculateCO2(a.aircraftType, a.blockHours, a.safPercent);
            const taxonomy = getEUTaxonomyStatus(a.aircraftType, 5);
            return `
            <tr>
                <td>${a.registration}</td>
                <td>${a.aircraftType}</td>
                <td>${a.lessee}</td>
                <td>${a.blockHours.toLocaleString()}</td>
                <td>${a.safPercent}%</td>
                <td>${formatTonnes(co2kg)}</td>
                <td style="color: ${taxonomy.color}">${taxonomy.label}</td>
            </tr>
        `;
    }).join("");

    const html = `
    <!DOCTYPE html>
    <html>
        <head>
            <title>CSRD ESG Emissions Report - ${companyName}</title>
            <style>
                body { font-family: -apple-system, sans-serif; color: #1e293b; padding: 40px; max-width: 900px; margin: 0 auto; }
                h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
                .subtitle { font-size: 13px; color: #64748b; margin-bottom: 8px; }
                .badge { display: inline-block; font-size: 11px; padding: 3px 10px; border-radius: 4px; background: #dcfce7; color: #16a34a; font-weight: 600; margin-bottom: 24px; }
                .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 32px; }
                .kpi { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; }
                .kpi-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #94aeb8; margin-bottom: 6px; }
                .kpi-value { font-size: 20px; font-weight: 700; }
                .kpi-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 13px; }
                th { text-align: left; padding: 8px 10px; background: #f8fafc; border-bottom: 2px solid #e2e8f0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; }
                td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; }
                .disclosure { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
                .disclosure h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 12px; }
                .disclosure p { font-size: 13px; line-height: 1.7; color: #335155; }
                .methodology { font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 16px; }
                .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; display: flex; justify-content: space-between; }
            </style>
        </head>
        <body>
            <h1>CSRD ESG Emissions Report</h1>
            <div class="subtitle">${companyName} · Reporting Year ${reportingYear}</div>
            <div class="badge">ESRS E1 - Climate Change · Scope 3 Category 11</div>

            <div class="kpi-grid">
                <div class="kpi">
                    <div class="kpi-label">Total Scope 3 Emissions</div>
                    <div class="kpi-value">${formatTonnes(totalCO2kg)}</div>
                    <div class="kpi-sub">CO₂ equivalent</div>
                </div>
                <div class="kpi">
                    <div class="kpi-label">Total Block Hours</div>
                    <div class="kpi-value">${totalBlockHours.toLocaleString()}</div>
                    <div class="kpi-sub">Fleet total</div>
                </div>
                <div class="kpi">
                    <div class="kpi-label">EU Taxonomy Alignment</div>
                    <div class="kpi-value">${taxonomyScore}%</div>
                    <div class="kpi-sub">of fleet by count</div>
                </div>
                <div class="kpi">
                    <div class="kpi-label">Average SAF Blend</div>
                    <div class="kpi-value">${avgSAF.toFixed(1)}%</div>
                    <div class="kpi-sub">fleet average</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Registration</th>
                        <th>Type</th>
                        <th>Lessee</th>
                        <th>Block Hours</th>
                        <th>SAF %</th>
                        <th>CO₂ (tonnes)</th>
                        <th>EU Taxonomy</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>

            <div class="disclosure">
                <h3>ESRS E1 Disclosure Snippet - Ready for Annual Report</h3>
                <p>
                    In the financial year ${reportingYear}, ${companyName} reported total Scope 3 Category 11 (use of sold products)
                    greenhouse gas emissions of <strong>${formatTonnes(totalCO2kg)} CO₂</strong> across a fleet of
                    <strong>${aircraftData.length} aircraft</strong> totalling <strong>${totalBlockHours.toLocaleString()} block hours</strong>.
                    Emissions have been calculated using fuel burn coefficients aligned with Aviation Working Group (AWG)
                    Carbon Calculator methodology, applying a CO₂ conversion factor of 3.16 kg CO₂ per kg of Jet A-1 fuel consumed.
                    Sustainable Aviation Fuel (SAF) blending across the portfolio averaged <strong>${avgSAF.toFixed(1)}%</strong>,
                    delivering an estimated emissions reduction based on a 80% lifecycle CO₂ reduction factor for SAF versus conventional jet fuel.
                    <strong>${taxonomyScore}%</strong> of the portfolio by aircraft count is classified as EU Taxonomy-aligned
                    under Climate Delegated Act Annex I, Section 6.14 (Air transport).
                    This disclosure has been prepared in accordance with ESRS E1 Climate Change disclosure requirements
                    under the Corporate Sustainability Reportinf Directive (CSRD).
                </p>
                <div class="methodology">
                    Methedology: AWG Carbon Calculator aligned · ESRS E1 compliant · Scope 3 Category 11 ·
                    Fuel coefficient source: ICAO Carbon Emissions Calculator · SAF reduction factor: CORSIA methodology
                </div>
            </div>

            <div class="footer">
                <Span>LeasePlatform - Aircraft Leasing Intelligence · ESG Module</Span>
                <span>Generated ${new Date().toLocaleDateString("en-IE")} · ${reportingYear} Reporting Year</span>
            </div>
        </body>
    </html>`;

    const win = window.open("","_blank");
    if (win) {
        win.document.write(html);
        win.document.close();
        win.print();
    }
    }
    return (
        <div>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
                ESG & Emissions
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "24px" }}>
                Scope 3 emissions tracking and CSRD / ESRS E1 disclosure reporting
            </p>

            {/* Report Settings */}
            <div className="pricing-form-card" style={{ marginBottom: "24px" }}>
                <div className="pricing-title" style={{ marginBottom: "16px" }}>Report Settings</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", maxWidth: "500px" }}>
                    <div className="form-field">
                        <label className="form-label">Company / Portfolio Name</label>
                        <input className="form-input" type="text"
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)} />
                    </div>
                    <div className="form-field">
                        <label className="form-label">Reporting Year</label>
                        <input className="form-input" type="text"
                        value={reportingYear}
                        onChange={e => setReportingYear(e.target.value)} />
                    </div>
                </div>
            </div>

            {/* Portfolio KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
                <div className="kpi-card">
                    <div className="kpi-label">Total Scope 3 Emissions</div>
                    <div className="kpi-value" style={{ color: "var(--accent-bright)" }}>{formatTonnes(totalCO2kg)}</div>
                    <div className="kpi-sub">CO₂ equivalent</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Total Block Hours</div>
                    <div className="kpi-value">{totalBlockHours.toLocaleString()}</div>
                    <div className="kpi-sub">fleet total</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">EU Taxonomy Alignment</div>
                    <div className="kpi-value" style={{ color: taxonomyScore >= 50 ? "var(--green)" : "var(--amber)" }}>
                        {taxonomyScore}%
                    </div>
                    <div className="kpi-sub">of fleet by count</div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-label">Avg SAF Blend</div>
                    <div className="kpi-value">{avgSAF.toFixed(1)}%</div>
                    <div className="kpi-sub">fleet average</div>
                </div>
            </div>

            {/* Fleet Emissions Table */}
            <div className="pricing-form-card" style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div className="pricing-title" style={{ marginBottom: 0 }}>Fleet Emissions Input</div>
                    <button className="export-btn" onClick={exportPDF}>
                        Export CSRD Report PDF
                    </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "100px 130px 140px 120px 100px 100px 140px", gap: "8px",  padding: "8px 12px", borderBottom: "1px solid var(--border)", marginBottom: "4px" }}>
                    {["Reg", "type", "Leessee", "Block Hours", "SAF %", "CO₂", "EU Taxonomy"].map(h => (
                        <div key={h} style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>{h}</div>
                    ))}
                </div>

                {aircraftData.map(a => {
                    const co2kg = calculateCO2(a.aircraftType, a.blockHours, a.safPercent);
                    const taxonomy = getEUTaxonomyStatus(a.aircraftType, 5);
                    return (
                        <div key={a.registration} style={{ display: "grid", gridTemplateColumns: "100px 130px 140px 120px 100px 100px 140px", gap: "8px", padding: "10px 12px", borderBottom: "1px solid var(--border)", alignItems: "center" }}>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: "600", color: "var(--text-primary)" }}>{a.registration}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{a.aircraftType}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{a.lessee}</div>
                            <div>
                                <input
                                type="number"
                                className="form-input"
                                style={{ padding: "4px 8px", fontSize: "12px" }}
                                value={a.blockHours}
                                onChange={e => updateAircraft(a.registration, "blockHours", parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div>
                                <input
                                type="number"
                                className="form-input"
                                style={{ padding: "4px 8px", fontSize: "12px" }}
                                value={a.safPercent}
                                min="0"
                                max="100"
                                onChange={e => updateAircraft(a.registration, "safPercent", parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <div style={{ fontSize: "12px", fontFamily: "var(--font-mono)", fontWeight: "600", color: "var(--accent-bright)" }}>
                                {formatTonnes(co2kg)}
                            </div>
                            <div style={{ fontSize: "11px", fontWeight: "600", color: taxonomy.color }}>
                                {taxonomy.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ESRS E1 Disclosure Preview */}
            <div className="pricing-form-card">
                <div className="pricing-title" style={{ marginBottom: "16px" }}>ESTS E1 Disclosure Snippet</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "12px", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>
                    SCOPE 3 CATEGORY 11 · CSRD COMPLIANT · AWG METHODOLOGY
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.8", backgroundColor: "var(--bg-secondary)", padding: "16px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                    In the financial year {reportingYear}, {companyName} reported total Scope 3 Category 11 (use of sold products)
                    greenhouse gas emissions of <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{formatTonnes(totalCO2kg)} CO₂e</span> across a fleet of <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{aircraftData.length} aircraft</span> totalling <span style={{ color:"var(--text-primary)", fontWeight: "600" }}>{totalBlockHours.toLocaleString()} block hours</span>.
                    Emissions have been calculated using fuel burn coefficients aligned with Aviation Working Group (AWG)
                    Carbon Calculator methodology, applying a CO₂ conversion factor of 3.16 kg CO₂ per kg of Jet A-1 fuel consumed.
                    Sustainable Aviation Fuel (SAF) blending across the portfolio averaged <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{avgSAF.toFixed(1)}%</span>,
                    deliverying an estimated emissions reduction based on an 80% lifecycle CO₂ reduction factor for SAF versus conventional jet fuel. <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>{taxonomyScore}%</span> of the portfolio by aircraft count is classified as EU taxonomy-aligned
                    under Climate Delegated Act Annex I, Section 6.14 (Air transport).
                    This disclosure has been prepared in accordance with ESRS E1 Climate Change disclosure requirements
                    under the Corporate Sustainability Reporting Directive (CSRD).
                </p>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "12px" }}>
                    MEthodology: AWG Carbon Calculator aligned · ESRS E1 compliant · Scope 3 Category 11 · Fuel coefficient source: ICAO Carbon Emissions Calculator · SAF reduction factor: CORSIA methodology
                </div>
            </div>
        </div>
    );
}