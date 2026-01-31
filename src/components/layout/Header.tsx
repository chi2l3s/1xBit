"use client"

import Image from "next/image"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { formatBalance } from "@/lib/utils"
import { Wallet, User, LogOut, Menu, ChevronDown, Bell, Gift, Sun, Moon } from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePreferences } from "@/components/providers/PreferencesProvider"

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data: session, status } = useSession()
  const [balance, setBalance] = useState<number | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const { t, locale, setLocale, theme, toggleTheme } = usePreferences()

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
                className="flex items-center gap-2 px-4 py-2 rounded-2xl surface border border-border/60 hover:border-primary/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                    <Wallet className="h-3 w-3 text-accent" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground leading-none">{t("common.balance")}</span>
                    <span className="font-bold text-sm text-foreground leading-tight">
                      {balance !== null ? formatBalance(balance) : "..."}
                    </span>
                  </div>
                </div>
                <div className="w-px h-6 bg-border mx-1" />
                <Gift className="h-4 w-4 text-primary" />
              </motion.div>
            </Link>

            <Link href="/deposit" className="sm:hidden">
              <Button variant="outline" size="sm" className="gap-1 border-primary/40 text-primary">
                <Wallet className="h-4 w-4" />
                {balance !== null ? formatBalance(balance) : "..."}
              </Button>
            </Link>

            <button className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors hidden md:flex" aria-label={t("header.notifications")}>
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
            </button>

            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full surface-soft px-1 py-1">
                {(["en", "ru"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLocale(lang)}
                    className={`px-2 py-1 text-[11px] font-semibold rounded-full transition ${
                      locale === lang ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                    aria-label={t("header.toggleLanguage")}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-full surface-soft hover:bg-muted/50 transition-colors"
                aria-label={t("header.toggleTheme")}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted/50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
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
                      className="absolute right-0 top-12 w-48 rounded-2xl glass overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-border">
                        <p className="font-medium text-sm truncate">{session.user.name || session.user.email}</p>
                        <p className="text-xs text-muted-foreground">{t("header.premiumMember")}</p>
                      </div>
                      <div className="p-1">
                        <Link
                          href="/profile"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                        >
                          <User className="h-4 w-4" />
                          {t("common.profile")}
                        </Link>
                        <Link
                          href="/deposit"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-sm"
                        >
                          <Wallet className="h-4 w-4" />
                          {t("common.deposit")}
                        </Link>
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors text-sm w-full text-left text-red-400"
                        >
                          <LogOut className="h-4 w-4" />
                          {t("common.signOut")}
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
            <div className="flex items-center gap-1 rounded-full surface-soft px-1 py-1">
              {(["en", "ru"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLocale(lang)}
                  className={`px-2 py-1 text-[11px] font-semibold rounded-full transition ${
                    locale === lang ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                  aria-label={t("header.toggleLanguage")}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full surface-soft hover:bg-muted/50 transition-colors"
              aria-label={t("header.toggleTheme")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <Link href="/login">
              <Button variant="ghost" size="sm">{t("common.signIn")}</Button>
            </Link>
            <Link href="/register">
              <Button variant="default" size="sm" className="bg-primary/90 hover:bg-primary">
                {t("common.getStarted")}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}
