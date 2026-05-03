

import { PrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'wagmi';
import { useState } from 'react';
import { arcTestnet } from 'viem/chains';

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http(),
  },
});


export default function Providers({ children }: { children: React.ReactNode }) {
  // We use a fallback so it doesn't crash immediately if the env var is missing during dev
  const appId = import.meta.env.VITE_PRIVY_APP_ID || '';
  const [queryClient] = useState(() => new QueryClient());

  if (!appId || appId === 'insert-your-app-id-here') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white p-4">
        <div className="max-w-md w-full bg-red-900/20 border border-red-500/50 p-6 rounded-2xl text-center shadow-lg">
          <h2 className="text-xl font-bold text-red-400 mb-2">Missing Privy App ID</h2>
          <p className="text-gray-300 text-sm mb-4">
            Could not initialize the Privy provider. Please add your Privy App ID to <code className="bg-black/50 px-2 py-1 rounded text-red-300">.env</code> as <code className="bg-black/50 px-2 py-1 rounded text-red-300">VITE_PRIVY_APP_ID</code> and restart the development server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        defaultChain: arcTestnet,
        supportedChains: [arcTestnet],
        loginMethods: ['email', 'wallet', 'twitter'],
        appearance: {
          theme: 'dark',
          accentColor: '#FFD217',
          showWalletLoginFirst: true,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
