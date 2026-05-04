import { Network, Alchemy } from "alchemy-sdk";
import { ALCHEMY_CONFIG } from "./constants";

const settings = {
  apiKey: ALCHEMY_CONFIG.apiKey,
  network: Network.ETH_SEPOLIA,
};

export const alchemy = new Alchemy(settings);
