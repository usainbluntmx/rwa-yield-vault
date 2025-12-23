import React from "react"
import ReactDOM from "react-dom/client"
import { WagmiProvider } from "wagmi"
import { config } from "./wagmi"
import './index.css'
import App from "./App.tsx"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <App />
    </WagmiProvider>
  </React.StrictMode>
)
