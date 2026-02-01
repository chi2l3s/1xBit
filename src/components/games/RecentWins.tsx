"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Trophy, Sparkles } from "lucide-react"
import { formatBalance } from "@/lib/utils"
import { usePreferences } from "@/components/providers/PreferencesProvider"
import { cn } from "@/lib/utils"

const BOT_NAMES = [
  "Alex Vega",
  "Luna Rivers",
  "Jack Thompson",
  "Mila Stone",
  "Noah Walker",
  "Sophia Reyes",
  "Ethan Carter",
  "Ava Brooks",
  "Leo Hart",
  "Chloe Bennett",
  "Алибек Золотоелдович",
  "Николай Красильников",
  "Светлана Миронова",
  "Илья Сорокин",
  "Марта Белова",
  "Денис Головин",
  "Арсен Караев",
  "Юлия Пахомова",
  "Олег Пономарёв",
  "Виктория Никифорова",
]

const GAME_LABELS = [
  "Crash",
  "Dice",
  "Slots",
  "Roulette",
  "Blackjack",
  "Poker",
]

interface WinItem {
  id: string
  name: string
  amount: number
  game: string
  createdAt: number
}

const makeWin = () => {
  const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]
  const game = GAME_LABELS[Math.floor(Math.random() * GAME_LABELS.length)]
  const base = 25 + Math.random() * 600
  const amount = Math.round(base * 100) / 100
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    amount,
    game,
    createdAt: Date.now(),
  }
}

export function RecentWins({ className }: { className?: string }) {
  const { t } = usePreferences()
  const [wins, setWins] = useState<WinItem[]>([])

  useEffect(() => {
    setWins(Array.from({ length: 4 }).map(() => makeWin()))
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setWins(prev => {
        const next = [makeWin(), ...prev]
        return next.slice(0, 6)
      })
    }, 2600)

    return () => clearInterval(interval)
  }, [])

  const totalJackpot = useMemo(
    () => wins.reduce((sum, item) => sum + item.amount, 0),
    [wins]
  )

  return (
    <div className={cn("rounded-2xl border border-amber-400/20 bg-muted/30 p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          <div>
            <p className="text-sm font-semibold">{t("games.recentWins.title")}</p>
            <p className="text-xs text-muted-foreground">{t("games.recentWins.subtitle")}</p>
          </div>
        </div>
        <motion.div
          key={totalJackpot}
          initial={{ scale: 1.1, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xs font-bold text-amber-300"
        >
          {formatBalance(totalJackpot)}
        </motion.div>
      </div>

      <div className="mt-3 space-y-2">
        <AnimatePresence initial={false}>
          {wins.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 30, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -30, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="flex items-center justify-between rounded-xl bg-background/70 px-3 py-2 shadow-[0_8px_20px_rgba(15,23,42,0.2)]"
            >
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-amber-400/10 text-amber-300 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.game}</p>
                </div>
              </div>
              <motion.span
                key={item.amount}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-sm font-bold text-green-400"
              >
                +{formatBalance(item.amount)}
              </motion.span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
