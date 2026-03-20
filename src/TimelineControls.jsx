function TimelineControls({ horizon, setHorizon }) {
    return (
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            gap: "6px",
            backgroundColor: "#f3f4f6",
            padding: "6px",
            borderRadius: "10px",
            width: "fit-content",
          }}
        >

            <button
              onClick={() => setHorizon(30)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: horizon === 30 ? "#2563eb" : "white",
                color: horizon === 30 ? "white" : "#111827",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
                30 days
            </button>

            <button
              onClick={() => setHorizon(90)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: horizon === 90 ? "#2563eb" : "white",
                color: horizon === 90 ? "white" : "#111827",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
                90 days
            </button>

            <button
              onClick={() => setHorizon(180)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: horizon === 180 ? "#2563eb" : "white",
                color: horizon === 180 ? "white" : "#111827",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
                180 days
            </button>

        </div>
    );

}

export default TimelineControls;