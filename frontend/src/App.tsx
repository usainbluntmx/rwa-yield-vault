import { useEffect, useState } from "react"
import { ethers } from "ethers"
import vaultArtifact from "./contracts/RWAYieldVault.json"
import {
  RWA_VAULT_ADDRESS,
  MANTLE_SEPOLIA_CHAIN_ID,
} from "./contracts/config"
import "./App.css"

/* =========================
   Reown AppKit
========================= */
import {
  createAppKit,
  useAppKit,
  useAppKitAccount,
} from "@reown/appkit/react"
import { EthersAdapter } from "@reown/appkit-adapter-ethers"

const ethersAdapter = new EthersAdapter()

/* =========================
   Inicializar AppKit (UNA VEZ)
========================= */
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

  const [contract, setContract] = useState<ethers.Contract | null>(null)

  const [amount, setAmount] = useState("")
  const [balance, setBalance] = useState("0")
  const [loading, setLoading] = useState(false)
  const [txStatus, setTxStatus] = useState("")
  const [error, setError] = useState("")

  /* =========================
     Conectar Provider
  ========================= */
  useEffect(() => {
    if (!isConnected || !window.ethereum) return

    const setup = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(
        RWA_VAULT_ADDRESS,
        vaultArtifact.abi,
        signer
      )

      setContract(contract)
    }

    setup()
  }, [isConnected])

  /* =========================
     Leer balance
  ========================= */
  const loadBalance = async () => {
    if (!contract || !address) return
    const raw = await contract.balances(address)
    setBalance(ethers.formatEther(raw))
  }

  useEffect(() => {
    loadBalance()
  }, [contract])

  /* =========================
     Depositar
  ========================= */
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

  /* =========================
     Retirar
  ========================= */
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

  /* =========================
     UI
  ========================= */
  return (
    <div className="App">
      <h1>RWA Yield Vault</h1>

      {!isConnected ? (
        <button onClick={() => open()}>
          Conectar Wallet
        </button>
      ) : (
        <>
          <p>
            Wallet conectada:
            <br />
            <strong>{address}</strong>
          </p>

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

          <br />
          <br />

          <button onClick={deposit} disabled={loading}>
            Depositar
          </button>

          <button
            onClick={withdraw}
            disabled={loading}
            style={{ marginLeft: "1rem" }}
          >
            Retirar
          </button>

          <button
            type="button"
            onClick={withdrawMax}
            disabled={loading || balance === "0"}
            style={{ marginLeft: "1rem" }}
          >
            Retirar Todo
          </button>

          {txStatus && <p>{txStatus}</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      )}
    </div>
  )
}

export default App