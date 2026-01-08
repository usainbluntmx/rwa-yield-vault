import { ethers } from "hardhat"

async function main() {
    const [deployer] = await ethers.getSigners()
    console.log("Deploying with:", deployer.address)

    const USDC = await ethers.deployContract("MockUSDC")
    const USDT = await ethers.deployContract("MockUSDT")
    const DAI = await ethers.deployContract("MockDAI")
    const Faucet = await ethers.deployContract("Faucet")

    await Promise.all([
        USDC.waitForDeployment(),
        USDT.waitForDeployment(),
        DAI.waitForDeployment(),
        Faucet.waitForDeployment(),
    ])

    console.log("USDC:", await USDC.getAddress())
    console.log("USDT:", await USDT.getAddress())
    console.log("DAI :", await DAI.getAddress())
    console.log("Faucet:", await Faucet.getAddress())

    // configurar montos faucet
    await Faucet.setFaucetAmount(
        await USDC.getAddress(),
        ethers.parseUnits("1000", 6)
    )

    await Faucet.setFaucetAmount(
        await USDT.getAddress(),
        ethers.parseUnits("1000", 6)
    )

    await Faucet.setFaucetAmount(
        await DAI.getAddress(),
        ethers.parseUnits("1000", 18)
    )

    console.log("Faucet configured")
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
