import { ethers } from "hardhat";

async function main() {
    const Vault = await ethers.getContractFactory("RWAYieldVault");
    const vault = await Vault.deploy();

    await vault.waitForDeployment();

    console.log("RWAYieldVault deployed to:", await vault.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
