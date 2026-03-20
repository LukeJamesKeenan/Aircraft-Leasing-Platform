function AircraftRow({ reg, events, horizon, onSelect, isSelected }) {
    return (
        <div
         style={{
            position: "relative",
            height: "80px",
            borderBottom: "1px solid #e5e7eb",
            padding: "6px 0",
            backgroundColor: isSelected ? "#eff6ff" : "white",
            overflow: "visible",
         }}
    >
        {/* Row timeline line */}
        <div
         style={{
            position: "absolute",
            top: "50%",
            left: "4%",
            right: "4%",
            height: isSelected ? "4px" : "3px",
            backgroundColor: isSelected ? "#2563eb" : "#d1d5db",
            borderRadius: "999px",
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06)",
         }}
    />
        {/* Dots for this aircraft */}
        {events
          .filter((e) => e.day <= horizon)
          .map((e) => (
            <div
             key={`${e.aircraft} - ${e.type} - Day ${e.day}`}
             onClick={() => onSelect(e)}
             title={`${e.aircraft} | MSN: ${e.msn || "TBD"} | ${
                e.lessee || "Unknown"
             } (${e.lesseeStatus || "Active"}) | ${
                e.maintenanceCategory || e.description || e.type
             } | Day ${e.day}`} 
             style={{
                position: "absolute",
                top: "50%",
                left: `${4 + (e.day / horizon) * 92}%`,
                width: "12px",
                height: "12px",
                backgroundColor:
                  e.type === "lease"
                    ? "#2563eb"
                    : e.type === "maintenance"
                    ? "#f97316"
                    : "#16a34a",
                borderRadius: "50%",
                transform: "translate(-50%, -50%) scale(1)",
                transition: "transform 0.12s ease, box-shadow 0.12 ease",
                cursor: "pointer",

                /* Professional High-Risk Treatment */
                outline: e.risk === "High"
                  ? "3px solid rgba(239, 68, 68, 0.85)"
                  : "none",

                outlineOffset: e.risk === "High" ? "5px" : "0px",

                boxShadow:
                  e.risk === "High"
                  ? "0 4px 12px rgba(0,0,0,0.18)"
                  : "0 2px 6px rgba(0,0,0,0.12)"
             }}
             
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.15)";
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
                }}

            />
        ))}
    </div>
    );
}

export default AircraftRow;