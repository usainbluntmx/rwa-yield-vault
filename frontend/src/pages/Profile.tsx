import { useEffect, useState, useRef } from "react"
import { ethers } from "ethers"
import { useAppKitAccount } from "@reown/appkit/react"

import { customVaultAbi } from "../abi/customVaultAbi"
import { erc4626VaultAbi } from "../abi/erc4626VaultAbi"

/* ----------------------------
   CONFIG
---------------------------- */

const RPC_HTTP = "https://rpc.sepolia.mantle.xyz"
const BLOCK_LOOKBACK = 8000
const MAX_TX = 14
const HISTORY_CACHE_PREFIX = "vault-history"

const VAULTS = [
    { symbol: "MNT", vaultAddress: "0x58468524C30935d9C483f3c9B37AB33e911D3757", decimals: 18, type: "custom" },
    { symbol: "USDC", vaultAddress: "0x5A870E83F8d9bdB093D387A5d632F92E402ABCaC", decimals: 6, type: "erc4626" },
    { symbol: "USDT", vaultAddress: "0xfFe99C05a0CB04e78257b4Ee0187416e135024c4", decimals: 6, type: "erc4626" },
    { symbol: "DAI", vaultAddress: "0xe09FD61247D5e9a827136FAbF6E58EcE6ABaea01", decimals: 18, type: "erc4626" },
    { symbol: "AAPLx", vaultAddress: "0xc913FDD52e7331bee3619202D6AC0b7f337DcE68", decimals: 18, type: "erc4626" },
    { symbol: "TSLAx", vaultAddress: "0x14330330dB0A57C55c4aD8B8945c92c32Ce1aB21", decimals: 18, type: "erc4626" },
    { symbol: "NVDAx", vaultAddress: "0x23bCA52b518de45B83B3f2B4D92a066eee9a7636", decimals: 18, type: "erc4626" },
] as const

type TxItem = {
    type: "Deposit" | "Withdraw"
    amount: string
    symbol: string
    txHash: string
    timestamp: number
}

/* ----------------------------
   COMPONENT
---------------------------- */

