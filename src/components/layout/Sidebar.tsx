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

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
  collapsed?: boolean
  onToggleCollapsed?: () => void
}

const games = [
  { name: "Dice", href: "/games/dice", icon: Dices, color: "from-blue-500 to-blue-600", hot: false },
  { name: "Crash", href: "/games/crash", icon: TrendingUp, color: "from-green-500 to-emerald-600", hot: true },
  { name: "Slots", href: "/games/slots", icon: SquareStack, color: "from-purple-500 to-violet-600", hot: true },
  { name: "Roulette", href: "/games/roulette", icon: CircleDot, color: "from-red-500 to-rose-600", hot: false },
  { name: "Blackjack", href: "/games/blackjack", icon: Spade, color: "from-amber-500 to-orange-600", hot: false },
  { name: "Video Poker", href: "/games/poker", icon: Target, color: "from-pink-500 to-rose-600", hot: false },
]

export function Sidebar({ isOpen, onClose, collapsed = false, onToggleCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

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
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-gradient-dark border-r border-border/50 transition-all duration-300 md:translate-x-0",
          collapsed ? "w-20" : "w-72",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={onToggleCollapsed}
          className={cn(
            "hidden md:flex items-center justify-center absolute -right-3 top-6 h-8 w-8 rounded-full glass border border-border/60 hover:bg-muted/30 transition-colors",
            "shadow-md shadow-black/20"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 md:hidden border-b border-border/50">
            <span className="text-lg font-bold">Menu</span>
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
                    ? "bg-gradient-blue text-white shadow-lg shadow-blue-500/25"
                    : "hover:bg-muted/50",
                  collapsed && "px-3 justify-center"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  pathname === "/" ? "bg-white/20" : "bg-muted"
                )}>
                  <Home className="h-4 w-4" />
                </div>
                {!collapsed && <span className="font-medium">Home</span>}
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                    pathname === "/admin"
                      ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/25"
                      : "hover:bg-muted/50",
                    collapsed && "px-3 justify-center"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    pathname === "/admin" ? "bg-white/20" : "bg-gradient-to-br from-red-500 to-rose-600"
                  )}>
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  {!collapsed && <span className="font-medium">Admin Panel</span>}
                </Link>
              )}

              <div className="pt-6 pb-3">
                <div className={cn("flex items-center gap-2 px-4", collapsed && "px-2 justify-center")}>
                  <Flame className="h-4 w-4 text-orange-500" />
                  {!collapsed && (
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Popular Games
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
                          ? `bg-gradient-to-r ${game.color} text-white shadow-lg`
                          : "hover:bg-muted/50",
                        collapsed && "px-3 justify-center"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                        isActive ? "bg-white/20" : `bg-gradient-to-br ${game.color}`
                      )}>
                        <Icon className={cn("h-4 w-4", isActive ? "text-white" : "text-white")} />
                      </div>
                      {!collapsed && <span className="font-medium flex-1">{game.name}</span>}
                      {!collapsed && game.hot && (
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                          isActive ? "bg-white/20 text-white" : "bg-orange-500/20 text-orange-400"
                        )}>
                          Hot
                        </span>
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-border/50">
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-primary" />
                {!collapsed && <span className="text-sm font-bold">VIP Bonus</span>}
              </div>
              {!collapsed && (
                <p className="text-xs text-muted-foreground mb-3">
                  Get 100% bonus on your next deposit!
                </p>
              )}
              <Link
                href="/deposit"
                onClick={onClose}
                className={cn(
                  "block w-full text-center px-4 py-2 rounded-lg bg-gradient-blue text-white text-sm font-medium hover:opacity-90 transition-opacity",
                  collapsed && "px-2 text-[10px]"
                )}
              >
                {collapsed ? "VIP" : "Claim Now"}
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
