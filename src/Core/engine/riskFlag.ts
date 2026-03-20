export type RiskFlag = "GREEN" | "AMBER" | "RED";

export function calculateRiskFlag(
    redeliverySurplus: number
): RiskFlag {
    if (redeliverySurplus < 0) {
        return "RED";
    }

    if (redeliverySurplus <100_000) {
        return "AMBER";
    }

    return "GREEN";
}