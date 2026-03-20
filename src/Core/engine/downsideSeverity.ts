export function calculateDownsideSeverity(
    baseSurplus: number,
    downsideSurplus: number
): number {
    if (baseSurplus === 0) return 0;

    return 1 - downsideSurplus / baseSurplus
}