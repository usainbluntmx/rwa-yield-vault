import { ethers } from "ethers"
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react"
import { TOKENS, FAUCET_ADDRESS } from "../constants/tokens"
import { faucetAbi } from "../abi/faucetAbi"
import { mockErc20Abi } from "../abi/mockErc20Abi"
import { useEffect, useState } from "react"
import type { Eip1193Provider } from "ethers"

export default function FaucetPage() {
    const { address, isConnected } = useAppKitAccount()
    const { walletProvider } = useAppKitProvider("eip155")

    const [balances, setBalances] = useState<Record<string, string>>({})
    const [loadingToken, setLoadingToken] = useState<string | null>(null)

    const loadBalances = async () => {
        if (!walletProvider || !address) return

        if (typeof (walletProvider as any).request !== "function") {
            console.warn("walletProvider no es EIP-1193 válido")
            return
        }

        const provider = new ethers.BrowserProvider(
            walletProvider as Eip1193Provider
        )

        const newBalances: Record<string, string> = {}

        for (const token of TOKENS) {
            const contract = new ethers.Contract(
                token.address,
                mockErc20Abi,
                provider
            )
            const balance = await contract.balanceOf(address)
            newBalances[token.symbol] = ethers.formatUnits(
                balance,
                token.decimals
            )
        }

        setBalances(newBalances)
    }

    const request = async (tokenAddress: string) => {
        if (!walletProvider || !address) return

        if (typeof (walletProvider as any).request !== "function") {
            console.error("walletProvider inválido:", walletProvider)
            return
        }

        try {
            setLoadingToken(tokenAddress)

            console.log("🟡 Iniciando faucet request")
            console.log("Token:", tokenAddress)
            console.log("Usuario:", address)

            const provider = new ethers.BrowserProvider(
                walletProvider as Eip1193Provider
            )

            const signer = await provider.getSigner()
            const signerAddress = await signer.getAddress()
            console.log("Signer:", signerAddress)

            const faucet = new ethers.Contract(
                FAUCET_ADDRESS,
                faucetAbi,
                signer
            )

            console.log("⛓️ Enviando transacción...")
            const tx = await faucet.requestTokens(tokenAddress)
            console.log("📨 Tx enviada:", tx.hash)

            await tx.wait()
            console.log("✅ Tx confirmada")

            await loadBalances()
        } catch (err) {
            console.error("❌ Error en faucet:", err)
        } finally {
            setLoadingToken(null)
        }
    }

    useEffect(() => {
        if (isConnected) loadBalances()
    }, [isConnected])

    if (!isConnected) {
        return <p>Conecta tu wallet.</p>
    }

    return (
        <div style={{ marginTop: "2rem" }}>
            <h2>Token Faucet</h2>

            {TOKENS.map((token) => (
                <div key={token.symbol} style={{ marginBottom: "1rem" }}>
                    <strong>{token.symbol}</strong>
                    <p>Balance: {balances[token.symbol] ?? "0"}</p>
                    <button
                        onClick={() => request(token.address)}
                        disabled={loadingToken === token.address}
                    >
                        {loadingToken === token.address
                            ? "Procesando..."
                            : `Obtener ${token.symbol}`}
                    </button>
                </div>
            ))}
        </div>
    )
}
