import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    console.log("\n=== Deploying MockERC721 ===\n");

    const deployed = await deploy("MockERC721", {
        contract: "MockERC721",
        from: deployer,
        args: [],
        log: true,
    });
    console.log(`MockERC721 deployed at: ${deployed.address}`);

};

export default func;
func.id = "deploy_MockERC721";
func.tags = ["MockERC721"];
func.dependencies = ["dependencies"];

// lets create a tokenuri that can be reused...check emel market

// npx hardhat deploy --tags MockERC721 --network sepolia --reset

// MockERC721 deployed at: 0xE63Eb347601aBdD5bAc2476ba979baA24E3c23Fb