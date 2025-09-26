import { mainnet, Chain, polygonAmoy, polygon } from "viem/chains"

export const chainByChainId: Record<number, Chain> = {
  [polygon.id]: polygon,
  [polygonAmoy.id]: polygonAmoy,
  [mainnet.id]: mainnet,
}

type ExtendedChainId = keyof typeof chainByChainId

const primaryRpcByChains = {
  [polygon.id]:
    "https://polygon-mainnet.g.alchemy.com/v2/SS4oxHXbatW7oZ2XQgsbhTbSr9sG_MLc",
  [polygonAmoy.id]: "https://rpc-amoy.polygon.technology",
  [mainnet.id]: "https://eth.llamarpc.com",
} as const

export const getRpcUrl = (chainId: ExtendedChainId): string => {
  return primaryRpcByChains[chainId as keyof typeof primaryRpcByChains]
}
