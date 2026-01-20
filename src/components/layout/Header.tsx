"use client"

import Image from "next/image"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { formatBalance } from "@/lib/utils"
import { Wallet, User, LogOut, Menu, ChevronDown, Bell, Gift } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session, status } = useSession()
  const [balance, setBalance] = useState<number | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchBalance()
      const interval = setInterval(fetchBalance, 10000)
      return () => clearInterval(interval)
    }
  }, [session?.user?.id])

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/user")
      if (res.ok) {
        const data = await res.json()
        setBalance(data.balance)
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full glass">
      <div className="flex h-16 items-center px-4 md:px-6">
        <button
          className="mr-4 p-2 rounded-lg hover:bg-muted/50 transition-colors md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="flex items-center mr-8">
          <img
            src="/logo.png"
            alt="Logo"
            className="object-contain h-12 w-auto"
          />
        </Link>

        <div className="flex-1" />

        {status === "loading" ? (
          <div className="h-10 w-40 bg-muted/50 animate-pulse rounded-xl" />
        ) : session?.user ? (
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/deposit" className="hidden sm:block">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-card border border-border hover:border-primary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-gold flex items-center justify-center">
                    <Wallet className="h-3 w-3 text-black" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground leading-none">Balance</span>
                    <span className="font-bold text-sm text-gradient-gold leading-tight">
                      {balance !== null ? formatBalance(balance) : "..."}
                    </span>
                  </div>
                </div>
                <div className="w-px h-6 bg-border mx-1" />
                <Gift className="h-4 w-4 text-primary" />
              </motion.div>
            </Link>

            <Link href="/deposit" className="sm:hidden">
              <Button variant="outline" size="sm" className="gap-1 border-primary/50 text-primary">
                <Wallet className="h-4 w-4" />
                {balance !== null ? formatBalance(balance) : "..."}
              </Button>
            </Link>

            <button className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors hidden md:flex">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-blue flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform hidden md:block ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDropdown(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-12 w-48 rounded-xl glass overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-border">
                        <p className="font-medium text-sm truncate">{session.user.name || session.user.email}</p>
                        <p className="text-xs text-muted-foreground">Premium Member</p>
                      </div>
                      <div className="p-1">
                        <Link
                          href="/profile"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <Link
                          href="/deposit"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                        >
                          <Wallet className="h-4 w-4" />
                          Deposit
                        </Link>
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-sm w-full text-left text-red-400"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="default" size="sm" className="bg-gradient-blue hover:opacity-90">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
