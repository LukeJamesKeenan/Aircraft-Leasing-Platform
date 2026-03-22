function PortfolioKPI({
    highRiskAircraft,
    aircraftWithMaintenance,
    activeLeases,
    horizon,
    idleAircraft,
    selectedAircraft
}) {
    const kpiBox = (title, value, subtitle, isHighRisk = false) => (
        <div className="kpi-card">
            <div className="kpi-label">
                {selectedAircraft ? `KPIs for ${selectedAircraft}` : "Fleet-wide KPIs"}
            </div>
            <div className="kpi-label" style={{ marginTop: "8px"}}>{title}</div>
            <div className={`kpi-value ${isHighRisk && value > 0 ? "high-risk" : ""}`}>
                {value}
            </div>
            <div className="kpi-sub">{subtitle}</div>
        </div>
    );

    return (
        <div className="kpi-grid" style={{ marginTop: "16px"}}>
            {kpiBox("HIGH-RISK AIRCRAFT", highRiskAircraft, `within ${horizon} days`, true)}
            {kpiBox("AIRCRAFT WITH MAINTENANCE DUE", aircraftWithMaintenance, `within ${horizon} days`)}
            {kpiBox("ACTIVE LEASES", activeLeases, `within ${horizon} days`)}
            {kpiBox("IDLE AIRCRAFT", idleAircraft, "no events in horizon")}
        </div>
    );
}

export default PortfolioKPI;