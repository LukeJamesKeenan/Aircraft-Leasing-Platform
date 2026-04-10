import {createContext, useContext, useState, useEffect } from "react";

// Types

export interface Transaction {
    id: number;
    date: string;
    aircraftType: string;
    aircraftAge: number;
    lessee: string,
    lesseeRegion: string,
    tenorYears: number,
    monthlyRent: number,
    lrf: number;
    notes: string;
}

export interface LeaseEntry {
    registration: string;
    aircraftType: string;
    lessee: string;
    leaseStartDay: number;
    tenorYears: number;
    status: string;
}

// Default Data

const defaultTransactions: Transaction[] = [
    { id: 1, date: "2024-03", aircraftType: "A320ceo", aircraftAge: 8, lessee: "Ryanair", lesseeRegion: "Western Europe", tenorYears: 10, monthlyRent: 188000, lrf: 0.671, notes: "Sale and leaseback transaction" },
    { id: 2, date: "2024-06", aircraftType: "A321ceo", aircraftAge: 6, lessee: "Aer Lingus", lesseeRegion: "Western Europe", tenorYears: 10, monthlyRent: 215000, lrf: 0.652, notes: "Direct lease" },
    { id: 3, date: "2024-08", aircraftType: "ATR 72-600", aircraftAge: 4, lessee: "Emerald Airlines", lesseeRegion: "Western Europe", tenorYears: 8, monthlyRent: 195000, lrf: 0.813, notes: "New delivery lease" },
    { id: 4, date: "2024-10", aircraftType: "B737-800", aircraftAge: 10, lessee: "EasyJet", lesseeRegion: "Western Europe", tenorYears: 8, monthlyRent: 172000, lrf: 0.663, notes: "Lease extension" },
    { id: 5, date: "2025-01", aircraftType: "Embraer E190", aircraftAge: 7, lessee: "Loganair", lesseeRegion: "Western Europe", tenorYears: 7, monthlyRent: 205000, lrf: 0.787, notes: "Direct lease" },
    { id: 6, date: "2025-03", aircraftType: "A320neo", aircraftAge: 3, lessee: "Wizz Air", lesseeRegion: "Eastern Europe", tenorYears: 12, monthlyRent: 325000, lrf: 0.625, notes: "New delivery lease" },
];

const defaultLeases: LeaseEntry[] =[
    { registration: "EI-ABC", aircraftType: "A320ceo", lessee: "Ryanair", leaseStartDay: 0, tenorYears: 8, status: "Monitoring" },
    { registration: "EI-DEF", aircraftType: "A321ceo", lessee: "Aer Lingus", leaseStartDay: 0, tenorYears: 3, status: "Monitoring" },
    { registration: "EI-GHI", aircraftType: "B737-800", lessee: "EasyJet", leaseStartDay: 0, tenorYears: 5, status: "Monitoring" },
    { registration: "EI-JKL", aircraftType: "A320neo", lessee: "Wizz Air", leaseStartDay: 0, tenorYears: 12, status: "Monitoring" },
    { registration: "EI-MNO", aircraftType: "ATR 72-600", lessee: "Ryanair", leaseStartDay: 0, tenorYears: 2, status: "Monitoring" },
];

// Context Type

interface AppContextType {
    transactions: Transaction[];
    addTransaction: (tx: Omit<Transaction, "id">) => void;
    leases: LeaseEntry[];
    addLease: (lease: LeaseEntry) => void;
    updateLeaseStatus: (registration: string, status: string) => void;
    creditPrefill: string;
    setCreditPrefill: (name: string) => void;
}

// Context

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [transactions, setTransactions] = useState<Transaction[]>(() => {
        const saved = localStorage.getItem("lp-transactions");
        return saved ? JSON.parse(saved) : defaultTransactions;
    });

    const [leases, setLeases] = useState<LeaseEntry[]>(() => {
        const saved = localStorage.getItem("lp-leases");
        return saved ? JSON.parse(saved) : defaultLeases;
    });

    useEffect(() => {
        localStorage.setItem("lp-transactions", JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem("lp-leases", JSON.stringify(leases));
    }, [leases]);

    const [creditPrefill, setCreditPrefill] = useState("");

    function addTransaction(tx: Omit<Transaction, "id">) {
        setTransactions(prev => [...prev, { ...tx, id: prev.length + 1 }]);
    }

    function addLease(lease: LeaseEntry) {
        setLeases(prev => [...prev, lease]);
    }

    function updateLeaseStatus(registration: string, status: string) {
        setLeases(prev => prev.map(l =>
            l.registration === registration ? { ...l, status } : l
        ));
    }

    return (
        <AppContext.Provider value={{
            transactions,
            addTransaction,
            leases,
            addLease,
            updateLeaseStatus,
            creditPrefill,
            setCreditPrefill,
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useAppContext must be used within AppProvider");
    return ctx;
}