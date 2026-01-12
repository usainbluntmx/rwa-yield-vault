import { useEffect, useState } from "react"
import Navbar from "./components/Navbar"
import Vault from "./pages/Vault"
import Profile from "./pages/Profile"
import Faucet from "./pages/Faucet"
import Landing from "./pages/Landing"
import { VAULTS } from "./constants/vaults"

import {
  createAppKit,
  useAppKit,
  useAppKitAccount,
} from "@reown/appkit/react"
import { EthersAdapter } from "@reown/appkit-adapter-ethers"
import { MANTLE_SEPOLIA_CHAIN_ID } from "./contracts/config"

const ethersAdapter = new EthersAdapter()

createAppKit({
  adapters: [ethersAdapter],
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  networks: [
    {
      id: Number(MANTLE_SEPOLIA_CHAIN_ID),
      name: "Mantle Sepolia",
      nativeCurrency: {
        name: "Mantle",
        symbol: "MNT",
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ["https://rpc.sepolia.mantle.xyz"],
        },
      },
    },
  ],
})

export type View = "vault" | "profile" | "faucet"

function App() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  const [view, setView] = useState<View>("vault")

  // 🔁 Al conectar wallet → Vault
  useEffect(() => {
    if (isConnected) {
      setView("vault")
    }
  }, [isConnected])

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white">
      {/* NAVBAR SIEMPRE VISIBLE */}
      <Navbar
        view={view}
        isConnected={isConnected}
        address={address}
        onNavigate={(nextView) => {
          if (!isConnected) {
            open()
          } else {
            setView(nextView)
          }
        }}
      />

      {/* LANDING */}
      {!isConnected && (
        <>
          <Landing />
          <div className="fixed bottom-16 w-full flex justify-center">
            <button
              onClick={() => open()}
              className="flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-full text-lg font-semibold shadow-xl shadow-primary/30 hover:opacity-90 active:scale-95 transition-all"
            >
              Connect Wallet
            </button>
          </div>
        </>
      )}

      {/* APP */}
      {isConnected && (
        <main className="max-w-[1200px] mx-auto px-6 pt-32 pb-20">
          {view === "vault" && <Vault address={address} vaults={VAULTS} />}
          {view === "profile" && <Profile />}
          {view === "faucet" && <Faucet />}
        </main>
      )}
    </div>
  )
}

export default App
