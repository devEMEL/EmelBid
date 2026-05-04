import { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { alchemy } from "@/lib/alchemy";
// import { NFT } from "alchemy-sdk";

export function useNFTs() {
  const { user } = usePrivy();
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNFTs() {
      if (!user?.wallet?.address) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const nftsForOwner = await alchemy.nft.getNftsForOwner(user.wallet.address);
        setNfts(nftsForOwner.ownedNfts);
      } catch (err: any) {
        console.error("Error fetching NFTs:", err);
        setError(err.message || "Failed to fetch NFTs");
      } finally {
        setLoading(false);
      }
    }

    fetchNFTs();
  }, [user?.wallet?.address]);

  return { nfts, loading, error };
}
