import { ethers } from "hardhat"

/* --------------------------------------------------
   🔧 CONFIGURACIÓN MANUAL
   (tokens ya desplegados en Mantle Testnet)
-------------------------------------------------- */

const USDC_ADDRESS = "0x9efed651f02dB27E173B4aed4697dd774571D9f3"
const USDT_ADDRESS = "0x0d1ad3045e92E3b00B485AE1319D069405Ae6954"
const DAI_ADDRESS = "0xf6C6aa8dFd32618F8d3703F0BcB40456c032fbb3"

async function main() {
    const [deployer] = await ethers.getSigners()

    console.log("🚀 Deploying vault system with:")
    console.log("Deployer:", deployer.address)
    console.log("Network :", (await deployer.provider.getNetwork()).name)

    /* --------------------------------------------------
       1️⃣ Deploy VaultUSDC
    -------------------------------------------------- */

    const VaultUSDC = await ethers.getContractFactory("VaultUSDC")
    const vaultUSDC = await VaultUSDC.deploy(USDC_ADDRESS)
    await vaultUSDC.waitForDeployment()

    const vaultUSDCAddress = await vaultUSDC.getAddress()
    console.log("✅ VaultUSDC deployed at:", vaultUSDCAddress)

    /* --------------------------------------------------
       2️⃣ Deploy VaultUSDT
    -------------------------------------------------- */

    const VaultUSDT = await ethers.getContractFactory("VaultUSDT")
    const vaultUSDT = await VaultUSDT.deploy(USDT_ADDRESS)
    await vaultUSDT.waitForDeployment()

    const vaultUSDTAddress = await vaultUSDT.getAddress()
    console.log("✅ VaultUSDT deployed at:", vaultUSDTAddress)

    /* --------------------------------------------------
       3️⃣ Deploy VaultDAI
    -------------------------------------------------- */

    const VaultDAI = await ethers.getContractFactory("VaultDAI")
    const vaultDAI = await VaultDAI.deploy(DAI_ADDRESS)
    await vaultDAI.waitForDeployment()

    const vaultDAIAddress = await vaultDAI.getAddress()
    console.log("✅ VaultDAI deployed at:", vaultDAIAddress)

    /* --------------------------------------------------
       4️⃣ Deploy VaultManager
    -------------------------------------------------- */

    const VaultManagerFactory = await ethers.getContractFactory("VaultManager")
    const vaultManagerDeploy = await VaultManagerFactory.deploy()
    await vaultManagerDeploy.waitForDeployment()

    const vaultManagerAddress = await vaultManagerDeploy.getAddress()
    console.log("✅ VaultManager deployed at:", vaultManagerAddress)

    const vaultManager = await ethers.getContractAt(
        "VaultManager",
        vaultManagerAddress
    )

    /* --------------------------------------------------
       5️⃣ Register vaults in manager
    -------------------------------------------------- */

    console.log("📝 Registering vaults...")

    await vaultManager.setVault(USDC_ADDRESS, vaultUSDCAddress)
    await vaultManager.setVault(USDT_ADDRESS, vaultUSDTAddress)
    await vaultManager.setVault(DAI_ADDRESS, vaultDAIAddress)

    console.log("🎉 All vaults registered successfully")

    /* --------------------------------------------------
       📌 RESUMEN FINAL
    -------------------------------------------------- */

    console.log("\n📦 DEPLOY SUMMARY")
    console.log("USDC Vault :", vaultUSDCAddress)
    console.log("USDT Vault :", vaultUSDTAddress)
    console.log("DAI  Vault :", vaultDAIAddress)
    console.log("Manager    :", vaultManagerAddress)
}

main().catch((error) => {
    console.error("❌ Deploy failed")
    console.error(error)
    process.exitCode = 1
})
