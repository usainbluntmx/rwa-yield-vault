import type { VaultConfig } from "../pages/Vault"

export const VAULTS: VaultConfig[] = [
    {
        symbol: "MNT",
        decimals: 18,
        isNative: true,
        vaultAddress: import.meta.env.VITE_MNT_VAULT!,
    },
    {
        symbol: "USDC",
        decimals: 6,
        isNative: false,
        tokenAddress: import.meta.env.VITE_USDC_ADDRESS!,
        vaultAddress: import.meta.env.VITE_USDC_VAULT!,
    },
    {
        symbol: "USDT",
        decimals: 6,
        isNative: false,
        tokenAddress: import.meta.env.VITE_USDT_ADDRESS!,
        vaultAddress: import.meta.env.VITE_USDT_VAULT!,
    },
    {
        symbol: "DAI",
        decimals: 18,
        isNative: false,
        tokenAddress: import.meta.env.VITE_DAI_ADDRESS!,
        vaultAddress: import.meta.env.VITE_DAI_VAULT!,
    },
]

export const VAULTS_ADDRESS = import.meta.env.VITE_VAULT_MANAGER_ADDRESS!
