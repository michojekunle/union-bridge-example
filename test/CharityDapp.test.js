const { expect } = require("chai");
const hre = require("hardhat");

describe("CharityDApp and SimulatedUnionBridge Integration", function () {
  let bridge, dapp, owner, user;

  beforeEach(async function () {
    [owner, user] = await hre.ethers.getSigners();

    // Deploy SimulatedUnionBridge
    const SimulatedUnionBridge = await hre.ethers.getContractFactory("SimulatedUnionBridge");
    bridge = await SimulatedUnionBridge.deploy();
    await bridge.waitForDeployment();

    // Deploy CharityDApp with bridge address
    const CharityDApp = await hre.ethers.getContractFactory("CharityDApp");
    dapp = await CharityDApp.deploy(await bridge.getAddress());
    await dapp.waitForDeployment();
  });

  describe("Constructor", function () {
    it("should revert with invalid bridge address", async function () {
      const CharityDApp = await hre.ethers.getContractFactory("CharityDApp");
      await expect(CharityDApp.deploy(hre.ethers.ZeroAddress)).to.be.revertedWith("Invalid bridge address");
    });

    it("should set bridge address correctly", async function () {
      expect(await dapp.bridgeAddress()).to.equal(await bridge.getAddress());
    });
  });

  describe("donate", function () {
    it("should mint RBTC and record donation when Ether is sent", async function () {
      const amount = hre.ethers.parseEther("1.0");
      const tx = await dapp.connect(user).donate({ value: amount });
      await tx.wait();
      expect(await dapp.donations(user.address)).to.equal(amount);
    });

    it("should revert if no Ether is sent", async function () {
      await expect(dapp.connect(user).donate({ value: 0 })).to.be.revertedWith("No Ether sent");
    });

    it("should emit DonationMade event with correct parameters", async function () {
      const amount = hre.ethers.parseEther("0.5");
      await expect(dapp.connect(user).donate({ value: amount }))
        .to.emit(dapp, "DonationMade")
        .withArgs(user.address, amount);
    });

    it("should emit MintRBTC event from bridge", async function () {
      const amount = hre.ethers.parseEther("0.5");
      await expect(dapp.connect(user).donate({ value: amount }))
        .to.emit(bridge, "MintRBTC")
        .withArgs(await dapp.getAddress(), amount);
    });
  });

  describe("withdraw", function () {
    it("should burn RBTC and update donation balance", async function () {
      const amount = hre.ethers.parseEther("1.0");
      await dapp.connect(user).donate({ value: amount });

      // Record initial balance and estimate gas cost
      const initialEthBalance = await hre.ethers.provider.getBalance(user.address);
      const withdrawTx = await dapp.connect(user).withdraw(amount);
      const receipt = await withdrawTx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalEthBalance = await hre.ethers.provider.getBalance(user.address);
      // Expect final balance to be approximately initial balance + amount - gas
      expect(finalEthBalance).to.be.closeTo(
        initialEthBalance + amount - gasUsed,
        hre.ethers.parseEther("0.01") // Allow small margin for gas fluctuations
      );
      expect(await dapp.donations(user.address)).to.equal(0);
      expect(await bridge.balances(user.address)).to.equal(0);
    });

    it("should revert if withdrawing more than donated", async function () {
      const amount = hre.ethers.parseEther("1.0");
      await dapp.connect(user).donate({ value: amount });
      await expect(dapp.connect(user).withdraw(hre.ethers.parseEther("2.0")))
        .to.be.revertedWith("Insufficient donation balance");
    });

    it("should emit BurnRBTC event from bridge", async function () {
      const amount = hre.ethers.parseEther("0.5");
      await dapp.connect(user).donate({ value: amount });
      await expect(dapp.connect(user).withdraw(amount))
        .to.emit(bridge, "BurnRBTC")
        .withArgs(await dapp.getAddress(), amount);
    });
  });

  describe("Full Round Trip", function () {
    it("should complete a full cycle: donate, check balances, withdraw", async function () {
      const amount = hre.ethers.parseEther("1.0");

      // Donate (mints RBTC)
      await dapp.connect(user).donate({ value: amount });
      expect(await dapp.donations(user.address)).to.equal(amount);

      // Withdraw (burns RBTC)
      const initialEthBalance = await hre.ethers.provider.getBalance(user.address);
      const withdrawTx = await dapp.connect(user).withdraw(amount);
      const receipt = await withdrawTx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const finalEthBalance = await hre.ethers.provider.getBalance(user.address);
      expect(finalEthBalance).to.be.closeTo(
        initialEthBalance + amount - gasUsed,
        hre.ethers.parseEther("0.01")
      );
      expect(await bridge.balances(user.address)).to.equal(0);
      expect(await dapp.donations(user.address)).to.equal(0);
    });
  });
});