import { useState, useEffect } from "react";
import TimelineControls from "./TimelineControls";
import AddEventForm from "./AddEventForm";
import SummaryPanel from "./SummaryPanel";
import AircraftRow from "./AircraftRow";
import PortfolioKPI from "./PortfolioKPI";
import AircraftDetailPanel from "./AircraftDetailPanel";
import AnalystActionPanel from "./AnalystActionPanel";
import { calculateRedeliverySurplus } from "./Core/engine/redeliverySurplus";
import { calculateDownsideSeverity } from "./Core/engine/downsideSeverity";
import { calculateRiskFlag } from "./Core/engine/riskFlag";
import { evaluateLeaseRisk } from "./Core/engine/evaluateLeaseRisk";
import { portfolio } from "./Core/engine/portfolio";
import type { LeaseInput } from "./Core/engine/models/LeaseInput";
import { buildLeaseRiskTable } from "./Core/engine/buildLeaseRiskTable";
import { exportToCSV } from "./Core/engine/exportToCSV";
import PricingCalculator from "./PricingCalculator";
import CreditRisk from "./CreditRisk";
import Remarketing from "./Remarketing";
import TransactionDatabase from "./TransactionDatabase";
import './App.css'

function App() {

  portfolio.forEach((lease) => {
    const result = evaluateLeaseRisk(
      lease.baseReservesCollected,
      lease.baseRedeliveryCost,
      lease.downsideReservesCollected,
      lease.downsideRedeliveryCost
    );

    console.log("Lease:", lease.leaseId, result);
  });


  const [horizon, setHorizon] = useState(180);
  const [eventFilter, setEventFilter] = useState("all");
  const [newAircraft, setNewAircraft] = useState("EI-ABC");
  const [newDay, setNewDay] = useState(0);
  const [newType, setNewType] = useState("lease");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [editEvent, setEditEvent] = useState(null);
  const [selectedAircraft, setSelectedAircraft] = useState(null);
  const [activeTab, setActiveTab] = useState<"portfolio" | "pricing" | "credit" | "remarketing" | "transactions">("portfolio");
  const [creditPrefill, setCreditPrefill] = useState("");
  const [pendingTransaction, setPendingTransaction] =useState<null | {
    date: string;
    aircraftType: string;
    aircraftAge: number;
    lessee: string;
    lesseeRegion: string;
    tenorYears: number;
    monthlyRent: number;
    lrf: number;
    notes: string;
  }>(null);
  
  const [aircraft, setAircraft] = useState(["EI-ABC", "EI-DEF", "EI-GHI", "EI-JKL", "EI-MNO"]);

  const defaultEvents = [
    {
      aircraft: "EI-ABC",
      day: 20,
      type: "lease",
      msn: "54321",
      lessee: "Ryanair",
      description: "Lease commencement",
      risk: "Low",
    },
    {
      aircraft: "EI-DEF",
      day: 60,
      type: "maintenance",
      msn: "61222",
      lessee: "Aer Lingus",
      description: "C-check due",
      risk: "High",
    },
    {
      aircraft: "EI-GHI",
      day: 120,
      type: "cash",
      msn: "58899",
      lessee: "EasyJet",
      description: "Quarterly rent receipt",
      risk: "Low",
    },
    {
      aircraft: "EI-JKL",
      day: 160,
      type: "lease",
      msn: "63411",
      lessee: "Wizz Air",
      description: "Lease extension review",
      risk: "Medium",
    },
    {
      aircraft: "EI-MNO",
      day: 180,
      type: "maintenance",
      msn: "59988",
      lessee: "Ryanair",
      description: "A-check inspection",
      risk: "Medium",
    },
  ];

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem("fleet-events");

    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map(e => ({
        ...e,
        msn: e.msn || "",
        lesseeStatus: e.lesseeStatus || "Active",
        maintenanceCategory: e.maintenanceCategory || "",
        notes: e.notes || "",
      }));
  }
      return defaultEvents.map (e => ({
        ...e,
        lesseeStatus: e.lesseeStatus || "Active",
        maintenanceCategory: e.maintenanceCategory || "",
        notes: ""
      }));
  });

  const addPriceDeal = (aircraftType: string, registration: string, lessee: string, monthlyRent: number, tenorYears: number) => {
    const newLease = {
      aircraft: registration,
      day: 0,
      type: "lease",
      msn: "TBD",
      lessee: lessee,
      lesseeStatus: "Active",
      maintenaceCategory: "",
      description: `${aircraftType} - LRF priced via Pricing Calculator`,
      risk: "Low",
      notes: `Monthly Rent: €${monthlyRent.toLocaleString()} | Tenor: ${tenorYears} years`,
    };
    setEvents(prev => [...prev, newLease].sort((a,b) => a.day - b.day));
    setAircraft(prev => prev.includes(registration) ? prev : [...prev, registration]);
    setActiveTab("portfolio");
    };

  const addEvent = () => {
    const eventToAdd = {
      aircraft: newAircraft,
      day: Number(newDay),
      type: newType,
      msn: "TBD",
      lessee: "TBD",
      lesseeStatus: "Active",
      maintenanceCategory: "",
      description: "",
      risk: "Medium",
    };

    setEvents(
      [...events, eventToAdd].sort((a, b) => a.day -b.day)
    );

    // Reset Form
    setNewDay(0);
    setNewType("lease");
    setNewAircraft("EI-ABC")
  };

  useEffect(() => {
    localStorage.setItem("fleet-events", JSON.stringify(events));
  }, [events]);

  const eventsInHorizon = events
   .filter(e => e.day <=horizon)
   .filter(e =>
     eventFilter === "all" ? true : e.type === eventFilter
   );

   const aircraftEventsInHorizon =
   selectedAircraft
   ? eventsInHorizon.filter(e => e.aircraft === selectedAircraft)
   : eventsInHorizon;

   console.log("eventsInHorizon:", eventsInHorizon);

  const highRiskAircraft = aircraft.filter(reg =>
    aircraftEventsInHorizon.some(
      e => e.aircraft === reg && e.risk === "High"
    )
  ).length;

  const aircraftWithMaintenance = aircraft.filter(reg =>
    aircraftEventsInHorizon.some(
      e => e.aircraft === reg && e.type === "maintenance"
    )
  ).length;

  const activeLeases = aircraft.filter(reg =>
    aircraftEventsInHorizon.some(
      e => e.aircraft === reg && e.type === "lease"
    )
  ).length;

  const idleAircraft = aircraft.filter(reg =>
    !aircraftEventsInHorizon.some(e => e.aircraft === reg)
  ).length;

  return (
    <div>
      {/* App Header */}
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">FL</div>
          <span className="app-logo-text">LeasePlatform</span>
          <span className="app-logo-badge">Beta</span>
        </div>
        <div className="app-header-right">
          <span>{new Date().toLocaleDateString("en-IE")}</span>
          <span>Analyst · Portfolio Team </span>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="tab-nav">
        <button
        className={`tab-btn ${activeTab === "portfolio" ? "active" : ""}`}
        onClick={() => setActiveTab("portfolio")}>
          Portfolio Timeline
        </button>
        <button
        className={`tab-btn ${activeTab === "pricing" ? "active" : ""}`}
        onClick={() => setActiveTab("pricing")}>
          Pricing Calculator
        </button>

        <button
        className={`tab-btn ${activeTab === "credit" ? "active" : ""}`}
        onClick={() => setActiveTab("credit")}>
          Credit Risk
        </button>

        <button
        className={`tab-btn ${activeTab === "remarketing" ? "active" : ""}`}
        onClick={() => setActiveTab("remarketing")}>
          Remarketing
        </button>
        
        <button
        className={`tab-btn ${activeTab === "transactions" ? "active" : ""}`}
        onClick={() => setActiveTab("transactions")}>
          Transactions
        </button>
      </nav>

      <div className="app-content">

      {activeTab === "pricing" && <PricingCalculator onAddToPortfolio={addPriceDeal} onLogTransaction={(aircraftType, aircraftAge, lessee, tenorYears, monthlyRent, lrf) => {
        const tx = {
          date: new Date().toISOString().slice(0, 7),
          aircraftType,
          aircraftAge,
          lessee,
          lesseeRegion: "Western Europe",
          tenorYears,
          monthlyRent,
          lrf,
          notes: "Logged from Pricing Calculator",
        };
        setPendingTransaction(tx);
        setActiveTab("transactions");
      }} />}
      {activeTab === "credit" && <CreditRisk prefillLessee={creditPrefill} onClearPrefill={() => setCreditPrefill("")} />}
      {activeTab === "remarketing" && <Remarketing onSelectLessee={(name) => { setCreditPrefill(name); setActiveTab("credit"); }} />}
      {activeTab === "transactions" && <TransactionDatabase externalTransaction={pendingTransaction} onTransactionLogged={() => setPendingTransaction(null)} />}
      {activeTab === "portfolio" && (
      <div>

      <div className="toolbar">
        <div className="toolbar-left">
          <button className="export-btn" onClick={() => {
            const rows = buildLeaseRiskTable();
            exportToCSV(rows, "lease_risk_table.csv");
          }}>
            Export Lease Risk CSV
          </button>
        </div>
      </div>

      <TimelineControls horizon={horizon} setHorizon={setHorizon} />

      <div style ={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
        {["all", "lease", "maintenance", "cash"].map(type => (
          <button
          key={type}
          onClick={() => setEventFilter(type)}
          className={`filter-btn ${eventFilter === type ? "active" : ""}`}
          >
            {type}
          </button>
        ))}
      </div>

      <div 
      style={{
        display: "grid", 
        gridTemplateColumns: "1fr 3fr", 
        gap: "16px"
       }}
      >

        {/*LEFT COLUMN: Aircraft List */}  
        <div className="aircraft-list">
          {aircraft.map((reg) => (
            <div
            key={reg}
            onClick={() => setSelectedAircraft(prev => prev === reg ? null : reg)}
            className={`aircraft-item ${selectedAircraft === reg ? "selected" : ""}`}
            >
              <span>{reg}</span>
          </div>
          ))}
        </div>
      

        {/*RIGHT COLUMN: Aircraft Timelines */}
        <div>

          <PortfolioKPI
            highRiskAircraft={highRiskAircraft}
            aircraftWithMaintenance={aircraftWithMaintenance}
            activeLeases={activeLeases}
            idleAircraft={idleAircraft}
            horizon={horizon}
            selectedAircraft={selectedAircraft}
          />

          <AnalystActionPanel
           eventsInHorizon={eventsInHorizon}
           aircraft={aircraft}
          />

          <AircraftDetailPanel
            selectedAircraft={selectedAircraft}
            events={events}
          />

          <AddEventForm
            aircraft={aircraft}
            newAircraft={newAircraft}
            setNewAircraft={setNewAircraft}
            newDay={newDay}
            setNewDay={setNewDay}
            newType={newType}
            setNewType={setNewType}
            addEvent={addEvent}
          />

          <SummaryPanel
            eventsInHorizon={eventsInHorizon}
            maintenanceCount={aircraftWithMaintenance}
            horizon={horizon}
          />

          {/* Colour Legend */}
          <div
           style={{
            display: "flex",
            gap: "16px",
            marginBottom: "10px",
            fontSize: "12px",
            color: "#555",
           }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px"}}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#2563eb",
                  borderRadius: "50%",
                  display: "inline-block",
                }}
                ></span>
                <span>lease</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "6px"}}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#f97316",
                  borderRadius: "50%",
                  display: "inline-block",
                }}
              ></span>
              <span>Maintenance</span>
            </div>
             
            <div style={{ display: "flex", alignItems: "center", gap: "6px"}}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#16a34a",
                  borderRadius: "50%",
                  display: "inline-block",
                }}
              ></span>
              <span>Cash</span>
            </div>
          </div>


          {/* Timeline Scale Labels */}
          <div
           style={{
            display: "grid",
            gridTemplateColumns: "repeat(6, 1fr)",
            marginBottom: "8px",
            padding: "0 12px",
            fontSize: "12px",
            color: "#666",
            textAlign: "center",
           }}
          > 
           <span>Today</span>
           <span>{Math.round(horizon * 0.17)}d</span>
           <span>{Math.round(horizon * 0.33)}d</span>
           <span>{Math.round(horizon * 0.5)}d</span>
           <span>{Math.round(horizon * 0.67)}d</span>
           <span>{horizon}d</span>
          </div>
        
        {/* Right-hand Edit Sidebar */}
        {selectedEvent && (
          <div className="event-sidebar">
            <div className="event-sidebar-title">Event Record</div>

            <div style={{ marginBottom: "8px"}}>
              <label style={{ fontSize: "12px", color: "#666" }}>Aircraft</label>
              <select
                value={editEvent.aircraft}
                onChange={(e) =>
                  setEditEvent({ ...editEvent, aircraft: e.target.value })
                }
                style={{ width: "100%", marginTop: "4px" }}
              >
                {aircraft.map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                    </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: "8px"}}>
              <label style={{ fontSize: "12px", color: "#666" }}>
                Event Type
              </label>
              <select
                value={editEvent.type}
                onChange={(e) =>
                  setEditEvent({ ...editEvent, type: e.target.value })
                }
                style={{ width: "100%", marginTop: "4px" }}
              >
                <option value="lease">Lease</option>
                <option value="maintenance">Maintenance</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            {/* Description */}
            <div style={{ marginBottom: "8px" }}>
              <label style={{ fontSize: "12px", color: "#666" }}>Description</label>
              <input
                type="text"
                value={editEvent.description || ""}
                onChange={(e) =>
                  setEditEvent({ ...editEvent, description: e.target.value })
                }
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>

            {/* MSN */}
            <div style={{ marginBottom: "8px" }}>
              <label style={{ fontSize: "12px", color: "#666" }}>
                MSN (Manufacturer Serial Number)
                </label>
                <input
                type="text"
                value={editEvent.msn || ""}
                onChange={(e) =>
                  setEditEvent({ ...editEvent, msn: e.target.value })
                }
                  style={{ width: "100%", marginTop: "4px" }}
                />
              </div>

            {/* Lessee */}
            <div style={{ marginBottom: "8px" }}>
              <label style={{ fontSize: "12px", color: "#666" }}>Lessee</label>
              <input
                type="text"
                value={editEvent.lessee || ""}
                onChange={(e) =>
                  setEditEvent({ ...editEvent, lessee: e.target.value})
                }
                style={{ width: "100%", marginTop: "4px" }}
              />
            </div>

            {/* Lessee Status */}
            <div style={{ marginBottom: "8px" }}>
              <label style={{ fontSize: "12px", color: "#666" }}>
                Lessee Status
              </label>
              <select
               value={editEvent.lesseeStatus || "Active"}
               onChange={(e) =>
                setEditEvent({ ...editEvent, lesseeStatus: e.target.value })
               }
               style={{ width: "100%", marginTop: "4px" }}
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Expiring">Expiring</option>
              </select>
            </div>

            {/* Maintenance Category */}
            <div style={{ marginBottom: "8px" }}>
              <label style={{ fontSize: "12px", color: "#666" }}>
                Maintenance Category
              </label>
              <select
               value={editEvent.maintenanceCategory || ""}
               onChange={(e) =>
                setEditEvent({
                  ...editEvent,
                  maintenanceCategory: e.target.value,
                })
               }
               style={{ width: "100%", marginTop: "4px" }}
              >
                <option value="">(Not applicable)</option>
                <option value="A-check">A-check</option>
                <option value="C-check">C-check</option>
                <option value="Engine shop visit">Engine shop visit</option>
                <option value="Routine inspection">Routine inspection</option>
              </select>
            </div>

              {/* Risk Level */}
              <div style={{marginBottom: "8px" }}>
                <label style={{ fontSize: "12px", color: "#666", }}>Risk</label>
                <select
                  value={editEvent.risk || "Medium"}
                  onChange={(e) =>
                    setEditEvent({ ...editEvent, risk: e.target.value})
                  }
                  style= {{ width: "100%", marginTop: "4px" }}
                  >

                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            
            {/* Internal Notes */}
            <div style={{ marginBottom: "8px" }}>
              <label style={{ fontSize: "12px", color: "#666" }}>
                Internal Notes
              </label>
              <textarea
                value={editEvent.notes || ""}
                onChange={(e) =>
                  setEditEvent({ ...editEvent, notes: e.target.value})
                }
                style={{
                  width: "100%",
                  marginTop: "4px",
                  minHeight: "60px",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  padding: "6px",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "12px",
                justifyContent: "space-between",
              }}
            >
              <button className="btn-close" onClick={() => setSelectedEvent(null)}>
                Close
              </button>

              <button className="btn-save" onClick={() => {
                setEvents(events.map(ev => ev === selectedEvent ? editEvent : ev));
                setSelectedEvent(null);
              }}>
                Save
              </button>

              <button className="btn-delete" onClick={() => {
                setEvents(events.filter(ev => ev !== selectedEvent));
                setSelectedEvent(null);
              }}>
                Delete
              </button>
            </div>
          </div>
        )}


        {/* Timeline Box */}
        <div className="timeline-container" style={{ position: "relative", overflow: "visible" }}>

        {/* Vertical Grid Lines */}
        <div style={{ position: "absolute", top: "0", left: "0", right: "0", bottom: "0",
          display: "grid", gridTemplateColumns: "repeat(6, 1fr)", pointerEvents: "none",
          paddingLeft: "4%", paddingRight: "4%" }}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ borderRight: "1px dashed var(--border)", height: "100%", opacity: "0.5" }} />
          ))}
        </div>

          {aircraft.map((reg) => {
            const rowEvents = events.filter(
              e =>
                e.aircraft === reg &&
              e.day <= horizon &&
              (selectedAircraft ? e.aircraft === selectedAircraft : true)
            );

            return (
              <AircraftRow
                key={reg}
                reg={reg}
                events={rowEvents}
                horizon={horizon}
                isSelected={selectedAircraft === reg}
                onSelect={(e) => {
                  setSelectedEvent(e);
                  setEditEvent({
                    ...e,
                    msn: e.msn || "",
                    lesseeStatus: e.lesseeStatus || "Active",
                    maintenanceCategory: e.maintenanceCategory || "",
                  });
                }}
              />
              );
          })}

        </div>
      </div>
    </div>
  </div>
  )}
</div>
</div>
);
}

export default App;
