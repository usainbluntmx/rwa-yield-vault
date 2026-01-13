/* --------------------------------
   Yield Estimator (Simulated)
--------------------------------- */

export type SupportedAsset =
    | "MNT"
    | "USDC"
    | "USDT"
    | "DAI"
    | "AAPLx"
    | "TSLAx"
    | "NVDAx"

/**
 * APY realista basado en protocolos reales
 * (Aave / Beefy / GMX / Synthetix aprox)
 */
const BASE_APY: Record<SupportedAsset, number> = {
    // Native
    MNT: 8.5,

    // Stablecoins
    USDC: 4.2,
    USDT: 4.8,
    DAI: 5.5,

    // Tokenized stocks
    AAPLx: 6.8,
    TSLAx: 9.1,
    NVDAx: 8.3,
}

export function getHybridApy(asset: SupportedAsset): number {
    return BASE_APY[asset]
}

/**
 * Calcula ganancia estimada diaria y mensual
 * Interés simple (estilo dashboards DeFi)
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
