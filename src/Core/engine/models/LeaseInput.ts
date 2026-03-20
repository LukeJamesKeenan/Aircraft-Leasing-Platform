export interface LeaseInput {
    leaseId: string;
    aircraftType: string;

    baseReservesCollected: number;
    baseRedeliveryCost: number;

    downsideReservesCollected: number;
    downsideRedeliveryCost: number;
}