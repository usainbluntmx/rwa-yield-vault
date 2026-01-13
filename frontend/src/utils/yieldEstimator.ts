/* --------------------------------
   Yield Estimator (Simulated)
--------------------------------- */

export type SupportedAsset = "MNT" | "USDC" | "USDT" | "DAI"

/**
 * APY realista basado en protocolos reales (Aave / Lido / Beefy aprox)
 * Valores estáticos pero coherentes por activo
 */
const BASE_APY: Record<SupportedAsset, number> = {
    MNT: 8.5,
    USDC: 4.2,
    USDT: 4.8,
    DAI: 5.5,
}

export function getHybridApy(asset: SupportedAsset): number {
    return BASE_APY[asset]
}

/**
 * Calcula ganancia estimada diaria y mensual
 * Usamos interés simple (como la mayoría de dashboards DeFi)
 */
export function estimateYield(
    asset: SupportedAsset,
    depositedAmount: number
) {
    const apy = BASE_APY[asset]

    const dailyRate = apy / 100 / 365
    const monthlyRate = apy / 100 / 12

    const dailyGain = depositedAmount * dailyRate
    const monthlyGain = depositedAmount * monthlyRate

    return {
        apy,
        dailyGain,
        monthlyGain,
    }
}
