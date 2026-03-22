function AnalystActionPanel({ eventsInHorizon, aircraft }) {
    const highRiskActions = eventsInHorizon
    .filter(e => e.risk === "High")
    .sort((a, b) => a.day - b.day)
    .slice(0, 2);
    
    const maintenanceActions = eventsInHorizon
    .filter(e => e.type === "maintenance")
    .sort((a, b) => a.day - b.day)
    .slice(0, 2);

    const idleAircraft = aircraft.filter(reg =>
        !eventsInHorizon.some(e => e.aircraft === reg)
    );

    return (
        <div className="action-panel">
            <div className="action-panel-title">Today's Actions - Analyst View</div>

            {highRiskActions.map((e, i) => (
                <div key={`hr-${i}`} className="action-item">
                    Review high-risk {e.type} for {e.aircraft} - Day {e.day}
                    </div>
            ))}

            {maintenanceActions.map((e, i) => (
                <div key={`m-${i}`} className="action-item">
                Prepare for maintenance on {e.aircraft} - Day {e.day}
                </div>
            ))}

            {idleAircraft.slice(0, 2).map((reg, i) => (
                <div key={`idle-${i}`} className="action-item">
                    {reg} is idle in horizon - consider remarketing
                    </div>
            ))}

            {highRiskActions.length === 0 && maintenanceActions.length === 0 && idleAircraft.length === 0 && (
                <div className="action-item">All clear - no urgent actions in horizon</div>
            )}
        </div>
    );
}

export default AnalystActionPanel;