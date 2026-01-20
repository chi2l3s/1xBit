"use client"

import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import { cn, randomFloat, randomInt } from "@/lib/utils"
import { AnimatePresence, motion } from "framer-motion"
import { CircleDot, Dices, Spade, SquareStack, TrendingUp } from "lucide-react"

type FeedItem = {
  id: string
  user: string
  mode: string
  win: boolean
  amount: number
  at: number
}

const MODES = [
  { id: "Crash", icon: TrendingUp },
  { id: "Dice", icon: Dices },
  { id: "Slots", icon: SquareStack },
  { id: "Roulette", icon: CircleDot },
  { id: "Blackjack", icon: Spade },
]

const NAMES = [
  "CryptoKing",
  "LuckyAce",
  "BitMaster",
  "MoonRider",
  "NeonFox",
  "0xVlad",
  "Satoshi",
  "Drusha",
  "NightOwl",
  "KinoMax",
]

function makeItem(user: string): FeedItem {
  const mode = MODES[randomInt(0, MODES.length - 1)]!.id
  const win = Math.random() > 0.45
  const amount = win ? randomFloat(120, 25000) : randomFloat(50, 6000)
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    user,
    mode,
    win,
    amount: Math.round(amount),
    at: Date.now(),
  }
}

export function LiveFeed() {
  const { data: session } = useSession()
  const sessionName = useMemo(() => {
    const raw = session?.user?.name || session?.user?.email || ""
    const base = raw.includes("@") ? raw.split("@")[0] : raw
    return base?.trim() ? base.slice(0, 14) : null
  }, [session?.user?.email, session?.user?.name])

  const [items, setItems] = useState<FeedItem[]>(() => {
    // Стартовый набор без очевидных повторов подряд
    const seed: FeedItem[] = []
    let lastName: string | null = null
    for (let i = 0; i < 8; i++) {
      let name = NAMES[randomInt(0, NAMES.length - 1)]!
      let guard = 0
      while (name === lastName && guard < 4) {
        name = NAMES[randomInt(0, NAMES.length - 1)]!
        guard++
      }
      lastName = name
      seed.push(makeItem(name))
    }
    return seed
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => {
        const useSessionUser = sessionName && Math.random() < 0.2
        const lastUser = prev[0]?.user
        let name = useSessionUser ? sessionName! : NAMES[randomInt(0, NAMES.length - 1)]!
        let guard = 0
        while (name === lastUser && !useSessionUser && guard < 4) {
          name = NAMES[randomInt(0, NAMES.length - 1)]!
          guard++
        }
        const next = [makeItem(name), ...prev]
        return next.slice(0, 14)
      })
    }, 2200)
    return () => clearInterval(interval)
  }, [sessionName])

  const showItems = items.length ? items : [makeItem("Player")]

  return (
    <div className="h-9 rounded-full border border-border/40 bg-background/80 overflow-hidden flex items-center px-3 gap-3 text-xs">
      <div className="flex items-center gap-2 shrink-0">
        <span className="inline-flex h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
        <span className="uppercase tracking-[0.16em] text-[10px] text-muted-foreground font-semibold">
          Live wins / losses
        </span>
      </div>
      <div className="h-4 w-px bg-border/60 shrink-0" />
      <div className="relative flex-1 overflow-hidden">
        <div className="flex items-center justify-end gap-4 pr-2">
          <AnimatePresence initial={false}>
            {showItems.map((it) => {
              const meta = MODES.find((m) => m.id === it.mode)
              const Icon = meta?.icon ?? TrendingUp
              return (
                <motion.div
                  key={it.id}
                  layout="position"
                  initial={{ x: -40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 40, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground whitespace-nowrap bg-background/40 px-2 py-1 rounded-full"
                >
                  <Icon
                    className={cn(
                      "h-3 w-3",
                      it.win ? "text-emerald-400" : "text-red-400"
                    )}
                  />
                  <span className="max-w-[80px] truncate">{it.user}</span>
                  <span className={cn("font-semibold tabular-nums", it.win ? "text-emerald-400" : "text-red-400")}>
                    {it.win ? "+" : "-"}
                    {it.amount.toLocaleString("ru-RU")}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70">· {it.mode}</span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}


