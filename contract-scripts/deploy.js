const { ethers } = require("hardhat")
const hre = require("hardhat")

async function main() {
  const BlockTalk = await hre.ethers.getContractFactory("BlockTalk")
  console.log("deploying...")
  const BlockTalkDeployed = await BlockTalk.deploy();
  console.log("line 10")////BlockTalkDeployed.address)
  await BlockTalkDeployed.waitForDeployment();
  console.log("Line 14")
  await BlockTalkDeployed.deploy; //ed
  console.log("The latest BlockTalk contract was deployed", BlockTalkDeployed.target)
  console.log("Deployed by ",BlockTalkDeployed.runner.address)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
