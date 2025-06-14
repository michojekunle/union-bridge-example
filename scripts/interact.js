const hre = require("hardhat");

async function main() {
  const bridgeAddress = "0xYourDeployedBridgeAddress"; // Replace with actual address
  const dappAddress = "0xYourDeployedDAppAddress"; // Replace with actual address
  const amount = hre.ethers.parseEther("1.0");

  const [user] = await hre.ethers.getSigners();
  console.log("Interacting with user:", user.address);

  // Connect to contracts
  const bridge = await hre.ethers.getContractAt(
    "SimulatedUnionBridge",
    bridgeAddress,
    user
  );
  const dapp = await hre.ethers.getContractAt("CharityDApp", dappAddress, user);

  // Step 1: Donate (mints RBTC and records donation)
  console.log("Donating 1 RBTC...");
  const donateTx = await dapp.donate({ value: amount });
  await donateTx.wait();
  console.log("Donation successful, RBTC minted and recorded");

  // Verify donation
  const donationBalance = await dapp.donations(user.address);
  console.log(
    `User donation balance: ${hre.ethers.formatEther(donationBalance)} RBTC`
  );

  // Step 2: Withdraw (burns RBTC)
  console.log("Withdrawing 1 RBTC...");
  const withdrawTx = await dapp.withdraw(amount);
  await withdrawTx.wait();
  console.log("Withdrawal successful, RBTC burned");

  // Verify final balances
  const finalDonationBalance = await dapp.donations(user.address);
  const finalBridgeBalance = await bridge.balances(user.address);
  console.log(
    `Final donation balance: ${hre.ethers.formatEther(
      finalDonationBalance
    )} RBTC`
  );
  console.log(
    `Final bridge balance: ${hre.ethers.formatEther(finalBridgeBalance)} RBTC`
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