export default function Profile() {
    const { address, isConnected } = useAppKitAccount()

    const [history, setHistory] = useState<TxItem[]>([])
    const [loading, setLoading] = useState(false)
    const didLoad = useRef(false)

    useEffect(() => {
        if (!isConnected || !address || didLoad.current) return
        didLoad.current = true

        const cacheKey = `${HISTORY_CACHE_PREFIX}-${address}`

        const loadHistory = async () => {
            try {
                setLoading(true)

                const cached = localStorage.getItem(cacheKey)
                if (cached) {
                    const parsed = JSON.parse(cached)
                    setHistory(parsed.history || [])
                }

                const provider = new ethers.JsonRpcProvider(RPC_HTTP)
                const latestBlock = await provider.getBlockNumber()
                const fromBlock = Math.max(latestBlock - BLOCK_LOOKBACK, 0)

                const txs: TxItem[] = []

                for (const vault of VAULTS) {
                    const abi = vault.type === "erc4626" ? erc4626VaultAbi : customVaultAbi
                    const contract = new ethers.Contract(vault.vaultAddress, abi, provider)

                    if (vault.type === "custom") {
                        const deposits = await contract.queryFilter(
                            contract.filters.Deposit(address),
                            fromBlock
                        )

                        const withdrawals = await contract.queryFilter(
                            contract.filters.Withdraw(address),
                            fromBlock
                        )

                        for (const e of deposits) {
                            const event = e as ethers.EventLog
                            const block = await provider.getBlock(event.blockNumber)
                            if (!block) continue

                            txs.push({
                                type: "Deposit",
                                amount: ethers.formatUnits(event.args.amount, vault.decimals),
                                symbol: vault.symbol,
                                txHash: event.transactionHash,
                                timestamp: block.timestamp,
                            })
                        }

                        for (const e of withdrawals) {
                            const event = e as ethers.EventLog
                            const block = await provider.getBlock(event.blockNumber)
                            if (!block) continue

                            txs.push({
                                type: "Withdraw",
                                amount: ethers.formatUnits(event.args.amount, vault.decimals),
                                symbol: vault.symbol,
                                txHash: event.transactionHash,
                                timestamp: block.timestamp,
                            })
                        }
                    } else {
                        const deposits = await contract.queryFilter(
                            contract.filters.Deposit(null, address),
                            fromBlock
                        )

                        const withdrawals = await contract.queryFilter(
                            contract.filters.Withdraw(null, null, address),
                            fromBlock
                        )

                        for (const e of deposits) {
                            const event = e as ethers.EventLog
                            const block = await provider.getBlock(event.blockNumber)
                            if (!block) continue

                            txs.push({
                                type: "Deposit",
                                amount: ethers.formatUnits(event.args.assets, vault.decimals),
                                symbol: vault.symbol,
                                txHash: event.transactionHash,
                                timestamp: block.timestamp,
                            })
                        }

                        for (const e of withdrawals) {
                            const event = e as ethers.EventLog
                            const block = await provider.getBlock(event.blockNumber)
                            if (!block) continue

                            txs.push({
                                type: "Withdraw",
                                amount: ethers.formatUnits(event.args.assets, vault.decimals),
                                symbol: vault.symbol,
                                txHash: event.transactionHash,
                                timestamp: block.timestamp,
                            })
                        }
                    }

                }

                const latestTxs = txs
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, MAX_TX)

                setHistory(latestTxs)

                localStorage.setItem(
                    cacheKey,
                    JSON.stringify({ history: latestTxs, updatedAt: Date.now() })
                )
            } catch (err) {
                console.error("Error loading history:", err)
            } finally {
                setLoading(false)
            }
        }

        loadHistory()
    }, [isConnected, address])

    if (!isConnected || !address) {
        return (
            <p className="text-center mt-20 text-slate-400">
                Connect your wallet to view your profile.
            </p>
        )
    }

    return (
        <main className="max-w-[1200px] mx-auto px-4 md:px-8 pt-24 pb-20">
            {/* HEADER */}
            <div className="glass rounded-xl p-6 flex flex-col sm:flex-row items-center gap-4 mb-8">
                <div className="size-20 sm:size-24 rounded-full bg-primary/20 flex items-center justify-center text-4xl">
                    🐓
                </div>

                <div className="text-center sm:text-left">
                    <h2 className="text-xl sm:text-2xl font-bold">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </h2>
                    <p className="text-slate-400 text-sm">Wallet Connected</p>
                </div>
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block glass rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="px-6 py-4 text-left text-slate-300">Type</th>
                            <th className="px-6 py-4 text-left text-slate-300">Amount</th>
                            <th className="px-6 py-4 text-left text-slate-300">Date</th>
                            <th className="px-6 py-4 text-right text-slate-300">TX</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {history.map(tx => (
                            <tr key={tx.txHash}>
                                <td className="px-6 py-4 font-medium">{tx.type}</td>
                                <td className="px-6 py-4 font-bold">{tx.amount} {tx.symbol}</td>
                                <td className="px-6 py-4 text-sm text-slate-400">
                                    {new Date(tx.timestamp * 1000).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <a
                                        href={`https://sepolia.mantlescan.xyz/tx/${tx.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex size-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10"
                                    >
                                        ⮕
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden space-y-4">
                {loading && (
                    <p className="text-center text-slate-400">Loading history...</p>
                )}

                {!loading && history.length === 0 && (
                    <p className="text-center text-slate-400">
                        There are no recent transactions.
                    </p>
                )}

                {history.map(tx => (
                    <div
                        key={tx.txHash}
                        className="glass rounded-xl p-4 flex justify-between items-center"
                    >
                        <div>
                            <p className="font-bold">
                                {tx.type} · {tx.symbol}
                            </p>
                            <p className="text-sm text-slate-400">
                                {tx.amount}
                            </p>
                            <p className="text-xs text-slate-500">
                                {new Date(tx.timestamp * 1000).toLocaleDateString()}
                            </p>
                        </div>

                        <a
                            href={`https://sepolia.mantlescan.xyz/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="size-10 rounded-lg bg-white/5 flex items-center justify-center"
                        >
                            ⮕
                        </a>
                    </div>
                ))}
            </div>
        </main>
    )
}
