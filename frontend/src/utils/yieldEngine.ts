export type AssetSymbol =
    | "MNT"
    | "USDC"
    | "USDT"
    | "DAI"
    | "AAPLx"
    | "TSLAx"
    | "NVDAx"

/* ---------------------------------
   BASE APYs (realistas, mainnet-like)
---------------------------------- */
const BASE_APY: Record<AssetSymbol, number> = {
    // L1 / native
    MNT: 4.8,

    // Stablecoins
    USDC: 5.2,
    USDT: 5.0,
    DAI: 4.9,

    // Tokenized stocks (más riesgo → mayor APY)
    AAPLx: 7.2,
    TSLAx: 9.4,
    NVDAx: 8.6,
}

/* ---------------------------------
   Small deterministic variation
---------------------------------- */
function pseudoRandomOffset(symbol: string) {
    let hash = 0
    for (let i = 0; i < symbol.length; i++) {
        hash += symbol.charCodeAt(i)
    }
    return (hash % 20) / 100 // 0.00 → 0.20
}

/* ---------------------------------
   Public API
---------------------------------- */
export function getHybridApy(symbol: AssetSymbol): number {
    const base = BASE_APY[symbol]
    const offset = pseudoRandomOffset(symbol)
    return Number((base + offset).toFixed(2))
}

export function getDailyYield(apy: number): number {
    const rate = apy / 100
    const daily = Math.pow(1 + rate, 1 / 365) - 1
    return Number((daily * 100).toFixed(4))
}

export function getMonthlyYield(apy: number): number {
    const rate = apy / 100
    const monthly = Math.pow(1 + rate, 1 / 12) - 1
    return Number((monthly * 100).toFixed(3))
}
