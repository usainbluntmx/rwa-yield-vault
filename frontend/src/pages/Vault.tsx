import { useEffect, useMemo, useState } from "react"
import { ethers } from "ethers"
import { mockErc20Abi } from "../abi/mockErc20Abi"
import { vaultAbi, erc20VaultAbi } from "../abi/vaultAbi"

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
    const [amount, setAmount] = useState("")
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
                    // ✅ shares → assets
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
            } catch (err) {
                console.error(`Error loading balance for ${vault.symbol}`, err)
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
       DEPOSIT (YA CORRECTO)
    ---------------------------- */
    const deposit = async (vault: VaultConfig) => {
        if (!amount || !address || !provider) return

        try {
            setLoadingVault(vault.symbol)
            setStatus("⏳ Procesando depósito...")

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

            setAmount("")
            await loadBalances()
            setStatus("✅ Depósito exitoso")
        } catch (err: any) {
            console.error(err)
            setStatus(`❌ ${err.message ?? "Error en depósito"}`)
        } finally {
            setLoadingVault(null)
        }
    }

    /* ----------------------------
       WITHDRAW (ERC-4626 FIX)
    ---------------------------- */
    const withdraw = async (vault: VaultConfig, all = false) => {
        if (!provider || !address) return

        if (!all && !amount) {
            setStatus("❌ Ingresa un monto")
            return
        }

        try {
            setLoadingVault(vault.symbol)
            setStatus("⏳ Procesando retiro...")

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
                    setStatus("❌ Monto inválido")
                    return
                }

                const tx = await vaultContract.redeem(
                    shares,
                    address,
                    address
                )
                await tx.wait()
            }

            setAmount("")
            await loadBalances()
            setStatus("✅ Retiro exitoso")
        } catch (err: any) {
            console.error(err)
            setStatus(`❌ ${err.message ?? "Error en retiro"}`)
        } finally {
            setLoadingVault(null)
        }
    }

    /* ----------------------------
       UI
    ---------------------------- */
    return (
        <div>
            <h2>Vaults</h2>

            <input
                placeholder="Monto"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />

            <table width="100%" style={{ marginTop: "1rem" }}>
                <thead>
                    <tr>
                        <th>Vault</th>
                        <th>Depositado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {vaults.map((vault) => {
                        const isLoading = loadingVault === vault.symbol
                        return (
                            <tr key={vault.symbol}>
                                <td>{vault.symbol}</td>
                                <td>{balances[vault.symbol] ?? "0"}</td>
                                <td>
                                    <button
                                        onClick={() => deposit(vault)}
                                        disabled={isLoading}
                                    >
                                        Depositar
                                    </button>
                                    <button
                                        onClick={() => withdraw(vault)}
                                        disabled={isLoading}
                                        style={{ marginLeft: "0.5rem" }}
                                    >
                                        Retirar
                                    </button>
                                    <button
                                        onClick={() => withdraw(vault, true)}
                                        disabled={isLoading}
                                        style={{ marginLeft: "0.5rem" }}
                                    >
                                        Retirar Todo
                                    </button>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {status && <p>{status}</p>}
        </div>
    )
}
