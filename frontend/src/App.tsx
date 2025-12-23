import { useEffect, useState } from "react"
import { ethers } from "ethers"
import vaultArtifact from "./contracts/RWAYieldVault.json"
import {
  RWA_VAULT_ADDRESS,
  MANTLE_SEPOLIA_CHAIN_ID,
} from "./contracts/config"
import "./App.css"

/* ─────────────────────────────────────────────── */
/* Mantle Sepolia Params                           */
/* ─────────────────────────────────────────────── */

const MANTLE_SEPOLIA_PARAMS = {
  chainId: "0x138B", // 5003
  chainName: "Mantle Sepolia Testnet",
  nativeCurrency: {
    name: "Mantle",
    symbol: "MNT",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.sepolia.mantle.xyz"],
  blockExplorerUrls: ["https://sepolia.mantlescan.xyz"],
}

function App() {
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>("0")
  const [amount, setAmount] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [txStatus, setTxStatus] = useState<string | null>(null)

  /* ─────────────────────────────────────────────── */
  /* Helpers                                         */
  /* ─────────────────────────────────────────────── */

  const getProvider = () => {
    if (!window.ethereum) {
      throw new Error("MetaMask no está instalado")
    }
    return new ethers.BrowserProvider(window.ethereum)
  }

  const switchToMantle = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MANTLE_SEPOLIA_PARAMS.chainId }],
      })
    } catch (err: any) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [MANTLE_SEPOLIA_PARAMS],
        })
      } else {
        throw err
      }
    }
  }

  /* ─────────────────────────────────────────────── */
  /* Wallet                                          */
  /* ─────────────────────────────────────────────── */

  const connectWallet = async () => {
    try {
      setError(null)
      setSuccess(null)

      const provider = getProvider()
      await switchToMantle()

      const accounts = await provider.send("eth_requestAccounts", [])
      const network = await provider.getNetwork()

      if (network.chainId !== MANTLE_SEPOLIA_CHAIN_ID) {
        setError("Conéctate a Mantle Sepolia Testnet")
        return
      }

      setAccount(accounts[0])
      await loadBalance(accounts[0])
    } catch (err) {
      console.error(err)
      setError("Error al conectar la wallet")
    }
  }

  const checkIfConnected = async () => {
    try {
      if (!window.ethereum) return

      const provider = getProvider()
      const accounts = await provider.send("eth_accounts", [])

      if (accounts.length > 0) {
        await switchToMantle()

        const network = await provider.getNetwork()
        if (network.chainId !== MANTLE_SEPOLIA_CHAIN_ID) return

        setAccount(accounts[0])
        await loadBalance(accounts[0])
      }
    } catch (err) {
      console.error(err)
    }
  }

  /* ─────────────────────────────────────────────── */
  /* Contract Reads                                  */
  /* ─────────────────────────────────────────────── */

  const loadBalance = async (user: string) => {
    try {
      const provider = getProvider()

      const contract = new ethers.Contract(
        RWA_VAULT_ADDRESS,
        vaultArtifact.abi,
        provider
      )

      const deposited = await contract.balances(user)
      setBalance(ethers.formatEther(deposited))
    } catch (err) {
      console.error(err)
      setError("No se pudo cargar el balance")
    }
  }

  /* ─────────────────────────────────────────────── */
  /* Contract Writes                                 */
  /* ─────────────────────────────────────────────── */

  const deposit = async () => {
    try {
      if (!amount || !account) return

      setLoading(true)
      setError(null)
      setSuccess(null)

      const provider = getProvider()
      const signer = await provider.getSigner()

      const contract = new ethers.Contract(
        RWA_VAULT_ADDRESS,
        vaultArtifact.abi,
        signer
      )

      const tx = await contract.deposit({
        value: ethers.parseEther(amount),
      })

      await tx.wait()
      await loadBalance(account)

      setSuccess("Depósito realizado exitosamente")
      setAmount("")
    } catch (err) {
      console.error(err)
      setError("Error al depositar")
    } finally {
      setLoading(false)
    }
  }

  const withdraw = async () => {
    try {
      if (!account || !amount) return

      setLoading(true)
      setError(null)
      setSuccess(null)

      const provider = getProvider()
      const signer = await provider.getSigner()

      const contract = new ethers.Contract(
        RWA_VAULT_ADDRESS,
        vaultArtifact.abi,
        signer
      )

      const amountWei = ethers.parseEther(amount)

      const deposited = await contract.balances(account)

      if (amountWei <= 0n) {
        setError("El monto debe ser mayor a 0")
        return
      }

      if (amountWei > deposited) {
        setError("No tienes suficiente balance")
        return
      }

      const tx = await contract.withdraw(amountWei)
      // setTxStatus("⏳ Transacción en proceso...")
      await tx.wait()

      await loadBalance(account)
      setAmount("")
      setSuccess("Retiro realizado exitosamente")
    } catch (err) {
      console.error(err)
      setError("Error al retirar")
    } finally {
      setLoading(false)
      setTxStatus(null)
    }
  }

  const withdrawMax = async () => {
    if (!balance || balance === "0") return
    setAmount(balance)
    await withdraw()
  }

  /* ─────────────────────────────────────────────── */
  /* Lifecycle                                       */
  /* ─────────────────────────────────────────────── */

  useEffect(() => {
    checkIfConnected()
  }, [])

  /* ─────────────────────────────────────────────── */
  /* UI                                              */
  /* ─────────────────────────────────────────────── */

  return (
    <div style={{ padding: "2rem" }}>
      <h1>RWA Yield Vault</h1>

      {!account ? (
        <button onClick={connectWallet}>Conectar Wallet</button>
      ) : (
        <>
          <p>
            Wallet conectada:
            <br />
            <strong>{account}</strong>
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
            type="button"
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

          {loading && <p>⏳ Transacción en proceso...</p>}
          {success && (
            <p style={{ color: "green", marginTop: "1rem" }}>
              ✅ {success}
            </p>
          )}
        </>
      )}

      {txStatus && <p>{txStatus}</p>}
      {error && (
        <p style={{ color: "red", marginTop: "1rem" }}>
          {error}
        </p>
      )}
    </div>
  )
}

export default App
