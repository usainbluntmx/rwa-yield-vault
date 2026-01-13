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
    {
        symbol: "MNT",
        vaultAddress: "0x58468524C30935d9C483f3c9B37AB33e911D3757",
        decimals: 18,
        type: "custom",
    },
    {
        symbol: "USDC",
        vaultAddress: "0x5A870E83F8d9bdB093D387A5d632F92E402ABCaC",
        decimals: 6,
        type: "erc4626",
    },
    {
        symbol: "USDT",
        vaultAddress: "0xfFe99C05a0CB04e78257b4Ee0187416e135024c4",
        decimals: 6,
        type: "erc4626",
    },
    {
        symbol: "DAI",
        vaultAddress: "0xe09FD61247D5e9a827136FAbF6E58EcE6ABaea01",
        decimals: 18,
        type: "erc4626",
    },

    /* ----------------------------
       STOCK VAULTS
    ---------------------------- */
    {
        symbol: "AAPLx",
        vaultAddress: "0xc913FDD52e7331bee3619202D6AC0b7f337DcE68",
        decimals: 18,
        type: "erc4626",
    },
    {
        symbol: "TSLAx",
        vaultAddress: "0x14330330dB0A57C55c4aD8B8945c92c32Ce1aB21",
        decimals: 18,
        type: "erc4626",
    },
    {
        symbol: "NVDAx",
        vaultAddress: "0x23bCA52b518de45B83B3f2B4D92a066eee9a7636",
        decimals: 18,
        type: "erc4626",
    },
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
        if (!isConnected || !address) return
        if (didLoad.current) return
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
                    const abi =
                        vault.type === "erc4626"
                            ? erc4626VaultAbi
                            : customVaultAbi

                    const contract = new ethers.Contract(
                        vault.vaultAddress,
                        abi,
                        provider
                    )

                    if (vault.type === "custom") {
                        const deposits = await contract.queryFilter(
                            contract.filters.Deposit(address),
                            fromBlock,
                            latestBlock
                        )

                        const withdrawals = await contract.queryFilter(
                            contract.filters.Withdraw(address),
                            fromBlock,
                            latestBlock
                        )

                        for (const e of deposits) {
                            const event = e as ethers.EventLog
                            const block = await provider.getBlock(event.blockNumber)
                            if (!block) continue

                            txs.push({
                                type: "Deposit",
                                amount: ethers.formatUnits(
                                    event.args.amount,
                                    vault.decimals
                                ),
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
                                amount: ethers.formatUnits(
                                    event.args.amount,
                                    vault.decimals
                                ),
                                symbol: vault.symbol,
                                txHash: event.transactionHash,
                                timestamp: block.timestamp,
                            })
                        }
                    } else {
                        const deposits = await contract.queryFilter(
                            contract.filters.Deposit(null, address),
                            fromBlock,
                            latestBlock
                        )

                        const withdrawals = await contract.queryFilter(
                            contract.filters.Withdraw(null, null, address),
                            fromBlock,
                            latestBlock
                        )

                        for (const e of deposits) {
                            const event = e as ethers.EventLog
                            const block = await provider.getBlock(event.blockNumber)
                            if (!block) continue

                            txs.push({
                                type: "Deposit",
                                amount: ethers.formatUnits(
                                    event.args.assets,
                                    vault.decimals
                                ),
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
                                amount: ethers.formatUnits(
                                    event.args.assets,
                                    vault.decimals
                                ),
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
                    JSON.stringify({
                        history: latestTxs,
                        updatedAt: Date.now(),
                    })
                )
            } catch (err) {
                console.error("Error loading history:", err)
            } finally {
                setLoading(false)
            }
        }

        loadHistory()
    }, [isConnected, address])

    if (!isConnected) {
        return (
            <p className="text-center mt-20 text-slate-400">
                Connect your wallet to view your profile.
            </p>
        )
    }

    return (
        <main className="relative pt-28 pb-20 px-4 md:px-8 lg:px-20 max-w-[1200px] mx-auto">
            {/* PROFILE HEADER */}
            <div className="glass rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 mb-8">
                <div className="relative size-32 rounded-full bg-primary/20 flex items-center justify-center text-5xl">
                    🐓
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-2xl font-bold tracking-tight">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </h2>
                    <p className="text-slate-400 text-sm mt-1">
                        Wallet Connected
                    </p>
                </div>
            </div>

            {/* ACTIVITY TABLE */}
            <div className="glass rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">
                                Type
                            </th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">
                                Amount
                            </th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300">
                                Date
                            </th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-300 text-right">
                                TX
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                        {loading && (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                                    Loading history...
                                </td>
                            </tr>
                        )}

                        {!loading && history.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-slate-400">
                                    There are no recent transactions.
                                </td>
                            </tr>
                        )}

                        {history.map(tx => (
                            <tr key={tx.txHash} className="glass-hover transition-colors">
                                <td className="px-6 py-5 font-medium">
                                    {tx.type}
                                </td>
                                <td className="px-6 py-5 font-bold">
                                    {tx.amount} {tx.symbol}
                                </td>
                                <td className="px-6 py-5 text-slate-300 text-sm">
                                    {new Date(tx.timestamp * 1000).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <a
                                        href={`https://sepolia.mantlescan.xyz/tx/${tx.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="size-8 inline-flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                                    >
                                        <span className="material-symbols-outlined text-sm">
                                            ⮕
                                        </span>
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    )
}
