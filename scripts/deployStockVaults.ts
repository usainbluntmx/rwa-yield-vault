import { ethers } from "hardhat"

/* --------------------------------------------------
   🔧 CONFIGURACIÓN MANUAL
   (tokens stocks ya desplegados en Mantle Sepolia)
-------------------------------------------------- */

const AAPLX_ADDRESS = "0x449630e4018fE2260A0d456297BcC6f9F04E8238" // ← AAPLx
const TSLAX_ADDRESS = "0x9FC171B232b173B76d200dB2B605fE1FdbCdA69F" // ← TSLAx
const NVDAX_ADDRESS = "0xC5c06386D0863D9919D186FF309AE3532C6606e9" // ← NVDAx

const VAULT_MANAGER_ADDRESS =
    "0x9DF7243c7daC69179F4326aD42443C3A4d0dB442" // ← VaultManager existente

async function main() {
    const [deployer] = await ethers.getSigners()

    console.log("🚀 Deploying STOCK vaults with:")
    console.log("Deployer:", deployer.address)
    console.log("Network :", (await deployer.provider.getNetwork()).name)

    /* --------------------------------------------------
       1️⃣ Deploy VaultAAPLx
    -------------------------------------------------- */

    const VaultAAPLx = await ethers.getContractFactory("VaultAAPLx")
    const vaultAAPLx = await VaultAAPLx.deploy(AAPLX_ADDRESS)
    await vaultAAPLx.waitForDeployment()

    const vaultAAPLxAddress = await vaultAAPLx.getAddress()
    console.log("✅ VaultAAPLx deployed at:", vaultAAPLxAddress)

    /* --------------------------------------------------
       2️⃣ Deploy VaultTSLAx
    -------------------------------------------------- */

    const VaultTSLAx = await ethers.getContractFactory("VaultTSLAx")
    const vaultTSLAx = await VaultTSLAx.deploy(TSLAX_ADDRESS)
    await vaultTSLAx.waitForDeployment()

    const vaultTSLAxAddress = await vaultTSLAx.getAddress()
    console.log("✅ VaultTSLAx deployed at:", vaultTSLAxAddress)

    /* --------------------------------------------------
       3️⃣ Deploy VaultNVDAx
    -------------------------------------------------- */

    const VaultNVDAx = await ethers.getContractFactory("VaultNVDAx")
    const vaultNVDAx = await VaultNVDAx.deploy(NVDAX_ADDRESS)
    await vaultNVDAx.waitForDeployment()

    const vaultNVDAxAddress = await vaultNVDAx.getAddress()
    console.log("✅ VaultNVDAx deployed at:", vaultNVDAxAddress)

    /* --------------------------------------------------
       4️⃣ Register vaults in VaultManager
    -------------------------------------------------- */

    console.log("📝 Registering stock vaults in manager...")

    const vaultManager = await ethers.getContractAt(
        "VaultManager",
        VAULT_MANAGER_ADDRESS
    )

    await vaultManager.setVault(AAPLX_ADDRESS, vaultAAPLxAddress)
    await vaultManager.setVault(TSLAX_ADDRESS, vaultTSLAxAddress)
    await vaultManager.setVault(NVDAX_ADDRESS, vaultNVDAxAddress)

    console.log("🎉 Stock vaults registered successfully")

    /* --------------------------------------------------
       📌 RESUMEN FINAL
    -------------------------------------------------- */

    console.log("\n📦 DEPLOY SUMMARY (STOCK VAULTS)")
    console.log("AAPLx Vault :", vaultAAPLxAddress)
    console.log("TSLAx Vault :", vaultTSLAxAddress)
    console.log("NVDAx Vault :", vaultNVDAxAddress)
    console.log("Manager     :", VAULT_MANAGER_ADDRESS)
}

main().catch((error) => {
    console.error("❌ Deploy failed")
    console.error(error)
    process.exitCode = 1
})
