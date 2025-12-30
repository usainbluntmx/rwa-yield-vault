import { useEffect, useState } from "react"
import type { FC } from "react"
import { ethers } from "ethers"

export interface VaultProps {
    contract: ethers.Contract | null
    address?: string
}

const Vault: FC<VaultProps> = ({ contract, address }) => {
    const [amount, setAmount] = useState("")
    const [balance, setBalance] = useState("0")
    const [loading, setLoading] = useState(false)
    const [txStatus, setTxStatus] = useState("")
    const [error, setError] = useState("")

    const loadBalance = async () => {
        if (!contract || !address) return
        const raw = await contract.balances(address)
        setBalance(ethers.formatEther(raw))
    }

    useEffect(() => {
        loadBalance()
    }, [contract, address])

    const deposit = async () => {
        if (!contract || !amount) return
        try {
            setLoading(true)
            setTxStatus("⏳ Transacción en proceso...")

            const tx = await contract.deposit({
                value: ethers.parseEther(amount),
            })

            await tx.wait()
            await loadBalance()

            setTxStatus("✅ Depósito realizado")
            setAmount("")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const withdraw = async () => {
        if (!contract || !amount) return
        try {
            setLoading(true)
            setTxStatus("⏳ Transacción en proceso...")

            const tx = await contract.withdraw(
                ethers.parseEther(amount)
            )

            await tx.wait()
            await loadBalance()

            setTxStatus("✅ Retiro realizado")
            setAmount("")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const withdrawMax = async () => {
        if (!balance || balance === "0") return
        setAmount(balance)
        await withdraw()
    }

    return (
        <div>
            <h2>Vault</h2>

            <p>
                Balance depositado:
                <br />
                <strong>{balance} MNT</strong>
            </p>

            <input
                type="text"
                placeholder="Monto en MNT"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />

            <br /><br />

            <button onClick={deposit} disabled={loading}>
                Depositar
            </button>

            <button onClick={withdraw} disabled={loading} style={{ marginLeft: "1rem" }}>
                Retirar
            </button>

            <button
                onClick={withdrawMax}
                disabled={loading || balance === "0"}
                style={{ marginLeft: "1rem" }}
            >
                Retirar Todo
            </button>

            {txStatus && <p>{txStatus}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    )
}

export default Vault
