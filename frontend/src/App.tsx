import { useEffect, useState } from "react"
import Navbar from "./components/Navbar"
import Vault from "./pages/Vault"
import Profile from "./pages/Profile"
import Faucet from "./pages/Faucet"
import Landing from "./pages/Landing"

import { STABLE_VAULTS } from "./constants/vaults"
import StocksVault from "./pages/StocksVault"

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

/* ----------------------------
   VIEWS
---------------------------- */
export type View = "vault" | "stocks" | "profile" | "faucet"

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
      {/* NAVBAR */}
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

      {/* LANDING (NOT CONNECTED) */}
      {!isConnected && (
        <>
          <Landing />

          {/* CONNECT CTA */}
          <div className="fixed inset-x-0 bottom-6 flex justify-center px-4 z-40">
            <button
              onClick={() => open()}
              className="w-full max-w-sm flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-full text-base font-semibold shadow-xl shadow-primary/30 hover:opacity-90 active:scale-95 transition-all"
            >
              Connect Wallet
            </button>
          </div>
        </>
      )}

      {/* APP (CONNECTED) */}
      {isConnected && (
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-24">
          {/* STABLE VAULTS */}
          {view === "vault" && (
            <Vault address={address} vaults={STABLE_VAULTS} />
          )}

          {/* STOCK VAULTS */}
          {view === "stocks" && <StocksVault address={address} />}

          {/* PROFILE */}
          {view === "profile" && <Profile />}

          {/* FAUCET */}
          {view === "faucet" && <Faucet />}
        </main>
      )}
    </div>
  )
}

export default App
