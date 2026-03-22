function AircraftRow({ reg, events, horizon, onSelect, isSelected }) {
    return (
        <div
         style={{
            position: "relative",
            height: "80px",
            borderBottom: "1px solid var(--border)",
            padding: "6px 0",
            backgroundColor: isSelected ? "var(--accent-glow)" : "transparent",
            overflow: "visible",
         }}
    >
        {/* Row Timeline */}
        <div
        style={{
            position: "absolute",
            top: "50%",
            left: "4%",
            right: "4%",
            height: isSelected ? "4px" : "2px",
            backgroundColor: isSelected ? "var(--accent)" : "var(--border-bright)",
            borderRadius: "999px",
        }}
    />

    {/* Dots for this aircraft */}
    {events
    .filter((e) => e.day <= horizon)
    .map((e) => (
        <div
        key={`${e.aircraft}-${e.type}-Day${e.day}`}
        onClick={() => onSelect(e)}
        title={`${e.aircraft} | MSN: ${e.msn || "TBD"} | ${e.lessee || "Unknown"} (${e.lesseeStatus || "Active"}) | ${e.maintenanceCategory || e.description || e.type} | Day ${e.day}`}
        style={{
            position: "absolute",
            top: "50%",
            left: `${4 + (e.day / horizon) * 92}%`,
            width: "12px",
            height: "12px",
            backgroundColor:
            e.type === "lease" ? "#2563eb" :
            e.type === "maintenance" ? "#f97316" : "#16a34a",
            borderRadius: "50%",
            transform: "translate(-50%, -50%) scale(1)",
            transition: "transform 0.12s ease",
            cursor: "pointer",
            outline: e.risk === "High" ? "3px solid rgba(239, 68, 68, 0.85)" : "none",
            outlineOffset: e.risk === "High" ? "5px" : "0px",
            boxShadow: e.risk === "High" ? "0 4px 12px rgba(0,0,0,0.18)" : "0 2px 6px rgba(0,0,0,0.12)"
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.15)";
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
        }}
    />
))}
</div>
);
}

export default AircraftRow;