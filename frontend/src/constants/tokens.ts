export type FaucetToken = {
    symbol: string
    address: string
    decimals: number
    amount?: string
    icon?: string   // ✅ opcional
}

export const TOKENS: FaucetToken[] = [
    {
        symbol: "USDC",
        decimals: 6,
        address: "0x9efed651f02dB27E173B4aed4697dd774571D9f3",
        icon: " ",
    },
    {
        symbol: "USDT",
        decimals: 6,
        address: "0x0d1ad3045e92E3b00B485AE1319D069405Ae6954",
        icon: " ",
    },
    {
        symbol: "DAI",
        decimals: 18,
        address: "0xf6C6aa8dFd32618F8d3703F0BcB40456c032fbb3",
        icon: " ",
    },
    {
        symbol: "AAPLx",
        address: "0x449630e4018fE2260A0d456297BcC6f9F04E8238",
        decimals: 18,
        amount: "10",
        icon: " ",
    },
    {
        symbol: "TSLAx",
        address: "0x9FC171B232b173B76d200dB2B605fE1FdbCdA69F",
        decimals: 18,
        amount: "5",
        icon: " ",
    },
    {
        symbol: "NVDAx",
        address: "0xC5c06386D0863D9919D186FF309AE3532C6606e9",
        decimals: 18,
        amount: "3",
        icon: " ",
    },
]

export const FAUCET_ADDRESS = "0x0CC9cAcCaDfc678Fc80277705e9A4329CBc3283B"
export const VAULT_MANAGER_ADDRESS = "0x9DF7243c7daC69179F4326aD42443C3A4d0dB442"