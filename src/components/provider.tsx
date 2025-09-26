"use client"

import React from "react"
import { mainnet } from "viem/chains"
import { createConfig, http } from "wagmi"
import { createPublicClient } from "viem"
import { WagmiProvider } from "@privy-io/wagmi"
import { PrivyProvider } from "@privy-io/react-auth"
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { getRpcUrl } from "@/helper/contants"

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID as string

export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(getRpcUrl(mainnet.id)), // your RPC
})

export const config = createConfig({
  chains: [mainnet],
  transports: {
    [mainnet.id]: http(getRpcUrl(mainnet.id)),
  },
})

const queryClient = new QueryClient()

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      clientId='client-WY5gEtQfKBuiHjdBw3LhpxwGUmoFnbmXXsbDjUyP86qrJ'
      config={{
        loginMethods: ["email", "google", "twitter", "discord", "wallet"],
        appearance: {
          logo: "/images/logo.webp",
          accentColor: "#F5D469",
          theme: "#1F1F1F",
          showWalletLoginFirst: false,
          walletChainType: "ethereum-only",
          walletList: [
            "metamask",
            "wallet_connect",
            "coinbase_wallet",
            "detected_wallets",
          ],
        },
        defaultChain: mainnet,
        supportedChains: [mainnet],
        mfa: {
          noPromptOnMfaRequired: false,
        },
        walletConnectCloudProjectId: projectId,
      }}
    >
      <SmartWalletsProvider>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={config}>{children}</WagmiProvider>
        </QueryClientProvider>
      </SmartWalletsProvider>
    </PrivyProvider>
  )
}
