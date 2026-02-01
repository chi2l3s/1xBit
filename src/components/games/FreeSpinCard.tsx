"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Gift, Sparkles } from "lucide-react"
import { formatBalance } from "@/lib/utils"
import { usePreferences } from "@/components/providers/PreferencesProvider"
import { cn } from "@/lib/utils"
import Link from "next/link"

const TWELVE_HOURS = 12 * 60 * 60 * 1000
const STORAGE_KEY = "slots-free-spin-claim"

const formatRemaining = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`
}

export function FreeSpinCard({ className }: { className?: string }) {
  const { t } = usePreferences()
  const [lastClaim, setLastClaim] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [lastReward, setLastReward] = useState<number | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setLastClaim(Number(stored))
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const nextAvailable = useMemo(() => {
    if (!lastClaim) return 0
    return Math.max(0, lastClaim + TWELVE_HOURS - now)
  }, [lastClaim, now])

  const canClaim = nextAvailable === 0

  const handleClaim = () => {
    if (!canClaim) return
    const reward = Math.floor(15 + Math.random() * 85)
    const timestamp = Date.now()
    localStorage.setItem(STORAGE_KEY, String(timestamp))
    setLastClaim(timestamp)
    setLastReward(reward)
  }

  return (
    <div className={cn("rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-purple-300" />
          <div>
            <p className="text-sm font-semibold">{t("games.freeSpin.title")}</p>
            <p className="text-xs text-muted-foreground">{t("games.freeSpin.subtitle")}</p>
          </div>
        </div>
        <motion.button
          type="button"
          onClick={handleClaim}
          disabled={!canClaim}
          whileHover={canClaim ? { scale: 1.03 } : undefined}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            canClaim
              ? "bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.6)]"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
        >
          {canClaim ? t("games.freeSpin.claim") : t("games.freeSpin.next")}
        </motion.button>
      </div>

      <Link
        href="/free-spin"
        className="mt-3 flex items-center justify-between rounded-xl bg-background/70 px-3 py-2 text-xs font-semibold text-purple-200 hover:text-white transition-colors"
      >
        <span>{t("games.freeSpin.openWheel")}</span>
        <span>→</span>
      </Link>

      <div className="mt-3 flex items-center justify-between rounded-xl bg-background/60 px-3 py-2">
        <div className="text-xs text-muted-foreground">
          {canClaim ? t("games.freeSpin.available") : t("games.freeSpin.timer")}
        </div>
        <div className="text-sm font-bold text-purple-200">
          {canClaim ? t("games.freeSpin.ready") : formatRemaining(nextAvailable)}
        </div>
      </div>

      {lastReward !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 rounded-xl bg-purple-500/20 px-3 py-2"
        >
          <Sparkles className="h-4 w-4 text-purple-200" />
          <span className="text-xs text-purple-100">{t("games.freeSpin.reward")}</span>
          <span className="ml-auto text-sm font-bold text-purple-200">
            +{formatBalance(lastReward)}
          </span>
        </motion.div>
      )}
    </div>
  )
}
