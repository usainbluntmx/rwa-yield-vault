import { useMemo } from "react"
import Vault from "./Vault"
import { STOCK_VAULTS } from "../constants/vaults"

/* ----------------------------
   METADATA (UI ONLY)
---------------------------- */
type StockMeta = {
    ticker: string
    name: string
}

const STOCK_META: Record<string, StockMeta> = {
    AAPLx: { ticker: "AAPLx", name: "Apple Inc." },
    TSLAx: { ticker: "TSLAx", name: "Tesla Motors" },
    NVDAx: { ticker: "NVDAx", name: "NVIDIA Corp." },
}

/* ----------------------------
   TEMP PRICE MOCK
   (later: oracle / API)
---------------------------- */
const MOCK_PRICES: Record<
    string,
    { price: number; change24h: number }
> = {
    AAPLx: { price: 189.42, change24h: 1.24 },
    TSLAx: { price: 241.05, change24h: -0.52 },
    NVDAx: { price: 465.12, change24h: 4.82 },
}

interface StocksVaultProps {
    address?: string
}

export default function StocksVault({ address }: StocksVaultProps) {
    const stockVaults = useMemo(
        () => STOCK_VAULTS.filter((v) => STOCK_META[v.symbol]),
        []
    )

    return (
        <div className="space-y-10 md:space-y-14">
            {/* TITLE */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-5xl font-bold">
                    Stock Prices
                </h1>
                <p className="text-sm text-slate-400 max-w-xl">
                    Tokenized equities with simulated real-time pricing.
                </p>
            </div>

            {/* PRICE CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {stockVaults.map((vault) => {
                    const meta = STOCK_META[vault.symbol]
                    const price = MOCK_PRICES[vault.symbol]
                    const positive = price.change24h >= 0

                    return (
                        <div
                            key={vault.symbol}
                            className="glass rounded-xl p-5 md:p-6 transition-transform hover:-translate-y-1"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-base md:text-lg font-bold">
                                        {meta.ticker}
                                    </h3>
                                    <p className="text-xs text-white/40">
                                        {meta.name}
                                    </p>
                                </div>

                                <span
                                    className={`text-xs font-bold px-2 py-1 rounded ${positive
                                            ? "text-green-500 bg-green-500/10"
                                            : "text-red-500 bg-red-500/10"
                                        }`}
                                >
                                    {positive ? "+" : ""}
                                    {price.change24h}%
                                </span>
                            </div>

                            <p className="text-xl md:text-2xl font-bold">
                                ${price.price.toFixed(2)}
                            </p>

                            <p className="text-[10px] uppercase tracking-wider text-white/30 mt-1">
                                Live Price
                            </p>
                        </div>
                    )
                })}
            </div>

            {/* VAULT TABLE */}
            <div className="pt-4">
                <Vault address={address} vaults={stockVaults} />
            </div>
        </div>
    )
}
