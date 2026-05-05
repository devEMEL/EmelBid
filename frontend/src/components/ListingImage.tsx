import { useState, useEffect } from 'react';
import { ImageIcon, Loader2 } from 'lucide-react';
import { alchemy } from '@/lib/alchemy';

interface ListingImageProps {
  assetType: number;
  asset: string;
  tokenIdOrAmount: string;
  className?: string;
}

export default function ListingImage({ assetType, asset, tokenIdOrAmount, className = "" }: ListingImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getNFTMetadata() {
      if (assetType !== 1) return; // Only for NFTs
      
      setLoading(true);
      try {
        const metadata = await alchemy.nft.getNftMetadata(asset, tokenIdOrAmount);
        if (metadata.image?.originalUrl) {
          setImageUrl(metadata.image.originalUrl);
        } else if (metadata.image?.cachedUrl) {
          setImageUrl(metadata.image.cachedUrl);
        }
      } catch (error) {
        console.error("Error fetching NFT metadata:", error);
      } finally {
        setLoading(false);
      }
    }

    getNFTMetadata();
  }, [assetType, asset, tokenIdOrAmount]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-white/5 border border-white/10 ${className}`}>
        <Loader2 className="animate-spin text-primary/40" size={24} />
      </div>
    );
  }

  if (assetType === 1) {
    return (
      <div className={`overflow-hidden flex items-center justify-center bg-white/5 border border-white/10 ${className}`}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="NFT" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            onError={() => setImageUrl(null)}
          />
        ) : (
          <ImageIcon className="text-primary/40" size={24} />
        )}
      </div>
    );
  }

  // ERC20 or Confidential
  return (
    <div className={`overflow-hidden flex flex-col items-center justify-center bg-white/5 border border-white/10 relative overflow-hidden group ${className}`}>
      <img 
        src={assetType === 2 ? "/confidential.png" : "/erc20.png"} 
        alt="Token" 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
        <div className="text-[6px] font-black uppercase tracking-widest text-white/80 whitespace-nowrap px-2 relative z-10">
          {asset.substring(0, 8)}...
        </div>
      </div>
    </div>
  );
}
