import { ethers } from "hardhat"

/* ============================
   CONFIG — YA DEPLOYADOS
============================ */

// ⛔️ stables YA existen → solo referencia
const FAUCET_ADDRESS = "0x0CC9cAcCaDfc678Fc80277705e9A4329CBc3283B"

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Deploying with:", deployer.address)

    /* ============================
       DEPLOY STOCK TOKENS
    ============================ */

    const AAPL = await ethers.deployContract("MockAAPL")
    const TSLA = await ethers.deployContract("MockTSLA")
    const NVDA = await ethers.deployContract("MockNVDA")

    await Promise.all([
        AAPL.waitForDeployment(),
        TSLA.waitForDeployment(),
        NVDA.waitForDeployment(),
    ])

    const aapl = await AAPL.getAddress()
    const tsla = await TSLA.getAddress()
    const nvda = await NVDA.getAddress()

    console.log("AAPLx:", aapl)
    console.log("TSLAx:", tsla)
    console.log("NVDAx:", nvda)

    /* ============================
       CONFIGURE FAUCET
    ============================ */

    const Faucet = await ethers.getContractAt("Faucet", FAUCET_ADDRESS)

    // Montos realistas por claim
    await Faucet.setFaucetAmount(
        aapl,
        ethers.parseUnits("10", 18)
    )

    await Faucet.setFaucetAmount(
        tsla,
        ethers.parseUnits("5", 18)
    )

    await Faucet.setFaucetAmount(
        nvda,
        ethers.parseUnits("3", 18)
    )

    console.log("✅ Faucet configured for stock tokens")
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
