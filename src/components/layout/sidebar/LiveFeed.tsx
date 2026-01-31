"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { CircleDot, Dices, Spade, SquareStack, TrendingUp, Target } from "lucide-react"
import { usePreferences } from "@/components/providers/PreferencesProvider"

type FeedItem = {
  id: string
  user: string
  mode: string
  win: boolean
  amount: number
  at: number
}

const MODES = [
  { id: "Crash", icon: TrendingUp, color: "text-emerald-400" },
  { id: "Dice", icon: Dices, color: "text-blue-400" },
  { id: "Slots", icon: SquareStack, color: "text-purple-400" },
  { id: "Roulette", icon: CircleDot, color: "text-red-400" },
  { id: "Blackjack", icon: Spade, color: "text-amber-400" },
  { id: "Poker", icon: Target, color: "text-pink-400" },
]

// Большой пул имен для ботов
const BOT_NAMES = [
  "CryptoKing", "LuckyAce", "BitMaster", "MoonRider", "NeonFox",
  "Satoshi99", "NightOwl", "KinoMax", "DiamondHands", "RocketMan",
  "SilverWolf", "GoldRush", "BetKing", "HighRoller", "JackpotJoe",
  "WinStreak", "LuckyDraw", "BigSpender", "CashFlow", "VegasVibes",
  "BonusHunter", "SpinMaster", "CardShark", "DiceLord", "SlotKing",
  "Maverick", "Phoenix", "Thunder", "Shadow", "Blaze",
  "Storm", "Ghost", "Raven", "Titan", "Viper",
  "Ace_High", "Royal_Flush", "Lucky7s", "TripleBar", "JackHammer",
  "SpinCity", "GoldenEagle", "SilverLining", "BronzeStar", "PlatinumVIP",
  "xXSniperXx", "ProGamer", "ElitePlayer", "MegaWinner", "SuperStar",
]

// Seeded random для стабильных результатов
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function makeItem(index: number, timestamp: number): FeedItem {
  const seed = timestamp + index * 1337
  const nameIndex = Math.floor(seededRandom(seed) * BOT_NAMES.length)
  const modeIndex = Math.floor(seededRandom(seed + 1) * MODES.length)
  const win = seededRandom(seed + 2) > 0.42
  const amount = win
    ? Math.round(100 + seededRandom(seed + 3) * 24900)
    : Math.round(50 + seededRandom(seed + 4) * 5950)

  return {
    id: `${timestamp}-${index}`,
    user: BOT_NAMES[nameIndex]!,
    mode: MODES[modeIndex]!.id,
    win,
    amount,
    at: timestamp,
  }
}

export function LiveFeed() {
  const { t } = usePreferences()
  const counterRef = useRef(0)
  const baseTimeRef = useRef(Date.now())

  const [items, setItems] = useState<FeedItem[]>(() => {
    const initial: FeedItem[] = []
    const baseTime = Date.now()
    for (let i = 0; i < 8; i++) {
      initial.push(makeItem(i, baseTime - i * 2000))
    }
    return initial
  })

  useEffect(() => {
    const interval = setInterval(() => {
      counterRef.current += 1
      const newTimestamp = baseTimeRef.current + counterRef.current * 2200

      setItems((prev) => {
        const newItem = makeItem(counterRef.current + 100, newTimestamp)
        return [newItem, ...prev.slice(0, 13)]
      })
    }, 2200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-9 rounded-full border border-border/40 bg-background/80 overflow-hidden flex items-center px-3 gap-3 text-xs">
      <div className="flex items-center gap-2 shrink-0">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="uppercase tracking-[0.16em] text-[10px] text-muted-foreground font-semibold">
          {t("common.live")}
        </span>
      </div>
      <div className="h-4 w-px bg-border/60 shrink-0" />
      <div className="relative flex-1 overflow-hidden">
        <div className="flex items-center justify-end gap-3 pr-2">
          <AnimatePresence initial={false}>
            {items.slice(0, 8).map((it) => {
              const meta = MODES.find((m) => m.id === it.mode)
              const Icon = meta?.icon ?? TrendingUp
              return (
                <motion.div
                  key={it.id}
                  layout="position"
                  initial={{ x: -50, opacity: 0, scale: 0.8 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  exit={{ x: 50, opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full",
                    it.win
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-red-500/10 border border-red-500/20"
                  )}
                >
                  <Icon className={cn("h-3 w-3", meta?.color)} />
                  <span className="max-w-[70px] truncate text-muted-foreground">{it.user}</span>
                  <span className={cn(
                    "font-bold tabular-nums",
                    it.win ? "text-emerald-400" : "text-red-400"
                  )}>
                    {it.win ? "+" : "-"}{it.amount.toLocaleString()}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
