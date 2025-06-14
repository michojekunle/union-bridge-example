const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);

  // Deploy SimulatedUnionBridge
  const SimulatedUnionBridge = await hre.ethers.getContractFactory(
    "SimulatedUnionBridge"
  );
  const bridge = await SimulatedUnionBridge.deploy();
  await bridge.waitForDeployment();
  console.log("SimulatedUnionBridge deployed to:", await bridge.getAddress());

  // Deploy CharityDApp with bridge address
  const CharityDApp = await hre.ethers.getContractFactory("CharityDApp");
  const dapp = await CharityDApp.deploy(await bridge.getAddress());
  await dapp.waitForDeployment();
  console.log("CharityDApp deployed to:", await dapp.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
