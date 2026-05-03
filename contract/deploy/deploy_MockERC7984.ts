import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    console.log("\n=== Deploying MockERC7984 ===\n");

    const deployed = await deploy("MockERC7984", {
        contract: "MockERC7984",
        from: deployer,
        args: [],
        log: true,
    });
    console.log(`MockERC7984 deployed at: ${deployed.address}`);

};

export default func;
func.id = "deploy_MockERC7984";
func.tags = ["MockERC7984"];
func.dependencies = ["dependencies"];

// npx hardhat deploy --tags MockERC7984 --network sepolia --reset

// MockERC7984 deployed at: 0xCcc0a189ba958B395f3676a11F2758C4EaEE2d0a