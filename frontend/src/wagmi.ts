import { createConfig, http } from "wagmi"
import { mantleSepoliaTestnet } from "wagmi/chains"
import { walletConnect } from "wagmi/connectors"

export const config = createConfig({
    chains: [mantleSepoliaTestnet],
    connectors: [
        walletConnect({
            projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
        }),
    ],
    transports: {
        [mantleSepoliaTestnet.id]: http(),
    },
})
