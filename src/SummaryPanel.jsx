function SummaryPanel({ eventsInHorizon, maintenanceCount, horizon }) {
    return (
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "14px",
            padding: "14px 16px",
            marginBottom: "14px",
            backgroundColor: "white",
            boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
            {/* Column 1 */}
            <div
             style={{
                borderRight: "1px solid #e5e7eb",
                paddingRight: "14px",
             }}
            >
                <div style={{ fontSize: "12px", color: "#6b7280"}}>
                    EVENTS IN HORIZON
                </div>

                <div
                 style={{
                    fontSize: "22px",
                    fontWeight: "700",
                    marginTop: "6px",
                    color: "#111827",
                 }}
                >
                    {eventsInHorizon.length}
                </div>

                <div style={{ fontSize: "12px", color: "#4b5563", letterSpacing: "0.02em" }}>
                    next {horizon} days
                </div>
            </div>

            {/* Column 2 */}
            <div>
                <div style={{ fontSize: "12px", color: "#4b5563", letterSpacing: "0.02em" }}>
                    MAINTENANCE ALERTS
            </div>

            <div
             style={{
                fontSize: "22px",
                fontWeight: "700",
                marginTop: "6px",
                color: "#111827",
             }}
            >
                {maintenanceCount}
            </div>

            <div style={{ fontSize: "12px", color: "#6b7280"}}>
                coming up
            </div>
        </div>
    </div>
    );
}

export default SummaryPanel;