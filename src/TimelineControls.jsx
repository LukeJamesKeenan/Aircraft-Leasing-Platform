function TimelineControls({ horizon, setHorizon }) {
    return (
      <div style={{ marginBottom: "16px", display: "flex", gap: "6px" }}>
        {[30, 90, 180].map(h => (
          <button
          key={h}
          onClick={() => setHorizon(h)}
          className={`horizon-btn ${horizon === h ? "active" : ""}`}
        >
          {h} days
        </button>
        ))}
     </div>
    );
}
export default TimelineControls;