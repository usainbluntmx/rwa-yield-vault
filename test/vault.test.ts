import { expect } from "chai";
import { ethers } from "hardhat";

describe("RWAYieldVault", function () {
    async function deployFixture() {
        const [owner, user] = await ethers.getSigners();

        const Vault = await ethers.getContractFactory("RWAYieldVault");
        const vault = await Vault.deploy();
        await vault.waitForDeployment();

        return { vault, owner, user };
    }

    it("Should allow deposits", async function () {
        const { vault, user } = await deployFixture();

        await vault.connect(user).deposit({ value: ethers.parseEther("1") });

        const balance = await vault.balances(user.address);
        expect(balance).to.equal(ethers.parseEther("1"));
    });

    it("Should accumulate yield over time", async function () {
        const { vault, user } = await deployFixture();

        await vault.connect(user).deposit({ value: ethers.parseEther("1") });

        await ethers.provider.send("evm_increaseTime", [365 * 24 * 60 * 60]);
        await ethers.provider.send("evm_mine", []);

        const yieldAmount = await vault.pendingYield(user.address);
        expect(yieldAmount).to.be.gt(0);
    });

    it("Should allow withdrawal", async function () {
        const { vault, user } = await deployFixture();

        await vault.connect(user).deposit({ value: ethers.parseEther("1") });
        await vault.connect(user).withdraw(ethers.parseEther("1"));

        const balance = await vault.balances(user.address);
        expect(balance).to.equal(0);
    });
});
