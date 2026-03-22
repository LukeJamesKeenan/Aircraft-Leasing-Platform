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
        <div style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            padding: "14px 16px",
            marginBottom: "14px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr auto",
            gap: "12px",
            alignItems: "center",
        }}>
            <div>
                <div className="form-label">Aircraft</div>
                <select
                value={newAircraft}
                onChange={(e) => setNewAircraft(e.target.value)}
                className="form-input"
                style={{ width: "100%" }}
            >
                {aircraft.map((reg) => (
                    <option key={reg} value={reg}>{reg}</option>
                ))}
            </select>
            </div>

            <div>
                <div className="form-label">Day</div>
                <input
                type="number"
                min="0"
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                className="form-input"
                style={{ width: "100%" }}
            />
            </div>

            <div>
                <div className="form-label">Event Type</div>
                <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="form-input"
                style={{ width: "100%" }}
            >
                <option value="lease">Lease</option>
                <option value="maintenance">Maintenance</option>
                <option value="cash">Cash</option>
            </select>
            </div>

            <div style={{ alignSelf: "flex-end" }}>
                <button
                onClick={addEvent}
                style={{
                    padding: "8px 14px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "var(--accent)",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "13px",
                }}
            >
                Add event
            </button>
            </div>
        </div>
    );
}

export default AddEventForm;