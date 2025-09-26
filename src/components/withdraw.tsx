"use client"

import { useState, useEffect } from "react"
import { usePrivy } from "@privy-io/react-auth"
import { useReadContract, useChainId } from "wagmi"
import {
  formatUnits,
  Address,
  erc20Abi,
  parseUnits,
  encodeFunctionData,
} from "viem"
import { mainnet } from "viem/chains"
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets"
import Link from "next/link"
import { waitForTransactionReceipt } from "viem/actions"
import { publicClient } from "./provider"

const Withdraw = () => {
  // HARDCODED VALUES
  const DGBetWalletAddress = process.env
    .NEXT_PUBLIC_DGBET_WALLET_ADDRESS as Address
  const usdtContractAddress = process.env
    .NEXT_PUBLIC_USDT_CONTRACT_ADDRESS as Address

  const usdtAbi = erc20Abi

  // STATE
  const [selectedToken, setSelectedToken] = useState("USDT")
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)

  // HOOKS
  const chainId = useChainId()
  const { user } = usePrivy()
  const { client } = useSmartWallets()

  const smartWallet =
    user?.linkedAccounts.find((account) => account.type === "smart_wallet") ||
    user?.linkedAccounts.find((account) => account.type === "wallet")

  const userWalletAddress = smartWallet?.address as Address | undefined

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: usdtContractAddress,
    abi: usdtAbi,
    functionName: "balanceOf",
    args: userWalletAddress ? [userWalletAddress] : undefined,
  })
  const { data: decimals } = useReadContract({
    address: usdtContractAddress,
    abi: usdtAbi,
    functionName: "decimals",
  })

  const handleWithdrawWithEmbeddedWallet = async () => {
    if (!amount) {
      alert("Please fill in all fields and connect your wallet")
      return
    }

    try {
      setIsLoading(true)

      const value = parseUnits(amount, decimals || 6)

      const data = encodeFunctionData({
        abi: usdtAbi,
        functionName: "transfer",
        args: [DGBetWalletAddress, value],
      })

      const tx = {
        chain: mainnet,
        to: usdtContractAddress,
        data,
      }

      const userOpHash = await client?.sendTransaction(tx)

      const receipt = await waitForTransactionReceipt(publicClient, {
        hash: userOpHash as `0x${string}`,
      })
      if (receipt) {
        setTxHash(userOpHash as `0x${string}`)
        setAmount("")
        refetchBalance()
      }
    } catch (error: unknown) {
      console.log("handleWithdrawWithEmbeddedWallet error", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-fill max amount when balance is loaded
  useEffect(() => {
    if (balance && decimals) {
      setAmount(formatUnits(balance, decimals))
    }
  }, [balance, decimals])

  // Auto-remove transaction hash after 10 seconds
  useEffect(() => {
    if (txHash && !isLoading) {
      const timer = setTimeout(() => {
        setTxHash(null)
      }, 10000) // 10 seconds

      return () => clearTimeout(timer)
    }
  }, [txHash, isLoading])

  const buttonDisabled =
    isLoading || !userWalletAddress || smartWallet?.type !== "smart_wallet"
  // Show network switch prompt if not on Polygon
  if (chainId && chainId !== 1) {
    return <ChainError chainId={chainId} />
  }

  return (
    <div className='max-w-md mx-auto mt-16 px-6'>
      <div className='bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800'>
        <h1 className='text-2xl font-bold text-white mb-8 text-center'>
          Withdrawal Crypto
        </h1>

        {/* Token Selection */}
        <div className='mb-6'>
          <label className='block text-white text-sm font-medium mb-3'>
            Token
          </label>
          <div className='flex space-x-2'>
            <button
              onClick={() => setSelectedToken("ETH")}
              className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all bg-[#f5d469] text-black border-2 border-[#f5d469]}`}
            >
              <p> Ethereum (USDT)</p>
              <p className='text-[8px]'>({usdtContractAddress})</p>
            </button>
          </div>
        </div>

        {/* Wallet Address */}
        <div className='mb-6'>
          <label className='block text-white text-sm font-medium mb-3'>
            DGBet Wallet address
          </label>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <svg
                className='h-5 w-5 text-[#f5d469]'
                fill='currentColor'
                viewBox='0 0 24 24'
              >
                <path d='M21 7h-3V6a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V10a3 3 0 0 0-3-3zM5 4h10a1 1 0 0 1 1 1v1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm16 13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7z' />
                <path d='M12 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4z' />
              </svg>
            </div>
            <input
              type='text'
              value={DGBetWalletAddress}
              disabled
              placeholder='Your crypto wallet address'
              className='w-full pl-10 pr-4 py-3 bg-[#2a2a2a] border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#f5d469] focus:ring-1 focus:ring-[#f5d469]'
            />
          </div>
        </div>

        {/* Amount */}
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-3'>
            <label className='block text-white text-sm font-medium'>
              Amount to withdraw
            </label>
          </div>
          <div className='relative'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <svg
                className='h-5 w-5 text-blue-500'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <input
              type='number'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder='0.00'
              disabled
              className={`w-full pl-10 py-3 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#f5d469] focus:ring-1 focus:ring-[#f5d469]`}
            />
          </div>
          <p className='text-gray-400 text-sm mt-2'>
            Available to withdraw:{" "}
            {balance && decimals ? formatUnits(balance, decimals) : "0"}{" "}
            {selectedToken}
          </p>
        </div>

        {/* Transaction Status */}
        {txHash && (
          <div className='mb-4 p-3 bg-green-900/20 border border-green-600 rounded-lg text-left'>
            <p className='text-blue-400 text-sm'>
              Transaction Hash: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </p>
            {isLoading && (
              <p className='text-yellow-400 text-sm mt-1'>
                Waiting for confirmation...
              </p>
            )}
            {!isLoading && txHash && (
              <p className='text-green-400 text-sm mt-1'>
                Transaction confirmed!
              </p>
            )}
            <Link href={`https://etherscan.io/tx/${txHash}`} target='_blank'>
              <p className='text-green-400 text-sm mt-1'>View on Etherscan</p>
            </Link>
          </div>
        )}

        <button
          onClick={handleWithdrawWithEmbeddedWallet}
          disabled={buttonDisabled}
          className={`w-full py-2 rounded-xl font-bold text-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
            isLoading
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-[#f5d469] text-black hover:bg-[#e6c25a]"
          }`}
        >
          {isLoading ? "Processing..." : "Withdraw Crypto"}
        </button>
      </div>
    </div>
  )
}

export default Withdraw

const ChainError = ({ chainId }: { chainId: number }) => {
  return (
    <div className='max-w-md mx-auto mt-16 px-6'>
      <div className='bg-[#1a1a1a] rounded-2xl p-8 border border-gray-800'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-white mb-4'>
            Switch to Ethereum Network
          </h1>
          <p className='text-gray-400 mb-6'>
            Please switch to Ethereum Mainnet to use this application.
          </p>
          <div className='bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 mb-6'>
            <div className='flex items-center justify-between text-yellow-400 text-sm'>
              <p>
                Current Network <span className='text-xs'>(Chain Id)</span>:
              </p>
              <p>{chainId}</p>
            </div>
            <div className='flex items-center justify-between text-yellow-400 text-sm'>
              <p>
                Required Network <span className='text-xs'>(Chain Id)</span>:
              </p>
              <p>1</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
