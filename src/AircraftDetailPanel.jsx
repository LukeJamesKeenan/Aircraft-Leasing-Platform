function AircraftDetailPanel({ selectedAircraft, events }) {
    if (!selectedAircraft) {
        return (
            <div className="action-panel" style={{ marginBottom: "12px" }}>
                <div className="action-panel-title">Aircraft Profile</div>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Click an aircraft on the left to see its profile.
                </div>
            </div>
        );
    }

    const aircaftEvents = events.filter(e => e.aircraft === selectedAircraft);
    const nextEvent = aircaftEvents.length > 0
    ? [...aircaftEvents].sort((a,b) => a.day - b.day)[0]
    : null;
    const highRiskEvent = aircaftEvents
    .filter(e => e.risk === "High")
    .sort((a, b) => a.day - b.day)[0];
    const isIdle =aircaftEvents.length === 0;

    return (
        <div className="action-panel" style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px "}}>
                <div className="action-panel-title" style={{ marginBottom: 0 }}>
                    Aircraft Profile - {selectedAircraft}
                </div>
                <div style={{
                    fontSize: "11px",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    backgroundColor: isIdle ? "var(--bg-secondary)" : "rgba(16, 185, 129, 0.1)",
                    color: isIdle ? "var(--text-muted)" : "var(--green)",
                    border: isIdle ? "1px solid var(--border)" : "1px solid rgba(16, 185, 129, 0.3)",
                }}>
                    {isIdle ? "Idle in horizon" : "Active in horizon"}
                </div>
            </div>

            <div style={{ marginBottom: "10px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase"}}>
                    Risk Snapshot
                </div>
                {highRiskEvent ? (
                    <div style={{
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        color: "var(--text-primary)",
                    }}>
                        <strong style={{ color: "var(--red)" }}>High-risk upcoming</strong>{""}
                        - Day {highRiskEvent.day} · {highRiskEvent.type}
                        {highRiskEvent.description ? ` (${highRiskEvent.description})` : ""}
                    </div>
                ) : (
                    <div style={{
                        backgroundColor: "rgba(16, 185, 129, 0.1)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        color: "var(--green)",
                    }}>
                        No high-risk events scheduled
                    </div>
                )}
            </div>

            <div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px", fontWeight: "600", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Next Key Event
                </div>
                {nextEvent ? (
                    <div style={{
                    backgroundColor: "var(--accent-glow)",
                    border: "1px solid var(--accent)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    color: "var(--text-primary)",
                }}>
                    Day {nextEvent.day} - <strong>{nextEvent.type}</strong>
                    {nextEvent.description ? ` · ${nextEvent.description}` : ""}
                </div>
            ) : (
                <div style={{
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    color: "var(--text-secondary)",
                }}>
                    No upcoming events recorded
                </div>
            )}
        </div>
        </div>
    );
}

export default AircraftDetailPanel;