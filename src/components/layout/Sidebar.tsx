"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Dices,
  TrendingUp,
  CircleDot,
  Spade,
  SquareStack,
  Target,
  Home,
  X,
  Flame,
  Zap,
  ChevronLeft,
  ChevronRight,
  Shield
} from "lucide-react"
import { motion } from "framer-motion"
import { usePreferences } from "@/components/providers/PreferencesProvider"
import type { TranslationKey } from "@/lib/i18n"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
}

const games: { key: TranslationKey; href: string; icon: typeof Dices; tone: string; hot: boolean }[] = [
  { key: "games.dice.title", href: "/games/dice", icon: Dices, tone: "text-sky-300", hot: false },
  { key: "games.crash.title", href: "/games/crash", icon: TrendingUp, tone: "text-emerald-300", hot: true },
  { key: "games.slots.title", href: "/games/slots", icon: SquareStack, tone: "text-fuchsia-300", hot: true },
  { key: "games.roulette.title", href: "/games/roulette", icon: CircleDot, tone: "text-rose-300", hot: false },
  { key: "games.blackjack.title", href: "/games/blackjack", icon: Spade, tone: "text-amber-300", hot: false },
  { key: "games.poker.title", href: "/games/poker", icon: Target, tone: "text-pink-300", hot: false },
]

export function Sidebar({ isOpen, onClose, collapsed = false, onToggleCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  const { t } = usePreferences()

  useEffect(() => {
    fetch("/api/user")
      .then(res => res.json())
      .then(data => {
        if (data.role === "admin") {
          setIsAdmin(true)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-background/95 border-r border-border/50 transition-all duration-300 md:translate-x-0 backdrop-blur",
          collapsed ? "w-20" : "w-72",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={onToggleCollapsed}
          className={cn(
            "hidden md:flex items-center justify-center absolute -right-3 top-6 h-8 w-8 rounded-full surface border border-border/60 hover:bg-muted/30 transition-colors",
            "shadow-md shadow-black/20"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 md:hidden border-b border-border/50">
            <span className="text-lg font-bold">{t("common.menu")}</span>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className={cn("flex-1 overflow-y-auto p-4", collapsed && "px-3")}>
            <nav className="space-y-1">
                <Link
                  href="/"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    pathname === "/"
                      ? "bg-primary/20 text-foreground shadow-lg shadow-black/20"
                      : "hover:bg-muted/40",
                    collapsed && "px-3 justify-center"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    pathname === "/" ? "bg-primary/20 text-primary" : "bg-muted"
                  )}>
                    <Home className="h-4 w-4" />
                  </div>
                  {!collapsed && <span className="font-medium">{t("common.home")}</span>}
                </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    pathname === "/admin"
                      ? "bg-rose-500/20 text-foreground shadow-lg shadow-black/20"
                      : "hover:bg-muted/40",
                    collapsed && "px-3 justify-center"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    pathname === "/admin" ? "bg-rose-500/20 text-rose-200" : "bg-rose-500/20 text-rose-200"
                  )}>
                    <Shield className="h-4 w-4" />
                  </div>
                  {!collapsed && <span className="font-medium">{t("common.adminPanel")}</span>}
                </Link>
              )}

              <div className="pt-6 pb-3">
                <div className={cn("flex items-center gap-2 px-4", collapsed && "px-2 justify-center")}>
                  <Flame className="h-4 w-4 text-orange-300" />
                  {!collapsed && (
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {t("common.popularGames")}
                    </span>
                  )}
                </div>
              </div>

              {games.map((game, index) => {
                const Icon = game.icon
                const isActive = pathname === game.href

                return (
                  <motion.div
                    key={game.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={game.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                        isActive
                          ? "bg-primary/15 text-foreground shadow-lg shadow-black/20"
                          : "hover:bg-muted/40",
                        collapsed && "px-3 justify-center"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                        isActive ? "bg-primary/20 text-primary" : `bg-muted ${game.tone}`
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      {!collapsed && <span className="font-medium flex-1">{t(game.key)}</span>}
                      {!collapsed && game.hot && (
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          isActive ? "bg-primary/20 text-primary" : "bg-orange-500/20 text-orange-300"
                        )}>
                          {t("common.hot")}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-border/50">
            <div className="p-4 rounded-xl surface-soft border border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-primary" />
                {!collapsed && <span className="text-sm font-bold">{t("common.vipBonus")}</span>}
              </div>
              {!collapsed && (
                <p className="text-xs text-muted-foreground mb-3">
                  {t("common.vipBonusDesc")}
                </p>
              )}
              <Link
                href="/deposit"
                onClick={onClose}
                className={cn(
                  "block w-full text-center px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors button-convex",
                  collapsed && "px-2 text-[10px]"
                )}
              >
                {collapsed ? t("common.vip") : t("common.claimNow")}
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
