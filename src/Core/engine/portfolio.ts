import type { LeaseInput } from "./models/LeaseInput";

export const portfolio: LeaseInput[] = [
    {
        leaseId: "L001",
        aircraftType: "A320ceo",

        baseReservesCollected: 1_200_000,
        baseRedeliveryCost: 800_000,

        downsideReservesCollected: 900_000,
        downsideRedeliveryCost: 1_000_000,
    },
    {
        leaseId: "L002",
        aircraftType: "B737-800",

        baseReservesCollected: 1_000_000,
        baseRedeliveryCost: 700_000,

        downsideReservesCollected: 850_000,
        downsideRedeliveryCost: 900_000,
    },
];