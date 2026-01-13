import { useEffect, useMemo, useState } from "react"
import { ethers } from "ethers"
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

/* ----------------------------
   HELPERS
---------------------------- */
const asAddress = (addr?: string) => {
    if (!addr || !ethers.isAddress(addr)) {
        throw new Error(`Invalid address: ${addr}`)
    }
    return addr
}

export default function Vault({ address, vaults }: VaultProps) {
    const [amounts, setAmounts] = useState<Record<string, string>>({})
    const [balances, setBalances] = useState<Record<string, string>>({})
    const [loadingVault, setLoadingVault] = useState<string | null>(null)
    const [status, setStatus] = useState("")

    /* ----------------------------
       PROVIDER
    ---------------------------- */
    const provider = useMemo(() => {
        if (!(window as any).ethereum) return null
        return new ethers.BrowserProvider((window as any).ethereum)
    }, [])

    /* ----------------------------
       LOAD BALANCES (ERC-4626 FIX)
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
        <div>
            <h1 className="text-5xl font-bold mb-10">Vaults</h1>

            <div className="rounded-xl overflow-hidden border border-white/10 backdrop-blur-xl bg-white/[0.03]">
                <table className="w-full text-left">
                    <thead className="bg-white/5">
                        <tr>
                            <th className="px-6 py-4 text-xs uppercase text-slate-400">Asset</th>
                            <th className="px-6 py-4 text-xs uppercase text-slate-400">Deposited</th>
                            <th className="px-6 py-4 text-xs uppercase text-slate-400">Amount</th>
                            <th className="px-6 py-4 text-xs uppercase text-slate-400">Yield</th>
                            <th className="px-6 py-4 text-xs uppercase text-slate-400 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-white/5">
                        {vaults.map((vault) => {
                            const isLoading = loadingVault === vault.symbol

                            /* -------- YIELD (SIMULATED BUT REALISTIC) -------- */
                            const apy = getHybridApy(vault.symbol as any)
                            const deposited = Number(balances[vault.symbol] ?? 0)

                            const dailyRate = getDailyYield(apy) / 100
                            const monthlyRate = getMonthlyYield(apy) / 100

                            const dailyGain = deposited * dailyRate
                            const monthlyGain = deposited * monthlyRate

                            return (
                                <tr key={vault.symbol}>
                                    <td className="px-6 py-5 font-semibold">
                                        {vault.symbol}
                                    </td>

                                    <td className="px-6 py-5 text-slate-300">
                                        {balances[vault.symbol] ?? "0"}
                                    </td>

                                    <td className="px-6 py-5">
                                        <input
                                            type="text"
                                            placeholder="0.0"
                                            value={amounts[vault.symbol] ?? ""}
                                            onChange={(e) =>
                                                setAmounts((prev) => ({
                                                    ...prev,
                                                    [vault.symbol]: e.target.value,
                                                }))
                                            }
                                            className="w-28 px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary outline-none"
                                        />
                                    </td>

                                    <td className="px-6 py-5">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-emerald-400">
                                                {apy}% APY
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                +{dailyGain.toFixed(6)} {vault.symbol} / day
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                +{monthlyGain.toFixed(6)} {vault.symbol} / month
                                            </span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => deposit(vault)}
                                                disabled={isLoading}
                                                className="px-4 py-2 rounded-full bg-primary text-white text-sm font-bold"
                                            >
                                                Deposit
                                            </button>

                                            <button
                                                onClick={() => withdraw(vault)}
                                                disabled={isLoading}
                                                className="px-4 py-2 rounded-full border border-primary text-primary text-sm font-bold"
                                            >
                                                Withdraw
                                            </button>

                                            <button
                                                onClick={() => withdraw(vault, true)}
                                                disabled={isLoading}
                                                className="px-4 py-2 rounded-full border border-white/20 text-slate-300 text-sm"
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

            {status && (
                <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    {status}
                </div>
            )}
        </div>
    )
}
