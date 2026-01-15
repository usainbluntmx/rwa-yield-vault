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

const avatarKey = (address: string) => `profile-avatar-${address}`
const nicknameKey = (address: string) => `profile-nickname-${address}`

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

    /* ----------------------------
         AVATAR & NICKNAME STATE
      ---------------------------- */

    const [avatar, setAvatar] = useState<string | null>(null)
    const [nickname, setNickname] = useState("")
    const [editingName, setEditingName] = useState(false)

    /* ----------------------------
       LOAD PROFILE DATA
    ---------------------------- */

    useEffect(() => {
        if (!address) return

        const savedAvatar = localStorage.getItem(avatarKey(address))
        const savedNickname = localStorage.getItem(nicknameKey(address))

        if (savedAvatar) setAvatar(savedAvatar)
        if (savedNickname) setNickname(savedNickname)
    }, [address])

    const handleAvatarUpload = (file: File) => {
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            setAvatar(result)
            localStorage.setItem(avatarKey(address!), result)
        }
        reader.readAsDataURL(file)
    }

    const saveNickname = () => {
        localStorage.setItem(nicknameKey(address!), nickname.trim())
        setEditingName(false)
    }

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
        <main className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-28 pb-20 space-y-10">
            {/* PROFILE HEADER */}
            <section className="glass rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-6 text-center">
                {/* AVATAR */}
                <label className="relative cursor-pointer group">
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files && handleAvatarUpload(e.target.files[0])}
                    />

                    <div className="size-28 rounded-full overflow-hidden ring-4 ring-primary/10 bg-primary/20 flex items-center justify-center">
                        {avatar ? (
                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl">🐓</span>
                        )}
                    </div>

                    <span className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold transition">
                        Change
                    </span>
                </label>

                {/* NAME */}
                <div>
                    {editingName ? (
                        <input
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            onBlur={saveNickname}
                            onKeyDown={(e) => e.key === "Enter" && saveNickname()}
                            autoFocus
                            className="bg-transparent border-b border-primary text-2xl font-bold text-center outline-none"
                        />
                    ) : (
                        <h2
                            onClick={() => setEditingName(true)}
                            className="text-2xl sm:text-3xl font-bold cursor-pointer"
                        >
                            {nickname || `${address.slice(0, 6)}...${address.slice(-4)}`}
                        </h2>
                    )}

                    <p className="mt-1 text-sm text-slate-400">
                        Click your name to edit · Stored locally
                    </p>
                </div>

                <button
                    onClick={() => navigator.clipboard.writeText(address)}
                    className="px-5 h-11 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-semibold transition-all"
                >
                    Copy Address
                </button>
            </section>

            {/* ACTIVITY */}
            <section className="space-y-4">
                {/* TITLE */}
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-2xl font-bold tracking-tight">
                        Recent Activity
                    </h3>
                    <span className="text-xs text-slate-400">
                        Last on-chain interactions
                    </span>
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden md:block glass rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest text-slate-400">
                                    Type
                                </th>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest text-slate-400">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest text-slate-400">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest text-slate-400 text-right">
                                    Transaction
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5">
                            {loading && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-8 text-center text-slate-400"
                                    >
                                        Loading activity...
                                    </td>
                                </tr>
                            )}

                            {!loading && history.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-8 text-center text-slate-400"
                                    >
                                        No recent activity found.
                                    </td>
                                </tr>
                            )}

                            {history.map((tx) => {
                                const positive = tx.type === "Deposit"

                                return (
                                    <tr
                                        key={tx.txHash}
                                        className="hover:bg-white/[0.04] transition-colors"
                                    >
                                        <td className="px-6 py-5">
                                            <span
                                                className={`inline-flex items-center gap-2 font-semibold ${positive
                                                    ? "text-emerald-400"
                                                    : "text-red-400"
                                                    }`}
                                            >
                                                {positive ? "Deposit" : "Withdraw"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-5 font-bold">
                                            {tx.amount} {tx.symbol}
                                        </td>

                                        <td className="px-6 py-5 text-sm text-slate-400">
                                            {new Date(
                                                tx.timestamp * 1000
                                            ).toLocaleDateString()}
                                        </td>

                                        <td className="px-6 py-5 text-right">
                                            <a
                                                href={`https://sepolia.mantlescan.xyz/tx/${tx.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex size-9 items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 transition-all"
                                            >
                                                ⮕
                                            </a>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE CARDS */}
                <div className="md:hidden space-y-4">
                    {loading && (
                        <p className="text-center text-slate-400">
                            Loading activity...
                        </p>
                    )}

                    {!loading && history.length === 0 && (
                        <p className="text-center text-slate-400">
                            No recent activity found.
                        </p>
                    )}

                    {history.map((tx) => {
                        const positive = tx.type === "Deposit"

                        return (
                            <div
                                key={tx.txHash}
                                className="glass rounded-xl p-4 flex items-center justify-between"
                            >
                                <div className="space-y-1">
                                    <p
                                        className={`font-bold ${positive
                                            ? "text-emerald-400"
                                            : "text-red-400"
                                            }`}
                                    >
                                        {tx.type} · {tx.symbol}
                                    </p>

                                    <p className="text-sm text-slate-300">
                                        {tx.amount}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                        {new Date(
                                            tx.timestamp * 1000
                                        ).toLocaleDateString()}
                                    </p>
                                </div>

                                <a
                                    href={`https://sepolia.mantlescan.xyz/tx/${tx.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="size-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
                                >
                                    ⮕
                                </a>
                            </div>
                        )
                    })}
                </div>
            </section>
        </main>
    )

}
