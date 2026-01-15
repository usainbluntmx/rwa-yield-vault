import { useEffect, useMemo, useState } from "react"
import { ethers } from "ethers"
import { useAppKitProvider } from "@reown/appkit/react"

import { mockErc20Abi } from "../abi/mockErc20Abi"
import { vaultAbi, erc20VaultAbi } from "../abi/vaultAbi"
import {
    getHybridApy,
    getDailyYield,
    getMonthlyYield,
} from "../utils/yieldEngine"

export interface VaultConfig {
    symbol: string
    decimals: number
    isNative: boolean
    tokenAddress?: string
    vaultAddress: string
}

interface VaultProps {
    address?: string
    vaults: VaultConfig[]
}

export default function Vault({ address, vaults }: VaultProps) {
    const { walletProvider } = useAppKitProvider("eip155")

    const [amounts, setAmounts] = useState<Record<string, string>>({})
    const [balances, setBalances] = useState<Record<string, string>>({})
    const [loadingVault, setLoadingVault] = useState<string | null>(null)
    const [status, setStatus] = useState("")

    /* ----------------------------
       PROVIDER (DESKTOP + MOBILE)
    ---------------------------- */
    const provider = useMemo(() => {
        if (!walletProvider) return null

        return new ethers.BrowserProvider(
            walletProvider as unknown as ethers.Eip1193Provider
        )
    }, [walletProvider])


    /* ----------------------------
       LOAD BALANCES
    ---------------------------- */
    const loadBalances = async () => {
        if (!address || !provider) return

        const next: Record<string, string> = {}

        for (const vault of vaults) {
            try {
                const contract = new ethers.Contract(
                    vault.vaultAddress,
                    vault.isNative ? vaultAbi : erc20VaultAbi,
                    provider
                )

                if (vault.isNative) {
                    const raw: bigint = await contract.balances(address)
                    next[vault.symbol] = ethers.formatEther(raw)
                } else {
                    const shares: bigint = await contract.balanceOf(address)
                    const assets: bigint =
                        shares === 0n
                            ? 0n
                            : await contract.convertToAssets(shares)

                    next[vault.symbol] = ethers.formatUnits(
                        assets,
                        vault.decimals
                    )
                }
            } catch {
                next[vault.symbol] = "0"
            }
        }

        setBalances(next)
    }

    useEffect(() => {
        loadBalances()
        const interval = setInterval(loadBalances, 15_000)
        return () => clearInterval(interval)
    }, [address, provider])

    /* ----------------------------
       DEPOSIT
    ---------------------------- */
    const deposit = async (vault: VaultConfig) => {
        const amount = amounts[vault.symbol]
        if (!amount || !address || !provider) return

        try {
            setLoadingVault(vault.symbol)
            setStatus("⏳ Processing deposit...")

            const signer = await provider.getSigner()
            const vaultContract = new ethers.Contract(
                vault.vaultAddress,
                vault.isNative ? vaultAbi : erc20VaultAbi,
                signer
            )

            if (vault.isNative) {
                const tx = await vaultContract.deposit({
                    value: ethers.parseEther(amount),
                })
                await tx.wait()
            } else {
                const token = new ethers.Contract(
                    vault.tokenAddress!,
                    mockErc20Abi,
                    signer
                )

                const parsed = ethers.parseUnits(amount, vault.decimals)
                const allowance: bigint = await token.allowance(
                    address,
                    vault.vaultAddress
                )

                if (allowance < parsed) {
                    const approveTx = await token.approve(
                        vault.vaultAddress,
                        parsed
                    )
                    await approveTx.wait()
                }

                const tx = await vaultContract.deposit(parsed, address)
                await tx.wait()
            }

            setAmounts((prev) => ({ ...prev, [vault.symbol]: "" }))
            await loadBalances()
            setStatus("✅ Deposit successful")
        } catch (err: any) {
            setStatus(`❌ ${err.message ?? "Deposit error"}`)
        } finally {
            setLoadingVault(null)
        }
    }

    /* ----------------------------
       WITHDRAW
    ---------------------------- */
    const withdraw = async (vault: VaultConfig, all = false) => {
        const amount = amounts[vault.symbol]
        if (!provider || !address) return

        if (!all && !amount) {
            setStatus("❌ Enter an amount")
            return
        }

        try {
            setLoadingVault(vault.symbol)
            setStatus("⏳ Processing withdrawal...")

            const signer = await provider.getSigner()
            const vaultContract = new ethers.Contract(
                vault.vaultAddress,
                vault.isNative ? vaultAbi : erc20VaultAbi,
                signer
            )

            if (vault.isNative) {
                const value = all ? balances[vault.symbol] : amount
                const tx = await vaultContract.withdraw(
                    ethers.parseEther(value)
                )
                await tx.wait()
            } else {
                const shares: bigint = all
                    ? await vaultContract.balanceOf(address)
                    : await vaultContract.convertToShares(
                        ethers.parseUnits(amount, vault.decimals)
                    )

                if (shares === 0n) {
                    setStatus("❌ Invalid amount")
                    return
                }

                const tx = await vaultContract.redeem(
                    shares,
                    address,
                    address
                )
                await tx.wait()
            }

            setAmounts((prev) => ({ ...prev, [vault.symbol]: "" }))
            await loadBalances()
            setStatus("✅ Withdrawal successful")
        } catch (err: any) {
            setStatus(`❌ ${err.message ?? "Withdraw error"}`)
        } finally {
            setLoadingVault(null)
        }
    }

    /* ----------------------------
       UI
    ---------------------------- */
    return (
        <div className="space-y-10">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                        Vault Dashboard
                    </h1>
                    <p className="mt-2 text-slate-400 max-w-xl">
                        Deposit assets into on-chain vaults and earn yield
                        through automated strategies.
                    </p>
                </div>

                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest w-fit">
                    <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                    Network Active
                </span>
            </div>

            {/* VAULT TABLE */}
            <div className="rounded-2xl border border-white/10 backdrop-blur-xl bg-white/[0.03] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left">
                        <thead className="bg-white/[0.04]">
                            <tr>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest text-slate-400">
                                    Asset
                                </th>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest text-slate-400">
                                    Deposited
                                </th>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest text-slate-400">
                                    Amount
                                </th>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest text-slate-400">
                                    Yield
                                </th>
                                <th className="px-6 py-4 text-xs uppercase tracking-widest text-slate-400 text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5">
                            {vaults.map((vault) => {
                                const isLoading = loadingVault === vault.symbol

                                const apy = getHybridApy(vault.symbol as any)
                                const deposited = Number(balances[vault.symbol] ?? 0)

                                const dailyGain =
                                    deposited * (getDailyYield(apy) / 100)
                                const monthlyGain =
                                    deposited * (getMonthlyYield(apy) / 100)

                                return (
                                    <tr
                                        key={vault.symbol}
                                        className="hover:bg-white/[0.04] transition-colors"
                                    >
                                        {/* ASSET */}
                                        <td className="px-6 py-6 font-bold text-lg">
                                            {vault.symbol}
                                        </td>

                                        {/* DEPOSITED */}
                                        <td className="px-6 py-6 text-slate-300">
                                            {balances[vault.symbol] ?? "0"}
                                        </td>

                                        {/* AMOUNT INPUT */}
                                        <td className="px-6 py-6">
                                            <input
                                                type="text"
                                                placeholder="0.0"
                                                value={amounts[vault.symbol] ?? ""}
                                                onChange={(e) =>
                                                    setAmounts((prev) => ({
                                                        ...prev,
                                                        [vault.symbol]:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-28 px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary outline-none text-sm"
                                            />
                                        </td>

                                        {/* YIELD */}
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-emerald-400">
                                                    {apy}% APY
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    +{dailyGain.toFixed(6)} / day
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    +{monthlyGain.toFixed(6)} / month
                                                </span>
                                            </div>
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex flex-col sm:flex-row justify-end gap-2">
                                                <button
                                                    onClick={() =>
                                                        deposit(vault)
                                                    }
                                                    disabled={isLoading}
                                                    className="px-4 py-2 rounded-full bg-primary hover:bg-primary/80 text-white text-sm font-bold transition-all disabled:opacity-50"
                                                >
                                                    Deposit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        withdraw(vault)
                                                    }
                                                    disabled={isLoading}
                                                    className="px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 text-sm font-bold transition-all disabled:opacity-50"
                                                >
                                                    Withdraw
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        withdraw(vault, true)
                                                    }
                                                    disabled={isLoading}
                                                    className="px-4 py-2 rounded-full border border-white/20 text-slate-300 hover:bg-white/5 text-sm transition-all disabled:opacity-50"
                                                >
                                                    Withdraw All
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* STATUS */}
            {status && (
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/10 text-sm">
                    {status}
                </div>
            )}
        </div>
    )

}
