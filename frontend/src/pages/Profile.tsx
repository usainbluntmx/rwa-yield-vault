import { useEffect, useState, useRef } from "react"
import { ethers } from "ethers"
import { useAppKitAccount } from "@reown/appkit/react"
import { vaultAbi } from "../abi/vaultAbi"

const VAULT_ADDRESS = "0x58468524C30935d9C483f3c9B37AB33e911D3757"
const RPC_HTTP = "https://rpc.sepolia.mantle.xyz"

const BLOCK_LOOKBACK = 5000
const MAX_TX = 9
const HISTORY_CACHE_PREFIX = "vault-history"

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

    const didLoad = useRef(false)

    useEffect(() => {
        if (!isConnected || !address) return
        if (didLoad.current) return
        didLoad.current = true

        const cacheKey = `${HISTORY_CACHE_PREFIX}-${address}`

        const loadHistory = async () => {
            try {
                setLoading(true)

                // 1️⃣ cache inmediato
                const cached = localStorage.getItem(cacheKey)
                if (cached) {
                    const parsed = JSON.parse(cached)
                    setHistory(parsed.history || [])
                }

                // 2️⃣ escaneo rápido
                const provider = new ethers.JsonRpcProvider(RPC_HTTP)
                const contract = new ethers.Contract(
                    VAULT_ADDRESS,
                    vaultAbi,
                    provider
                )

                const latestBlock = await provider.getBlockNumber()
                const fromBlock = Math.max(latestBlock - BLOCK_LOOKBACK, 0)

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

                const txs: TxItem[] = []

                for (const e of deposits) {
                    const event = e as ethers.EventLog
                    const block = await provider.getBlock(event.blockNumber)
                    if (!block) continue

                    txs.push({
                        type: "Deposit",
                        amount: ethers.formatEther(event.args[1]),
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
                        amount: ethers.formatEther(event.args[1]),
                        txHash: event.transactionHash,
                        timestamp: block.timestamp,
                    })
                }

                const latestTxs = txs
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, MAX_TX)

                setHistory(latestTxs)

                // 3️⃣ actualizar cache
                localStorage.setItem(
                    cacheKey,
                    JSON.stringify({
                        history: latestTxs,
                        updatedAt: Date.now(),
                    })
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

            <h3 style={{ marginTop: "2rem" }}>Últimas transacciones</h3>

            {loading && <p>Cargando historial...</p>}

            {!loading && history.length === 0 && (
                <p>No hay transacciones recientes.</p>
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
                        {history.map(tx => (
                            <tr key={tx.txHash}>
                                <td>{tx.type}</td>
                                <td>{tx.amount} MNT</td>
                                <td>{new Date(tx.timestamp * 1000).toLocaleString()}</td>
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
