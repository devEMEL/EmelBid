import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    console.log("\n=== Deploying CWETH ===\n");

    const deployed = await deploy("CWETH", {
        contract: "CWETH",
        from: deployer,
        args: [],
        log: true,
    });
    console.log(`CWETH deployed at: ${deployed.address}`);

};

export default func;
func.id = "deploy_CWETH";
func.tags = ["CWETH"];
func.dependencies = ["dependencies"];

// npx hardhat deploy --tags CWETH --network sepolia --reset

// CWETH deployed at: 0xe7eAF40bc2a8d8A42251ABe6BdeE34075715Ee7F