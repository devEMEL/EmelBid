import { PinataSDK } from "pinata-web3";

const pinata = (import.meta.env.VITE_PINATA_JWT) ? new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT,
  pinataGateway: 'https://ipfs.io',
}) : null;

export const getTokenURI = async (metadata: object) => {
    if (!pinata) {
      console.warn("Pinata not configured, using fallback IPFS link");
      return `ipfs://bafkreiatjyx5hkzw4iciwuoj24yz56mng6ls2e6thcowhv4357p742asm4`;
    }
    try {
      const upload = await pinata.upload.json(metadata);
      return `ipfs://${upload.IpfsHash}`;
    } catch (e) {
      console.error("Pinata upload failed:", e);
      return `ipfs://bafkreiatjyx5hkzw4iciwuoj24yz56mng6ls2e6thcowhv4357p742asm4`;
    }
};
