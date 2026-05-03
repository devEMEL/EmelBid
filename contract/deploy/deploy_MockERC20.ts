import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n=== Deploying Mock ERC20 Tokens ===\n");

  const tokens = [
    { id: "MockERC20_NBL", name: "Nebula",  symbol: "NBL" },
    { id: "MockERC20_SLR", name: "Solaris", symbol: "SLR" },
    { id: "MockERC20_ATH", name: "Aether",  symbol: "ATH" },
    { id: "MockERC20_VTX", name: "Vortex",  symbol: "VTX" },
    { id: "MockERC20_ZTA", name: "Zeta",  symbol: "ZTA" },
  ];

  for (const token of tokens) {
    const deployed = await deploy(token.id, {
      contract: "MockERC20",
      from: deployer,
      args: [],
      log: true,
    });
    console.log(`${token.symbol} deployed at: ${deployed.address}`);
  }
};

export default func;
func.id = "deploy_mock_tokens";
func.tags = ["MockERC20", "tokens"];
func.dependencies = ["dependencies"];

// npx hardhat deploy --tags MockERC20 --network sepolia --reset

// NBL deployed at: 0xff6acF51F397505bFc43B7E19329Fa8057B277E3

// SLR deployed at: 0xdEC84548f63B19E7ebdF3a396647a40973488255

// ATH deployed at: 0x1caB624ED82F61b4CA073d4cB2dbAe148e344fBB

// VTX deployed at: 0xB777176ea921D4aA8Ab9aD6163c8bafacdCbeD44

// ZTA deployed at: 0xEA2877Ce6b0BEBF64fab5D69257EFe5C2Ba28B0f