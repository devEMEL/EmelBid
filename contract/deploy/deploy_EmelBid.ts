import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    console.log("\n=== Deploying EmelBid ===\n");

    // address _cweth, address _decryptor
    const cwethAddress = "0xe7eAF40bc2a8d8A42251ABe6BdeE34075715Ee7F";
    const decryptorAddress = "0x5Ac521f6814c2D09188A6838e7CDBfe7aEaC0cf9";

    const deployed = await deploy("EmelBid", {
        contract: "EmelBid",
        from: deployer,
        args: [cwethAddress, decryptorAddress],
        log: true,
    });
    console.log(`EmelBid deployed at: ${deployed.address}`);

};

export default func;
func.id = "deploy_EmelBid";
func.tags = ["EmelBid"];
func.dependencies = ["dependencies"];

// npx hardhat deploy --tags EmelBid --network sepolia --reset

// EmelBid deployed at: 0xCf8B3FEAb3d90fbA7DFfc92CDdE3984eE91A8516

// EmelBid deployed at: 0xb452Ae94A20d618Ea8c86B1580B93D96CF0d1D10