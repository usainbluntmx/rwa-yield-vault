import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useAppKitAccount } from "@reown/appkit/react"
import { vaultAbi } from "../abi/vaultAbi.ts"

const VAULT_ADDRESS = "0x58468524C30935d9C483f3c9B37AB33e911D3757"

type TxItem = {
    type: "Deposit" | "Withdraw"
    amount: string
    txHash: string
    timestamp: number
}

export default function Profile() {
    const { address, isConnected } = useAppKitAccount()

    const [history, setHistory] = useState<TxItem[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!isConnected || !address) return

        const loadHistory = async () => {
            try {
                setLoading(true)

                const rpcProvider = new ethers.JsonRpcProvider(
                    "https://rpc.sepolia.mantle.xyz"
                )

                const contract = new ethers.Contract(
                    VAULT_ADDRESS,
                    vaultAbi,
                    rpcProvider
                )

                const DEPLOY_BLOCK = 32507282
                const CHUNK_SIZE = 2000

                const latestBlock = await rpcProvider.getBlockNumber()

                const deposits: TxItem[] = []
                const withdrawals: TxItem[] = []

                for (let from = DEPLOY_BLOCK; from <= latestBlock; from += CHUNK_SIZE) {
                    const to = Math.min(from + CHUNK_SIZE - 1, latestBlock)

                    const depositEvents = await contract.queryFilter(
                        contract.filters.Deposit(address),
                        from,
                        to
                    )

                    const withdrawEvents = await contract.queryFilter(
                        contract.filters.Withdraw(address),
                        from,
                        to
                    )

                    for (const e of depositEvents) {
                        if (!("args" in e)) continue

                        const block = await rpcProvider.getBlock(e.blockNumber)

                        deposits.push({
                            type: "Deposit",
                            amount: ethers.formatEther(e.args.amount),
                            txHash: e.transactionHash,
                            timestamp: block ? block.timestamp : 0,
                        })
                    }

                    for (const e of withdrawEvents) {
                        if (!("args" in e)) continue

                        const block = await rpcProvider.getBlock(e.blockNumber)

                        withdrawals.push({
                            type: "Withdraw",
                            amount: ethers.formatEther(e.args.amount),
                            txHash: e.transactionHash,
                            timestamp: block ? block.timestamp : 0,
                        })
                    }
                }

                setHistory(
                    [...deposits, ...withdrawals].sort(
                        (a, b) => b.timestamp - a.timestamp
                    )
                )
            } catch (err) {
                console.error("Error cargando historial:", err)
            } finally {
                setLoading(false)
            }
        }

        loadHistory()
    }, [isConnected, address])

    if (!isConnected) {
        return <p>Conecta tu wallet para ver tu perfil.</p>
    }

    return (
        <div style={{ marginTop: "2rem" }}>
            <h2>Perfil</h2>

            <p>
                <strong>Wallet:</strong>
                <br />
                {address}
            </p>

            <h3 style={{ marginTop: "2rem" }}>Historial</h3>

            {loading && <p>Cargando historial...</p>}

            {!loading && history.length === 0 && (
                <p>No hay transacciones registradas.</p>
            )}

            {!loading && history.length > 0 && (
                <table style={{ width: "100%", marginTop: "1rem" }}>
                    <thead>
                        <tr>
                            <th align="left">Tipo</th>
                            <th align="left">Monto</th>
                            <th align="left">Fecha</th>
                            <th align="left">Tx</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((tx, idx) => (
                            <tr key={idx}>
                                <td>{tx.type}</td>
                                <td>{tx.amount} MNT</td>
                                <td>
                                    {new Date(tx.timestamp * 1000).toLocaleString()}
                                </td>
                                <td>
                                    <a
                                        href={`https://sepolia.mantlescan.xyz/tx/${tx.txHash}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Ver
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}
