🐓 Gallito DeFi — On-chain Yield Vaults for Crypto & Tokenized Stocks

Built on Mantle Network

--------------------------------------------------

📌 Overview

Gallito DeFi is a non-custodial DeFi dApp deployed on Mantle Sepolia Testnet that allows users to deposit and withdraw on-chain assets through ERC-4626 vaults, while displaying realistic, transparent yield estimates.

The platform currently supports:

- Native token: MNT
- Stablecoins: USDC, USDT, DAI
- Tokenized stocks (simulated): AAPLx, TSLAx, NVDAx

Gallito DeFi is designed as a RealFi / RWA building block, where the current vault system serves as a foundation for future integration of:

- real yield
- real-world assets
- compliance-ready financial flows

The project prioritizes:

- clean on-chain logic
- reliable UX
- extensibility without compromising security

--------------------------------------------------

🎯 Problem

In the DeFi and RWA ecosystem, many products:

- Advertise unclear or inflated yields
- Hide how user capital actually works
- Mix custody, vault logic, and UI concerns
- Simulate balances off-chain
- Are difficult to audit or extend safely

This leads to user distrust, poor UX, and unnecessary risk.

--------------------------------------------------

🧩 Solution

Gallito DeFi provides a simple, modular, and elegant solution:

- Fully on-chain vaults per asset (ERC-4626)
- Full user control over deposited capital
- Partial and full deposits & withdrawals
- Balances read directly from smart contracts
- Realistic simulated yield, decoupled from the vault logic
- Architecture ready to migrate to real yield without breaking the UI

Each asset lives in its own vault, minimizing coupling and reducing attack surface.

--------------------------------------------------

⚙️ How It Works
1️⃣ Wallet Connection

- AppKit / WalletConnect integration
- EVM Wallet support
- Automatic Mantle Sepolia detection

2️⃣ Deposit

- User selects an asset (MNT, stable, or stock)
- Enters an amount
- Approves token if required
- Deposits into the corresponding vault
- Balance updates on-chain

3️⃣ Withdraw

- Partial or full withdrawals
- Correct shares → assets conversion (ERC-4626)
- Direct transfer back to the user
- Real-time UI updates

4️⃣ Yield (Simulated)

- Realistic APY per asset
- Daily and monthly estimates shown in UI
- Yield engine decoupled from contracts
- Ready to be replaced by real yield sources

--------------------------------------------------

🛠️ Tech Stack
Smart Contracts

- Solidity ^0.8.20
- OpenZeppelin (ERC20, ERC4626, Ownable)
- Hardhat
- ethers.js v6

Frontend

- Vite
- React + TypeScript
- ethers.js
- AppKit (Reown)
- TailwindCSS

Blockchain

- Mantle Sepolia Testnet
- Native token: MNT

--------------------------------------------------

📦 Supported Assets
Crypto

- MNT (native)
- USDC
- USDT
- DAI

Tokenized Stocks (Simulated)

- AAPLx
- TSLAx
- NVDAx

⚠️ Stock tokens are mock assets used to test RealFi / RWA flows.
They do not represent real equities in this MVP.

--------------------------------------------------

🚀 Getting Started
Requirements

- MetaMask or compatible wallet with EVM ecosystem
- Test MNT (Mantle Sepolia faucet)

Steps

- git clone https://github.com/usainbluntmx/rwa-yield-vault
- cd rwa-yield-vault/frontend
- npm install
- npm run dev

1. Open the app
2. Connect your wallet
3. Deposit into any vault
4. Monitor balances and estimated yield
5. Withdraw partially or fully

--------------------------------------------------

🧪 Tests

The contracts include unit tests covering:

- Correct vault deployment
- ERC-20 and native deposits
- Shares ↔ assets conversion
- Partial and full withdrawals

npx hardhat test

--------------------------------------------------

🔐 Security Considerations

- Non-custodial
- No private keys handled
- No privileged admin logic
- Yield logic separated from financial core
- Architecture designed for incremental audits

This MVP does not generate real yield yet.

--------------------------------------------------

🗺️ Roadmap
Short Term

- User transaction history
- On-chain events → reactive UI
- Withdraw Max button
- Active network indicator

Mid Term

- Real yield integration (Aave / LST / RWA proxies)
- Strategy-specific vaults
- Oracle pricing for tokenized stocks
- Advanced asset dashboards

Long Term

- Real RWA integrations
- Compliance-ready flows (KYC / ZK-KYC)
- Regulated yield distribution
- Multi-chain deployment

--------------------------------------------------

🧠 Why Mantle?

Mantle offers:

- Low transaction costs
- Full EVM compatibility
- Modular infrastructure
- Excellent UX for real financial applications

Gallito DeFi leverages Mantle as a foundation for next-generation RealFi RWA future.

--------------------------------------------------

👥 Team

- Developer: Ricardo Fuentes
- Contact: j.ricardo.df@gmail.com

--------------------------------------------------

📄 License

- MIT