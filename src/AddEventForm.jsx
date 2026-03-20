function AddEventForm({
    aircraft,
    newAircraft,
    setNewAircraft,
    newDay,
    setNewDay,
    newType,
    setNewType,
    addEvent,
}) {
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
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: "12px",
            alignItems: "center",
         }}
    >
        {/* Aircraft Field */}
        <div>
            <div style={{ fontSize: "12px", color: "#4b5563", marginBottom: "4px" }}>
                Aircraft
        </div>

        <select
          value={newAircraft}
          onChange={(e) => setNewAircraft(e.target.value)}
          style={{
            width: "100%",
            padding: "6px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
         {aircraft.map((reg) => (
            <option key={reg} value={reg}>
                {reg}
                </option>
         ))}
        </select> 
    </div>

        {/* Day Field */}
        <div>
            <div style={{ fontSize: "12px", color: "#4b5563", marginBottom: "4px" }}>
                Day
            </div>

            <input
             type="number"
             min="0"
             value={newDay}
             onChange={(e) => setNewDay(e.target.value)}
             style={{
                width: "100%",
                padding: "6px",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
             }}
            />
        </div>

         {/* Event type field */}
         <div>
            <div style={{ fontSize: "12px", color: "#4b5563", marginBottom: "4px" }}>
                Event type
         </div>

         <select
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          style={{
            width: "100%",
            padding: "6px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}
        >
          <option value="lease">Lease</option>
          <option value="maintenance">Maintenance</option>
          <option value="cash">Cash</option>
        </select>
    </div>

         {/* Button */}
         <div style={{ alignSelf: "flex-end" }}>
            <button
             onClick={addEvent}
             style={{
                padding: "8px 14px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "#2563eb",
                color: "white",
                cursor: "pointer",
                fontWeight: "500",
             }}
        >
            Add event
        </button>
    </div>

    </div>
    );
}

export default AddEventForm;