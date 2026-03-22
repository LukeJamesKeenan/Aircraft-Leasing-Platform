function SummaryPanel({ eventsInHorizon, maintenanceCount, horizon }) {
    return (
        <div className="summary-panel">
            <div className="summary-stat">
                <div className="kpi-label">EVENTS IN HORIZON</div>
                <div className="summary-stat-value">{eventsInHorizon.length}</div>
                <div className="summary-stat-label">next {horizon} days</div>
            </div>
            <div className="summary-stat">
                <div className="kpi-label">MAINTENANCE ALERTS</div>
                <div className="summary-stat-value">{maintenanceCount}</div>
                <div className="summary-stat-label">coming up</div>
            </div>
        </div>
    );
}

export default SummaryPanel;