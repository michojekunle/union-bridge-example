const hre = require("hardhat");

async function main() {
  const bridgeAddress = "0x5f4833C4F9D88eFE5CbbCFe0C4Ac01322f602452"; // Replace with your actual deployed address
  const dappAddress = "0x04627a7a902B6c8E28853c1340F80Ba82cf8b7fA"; // Replace with your actual deployed address
  const amount = hre.ethers.parseEther("0.001"); //adjust according to amount of RBTC you have

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
  console.log("Donating 0.001 RBTC...");
  const donateTx = await dapp.donate({ value: amount });
  await donateTx.wait();
  console.log("Donation successful, RBTC minted and recorded");

  // Verify donation
  const donationBalance = await dapp.donations(user.address);
  console.log(
    `User donation balance: ${hre.ethers.formatEther(donationBalance)} RBTC`
  );

  // Step 2: Withdraw (burns RBTC)
  console.log("Withdrawing 0.001 RBTC...");
  const withdrawTx = await dapp.withdraw(amount);
  await withdrawTx.wait();
  console.log("Withdrawal successful, RBTC burned");

  // Verify final balances
  const finalDonationBalance = await dapp.donations(user.address);
  const finalBridgeBalance = await bridge.balances(dappAddress);
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
