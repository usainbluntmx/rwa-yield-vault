import { useState } from "react"
import "./App.css"
import Navbar from "./components/Navbar"
import Vault from "./pages/Vault"
import Profile from "./pages/Profile"
import Faucet from "./pages/Faucet"
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

function App() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  const [view, setView] = useState<"vault" | "profile" | "faucet">("vault")

  return (
    <div className="App">
      <h1>RWA Yield Vault</h1>

      <Navbar
        view={view}
        onChange={setView}
        isConnected={isConnected}
        address={address}
      />

      <div style={{ paddingTop: "64px" }}>
        {!isConnected && (
          <button onClick={() => open()}>
            Conectar Wallet
          </button>
        )}

        {isConnected && view === "vault" && (
          <Vault
            address={address}
            vaults={VAULTS}
          />
        )}

        {isConnected && view === "profile" && <Profile />}
        {isConnected && view === "faucet" && <Faucet />}
      </div>
    </div>
  )
}

export default App
