function AircraftDetailPanel({ selectedAircraft, events }) {
    if (!selectedAircraft) {
        return (
            <div
            style={{
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                padding: "14px",
                backgroundColor: "white",
                marginBottom: "12px",
            }}
        >
            <div style={{ fontWeight: "600", marginBottom: "6px" }}>
                Aircraft Profile
            </div>
            <div style={{ color: "#6b7280", fontSize: "12px" }}>
                Click an aircraft on the left to see its profile.
            </div>
        </div>
        );
    }

    // Filter events for this aircraft only
    const aircraftEvents = events.filter(
        (e) => e.aircraft === selectedAircraft
    );

    // Next upcoming event (earliest day)
    const nextEvent =
    aircraftEvents.length > 0
    ? [...aircraftEvents].sort((a, b) => a.day -b.day)[0]
    : null;

    // Most urgent high-risk event
    const highRiskEvent = aircraftEvents
    .filter((e) => e.risk === "High")
    .sort((a, b) => a.day - b.day)[0];

    const isIdle = aircraftEvents.length === 0;

    return (
        <div
        style={{
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            padding: "14px",
            backgroundColor: "white",
            marginBottom: "12px",
        }}
    >
        <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
        }}
    >
        <div style={{ fontWeight: "600" }}>
            Aircraft Profile - {selectedAircraft}
        </div>

        {/* ACTIVE / IDLE BADGE */}
        <div
        style={{
            fontSize: "12px",
            padding: "4px 10px",
            borderRadius: "999px",
            backgroundColor: isIdle ? "#f3f4f6" : "#ecfeff",
            color: isIdle ? "#6b7280" : "#0f766e",
            border: isIdle
            ? "1px solid #e5e7eb"
            : "1px solid #67e8f9",
        }}
    >
        {isIdle ? "Idle in horizon" : "Active in horizon"}
    </div>
</div>

    {/* RISK SUMMARY */}
    <div style={{marginBottom: "10px" }}>
        <div
        style={{
            fontSize: "12px",
            color: "#6b7280",
            marginBottom: "4px",
        }}
    >
        Risk snapshot
    </div>

    {highRiskEvent ? (
        <div
        style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "10px",
            padding: "8px 10px",
            fontSize: "12px",
        }}
    >
        <strong>Hish-risk upcoming</strong>{" "}
        Day {highRiskEvent.day} - {highRiskEvent.type}
        {highRiskEvent.description
        ? ` (${highRiskEvent.description})`
        : ""}
        </div>
    ) : (
        <div
        style={{
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "10px",
            padding: "8px 10px",
            fontSize: "12px",
        }}
    >
        No high-risk events scheduled
        </div>
    )}
    </div>

    {/* NEXT KEY EVENT */}
    <div>
        <div
        style={{
            fontSize: "12px",
            color: "#6b7280",
            marginBottom: "4px",
        }}
    >
        Next key event
        </div>

        {nextEvent ? (
            <div
            style={{
                backgroundColor: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "10px",
                padding: "8px 10px",
                fontSize: "12px",
            }}
        >
            Day {nextEvent.day} -{" "}
            <strong>{nextEvent.type}</strong>
            {nextEvent.description
            ? ` • ${nextEvent.description}`
            : ""}
            </div>
        ) : (
            <div
            style={{
                backgroundColor: "#f3f4f6",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "8px 10px",
                fontSize: "12px",
                color: "#6b7280",
            }}
        >
            No upcoming events recorded
            </div>
        )}
        </div>
        </div>
    );
}

export default AircraftDetailPanel;