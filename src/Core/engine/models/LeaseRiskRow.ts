import type { RiskFlag } from "../riskFlag";

export interface leaseRiskRow {
    leaseId: string;
    aircraftType: string;

    baseSurplus: number;
    downsideSurplus: number;
    downsideSeverity: number;
    riskFlag: RiskFlag;
}