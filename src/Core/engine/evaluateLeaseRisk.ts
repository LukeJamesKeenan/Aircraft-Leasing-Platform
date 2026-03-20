import { calculateRedeliverySurplus } from "./redeliverySurplus";
import { calculateDownsideSeverity } from "./downsideSeverity";
import { calculateRiskFlag, type RiskFlag } from "./riskFlag";

export interface LeaseRiskResult {
    baseSurplus: number;
    downsideSurplus: number;
    downsideSeverity: number;
    riskFlag: RiskFlag;
}

export function evaluateLeaseRisk(
    baseReserves: number,
    baseCosts: number,
    downsideReserves: number,
    downsideCosts: number
): LeaseRiskResult {
    const baseSurplus = calculateRedeliverySurplus(
        baseReserves,
        baseCosts
    );

    const downsideSurplus = calculateRedeliverySurplus(
        downsideReserves,
        downsideCosts
    );

    const downsideSeverity = calculateDownsideSeverity(
        baseSurplus,
        downsideSurplus
    );

    const riskFlag = calculateRiskFlag(downsideSurplus);

    return {
        baseSurplus,
        downsideSurplus,
        downsideSeverity,
        riskFlag,
    };
}