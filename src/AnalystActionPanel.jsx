console.log("AnalystActionPanel render");

function AnalystActionPanel({ eventsInHorizon, aircraft }) {
    // High risk actions
    const highRiskActions = eventsInHorizon
    .filter(e => e.risk === "High")
    .sort((a, b) => a.day - b.day)
    .slice(0, 2);

    // Maintenance actions
    const maintenanceActions = eventsInHorizon
    .filter(e => e.type === "maintenance")
    .sort((a, b) => a.day - b.day)
    .slice(0, 2); 

    // Idle aircraft
    const idleAircraft = aircraft.filter(reg =>
        !eventsInHorizon.some(e => e.aircraft === reg)
    );

    return (
        <div
        style={{
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            padding: "14px",
            backgroundColor: "white",
            marginBottom: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        }}
    >
        <div style ={{ fontWeight: "600", marginBottom: "8px" }}>
            Todays Actions (Analyst View)
        </div>

        <ul style={{ fontSize: "12px", color: "#374151" }}>  

            {highRiskActions.map((e, i) => (
                <li key={`hr-${i}`}>
                    Review high-risk {e.type} for {e.aircraft} - Day {e.day}
                </li>
            ))}

            {maintenanceActions.map((e, i) => (
                <li key={`m-${i}`}>
                    Prepare for maintenance on {e.aircraft} - Day {e.day}
                </li>
            ))}

            {idleAircraft.slice(0, 2).map((reg, i) => (
                <li key={`idle-${i}`}>
                    {reg} is idle in horizon - consider marketing / remarketing
                </li>
            ))}

            {highRiskActions.length === 0 &&
            maintenanceActions.length === 0 &&
            idleAircraft.length === 0 &&(
                <li>All clear - no urgent actions in horizon.</li>
            )}
            </ul>
            </div>
    );
}

export default AnalystActionPanel;