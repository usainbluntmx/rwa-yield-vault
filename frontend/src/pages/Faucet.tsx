import { ethers } from "ethers"
import { useAppKitAccount, useAppKitProvider } from "@reown/appkit/react"
import { TOKENS, FAUCET_ADDRESS } from "../constants/tokens"
import { faucetAbi } from "../abi/faucetAbi"
import { mockErc20Abi } from "../abi/mockErc20Abi"
import { useEffect, useState } from "react"
import type { Eip1193Provider } from "ethers"
import { ASSET_LOGOS } from "../utils/assets"

export default function FaucetPage() {
    const { address, isConnected } = useAppKitAccount()
    const { walletProvider } = useAppKitProvider("eip155")

    const [balances, setBalances] = useState<Record<string, string>>({})
    const [loadingToken, setLoadingToken] = useState<string | null>(null)

    /* ----------------------------
       LOAD BALANCES
    ---------------------------- */
    const loadBalances = async () => {
        if (!walletProvider || !address) return
        if (typeof (walletProvider as any).request !== "function") return

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

    /* ----------------------------
       FAUCET REQUEST
    ---------------------------- */
    const request = async (tokenAddress: string) => {
        if (!walletProvider || !address) return
        if (typeof (walletProvider as any).request !== "function") return

        try {
            setLoadingToken(tokenAddress)

            const provider = new ethers.BrowserProvider(
                walletProvider as Eip1193Provider
            )
            const signer = await provider.getSigner()

            const faucet = new ethers.Contract(
                FAUCET_ADDRESS,
                faucetAbi,
                signer
            )

            const tx = await faucet.requestTokens(tokenAddress)
            await tx.wait()

            await loadBalances()
        } catch (err) {
            console.error("❌ Faucet error:", err)
        } finally {
            setLoadingToken(null)
        }
    }

    useEffect(() => {
        if (isConnected) loadBalances()
    }, [isConnected])

    /* ----------------------------
       UI
    ---------------------------- */
    if (!isConnected) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
                Connect your wallet to use the faucet.
            </div>
        )
    }

    return (
        <div className="relative overflow-hidden">
            {/* Ambient glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-[1000px] mx-auto px-4 py-12">
                {/* Heading */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div>
                        <h1 className="text-5xl font-black tracking-tight">
                            Testnet Faucet
                        </h1>
                        <p className="text-slate-400 text-lg mt-2">
                            Claim test tokens for Mantle Sepolia.
                        </p>
                    </div>

                    <a
                        href="https://sepolia.mantlescan.xyz/address/0x0cc9caccadfc678fc80277705e9a4329cbc3283b"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-all"
                    >
                        View Explorer
                    </a>
                </div>

                {/* Faucet Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {TOKENS.map((token) => {
                        const isLoading = loadingToken === token.address

                        return (
                            <div
                                key={token.symbol}
                                className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl p-8 flex flex-col items-center hover:scale-[1.02] transition-transform"
                            >
                                {/* ICON */}
                                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/5 border border-white/10 mb-6 shadow-xl overflow-hidden">
                                    {ASSET_LOGOS[token.symbol] ? (
                                        <img
                                            src={ASSET_LOGOS[token.symbol]}
                                            alt={token.symbol}
                                            className="w-10 h-10 object-contain"
                                        />
                                    ) : (
                                        <span className="text-xl font-black text-primary">
                                            {token.symbol[0]}
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-2xl font-bold mb-1">
                                    {token.symbol}
                                </h2>

                                <p className="text-slate-400 mb-8">
                                    Balance:{" "}
                                    <span className="text-white">
                                        {balances[token.symbol] ?? "0"}
                                    </span>
                                </p>

                                <button
                                    onClick={() => request(token.address)}
                                    disabled={isLoading}
                                    className="w-full h-14 rounded-full bg-primary hover:bg-primary/80 text-white font-bold transition-all shadow-lg shadow-primary/30 disabled:opacity-50"
                                >
                                    {isLoading
                                        ? "Processing..."
                                        : `Claim ${token.amount ?? "1000"} ${token.symbol}`}
                                </button>
                            </div>
                        )
                    })}
                </div>

                {/* Info */}
                <div className="mt-12 p-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-xl flex gap-4">
                    <span className="material-symbols-outlined text-primary mt-1">
                        info
                    </span>
                    <div>
                        <p className="font-bold text-sm mb-1">Note</p>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            You can claim test tokens once every 24 hours per
                            wallet. These tokens are for testing purposes only
                            on Mantle Sepolia.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
