function PortfolioKPI({
    highRiskAircraft,
    aircraftWithMaintenance,
    activeLeases,
    horizon,
    idleAircraft,
    selectedAircraft
}) {
    const kpiBox = (title, value, subtitle) => (
        <div
        style={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            padding: "12px 14px",
            backgroundColor: "white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        }}
    >
        <div style={{ marginBottom: "8px", fontWeight: "600" }}>
            {selectedAircraft
            ? `KPIs for ${selectedAircraft}`
            : "Fleet-wide KPIs"}
        </div>


        <div style={{ fontSize: "12px", color: "#6b7280", letterSpacing: "0.4px" }}>
            {title}
        </div>

        <div style={{ fontSize: "20px", fontWeight: "700", marginTop: "4px" }}>
            {value}
        </div>

        <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
            {subtitle}
        </div>
    </div>
    );

return (
    <div
    style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "12px",
        marginTop: "16px",
    }}
>
    {kpiBox(
        "HIGH-RISK AIRCRAFT",
        highRiskAircraft,
        `within ${horizon} days`
    )}

    {kpiBox(
        "AIRCRAFT WITH MAINTENANCE DUE",
        aircraftWithMaintenance,
        `within ${horizon} days`
    )}

    {kpiBox(
        "ACTIVE LEASES",
        activeLeases,
        `within ${horizon} days`
    )}

    {kpiBox(
        "IDLE AIRCRAFT",
        idleAircraft,
        `no events in horizon`
    )}

    </div>
);
}

export default PortfolioKPI