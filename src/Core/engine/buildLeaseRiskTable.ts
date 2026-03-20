import { portfolio } from "./portfolio";
import { evaluateLeaseRisk } from "./evaluateLeaseRisk";
import type { LeaseRiskRow } from "./models/LeaseRiskRow";

export function buildLeaseRiskTable(): LeaseRiskRow[] {
    return portfolio.map((lease) => {
        const result = evaluateLeaseRisk(
            lease.baseReservesCollected,
            lease.baseRedeliveryCost,
            lease.downsideReservesCollected,
            lease.downsideRedeliveryCost
        );

        return {
            leaseId: lease.leaseId,
            aircraftType: lease.aircraftType,
            baseSurplus: result.baseSurplus,
            downsideSurplus: result.downsideSurplus,
            downsideSeverity: result.downsideSeverity,
            riskFlag: result.riskFlag,
        };
    });
}