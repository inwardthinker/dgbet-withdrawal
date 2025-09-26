"use client"
import Image from "next/image"
import { usePrivy, useLogout } from "@privy-io/react-auth"

import Withdraw from "@/components/withdraw"

export default function Home() {
  const { ready, authenticated, login, user } = usePrivy()
  const { logout } = useLogout()

  const smartWallet =
    user?.linkedAccounts.find((account) => account.type === "smart_wallet") ||
    user?.linkedAccounts.find((account) => account.type === "wallet")

  const handleLogout = () => {
    logout()
  }

  if (!ready) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-black to-[#313131] flex items-center justify-center'>
        <div className='flex flex-col items-center justify-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5d469] mb-4'></div>
          <div className='text-white text-lg'>Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-black to-[#313131]'>
      {/* Navigation */}
      <nav className='px-6 py-4 bg-black'>
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Image src='/logo.webp' alt='Logo' width={106} height={22} />
          </div>
          <div className='flex items-center space-x-8'>
            {authenticated ? (
              <div className='flex items-center space-x-2'>
                <button className='bg-[#f5d469] text-black px-4 py-2 rounded-lg font-bold'>
                  {smartWallet?.address?.slice(0, 6)}...
                  {smartWallet?.address?.slice(-4)}
                </button>
                <button
                  className='bg-[#f5d469] text-black px-4 py-2 rounded-lg font-bold cursor-pointer'
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                className='bg-[#f5d469] text-black px-4 py-2 rounded-lg font-bold cursor-pointer'
                onClick={login}
              >
                Sign up/ Login
              </button>
            )}
          </div>
        </div>
      </nav>

      <Withdraw />
    </div>
  )
}
