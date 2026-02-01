"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Gift, Sparkles, Ticket, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn, formatBalance } from "@/lib/utils"
import { usePreferences } from "@/components/providers/PreferencesProvider"

const STORAGE_KEY = "free-spin-wheel-last"
const TWELVE_HOURS = 12 * 60 * 60 * 1000
const PROMO_CODE = "FREEBONUS"

const REWARDS = [
  { label: "10", value: 10 },
  { label: "20", value: 20 },
  { label: "30", value: 30 },
  { label: "50", value: 50 },
  { label: "75", value: 75 },
  { label: "100", value: 100 },
  { label: "150", value: 150 },
  { label: "200", value: 200 },
]

const formatRemaining = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`
}

export default function FreeSpinPage() {
  const { t } = usePreferences()
  const [lastSpin, setLastSpin] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [reward, setReward] = useState<number | null>(null)
  const [promo, setPromo] = useState("")
  const [promoUnlocked, setPromoUnlocked] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setLastSpin(Number(stored))
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  const nextAvailable = useMemo(() => {
    if (!lastSpin) return 0
    return Math.max(0, lastSpin + TWELVE_HOURS - now)
  }, [lastSpin, now])

  const canSpin = nextAvailable === 0 || promoUnlocked

  const spinWheel = () => {
    if (!canSpin || spinning) return
    setSpinning(true)
    const index = Math.floor(Math.random() * REWARDS.length)
    const slice = 360 / REWARDS.length
    const targetRotation = 360 * 6 + (REWARDS.length - index) * slice - slice / 2
    setRotation(prev => prev + targetRotation)
    const rewardValue = REWARDS[index].value
    setTimeout(() => {
      setReward(rewardValue)
      const timestamp = Date.now()
      localStorage.setItem(STORAGE_KEY, String(timestamp))
      setLastSpin(timestamp)
      setPromoUnlocked(false)
      setSpinning(false)
    }, 4200)
  }

  const handlePromo = () => {
    if (promo.trim().toUpperCase() !== PROMO_CODE) return
    setPromo("")
    setPromoUnlocked(true)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center shadow-lg shadow-black/20">
            <Gift className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("games.freeSpin.wheelTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("games.freeSpin.wheelSubtitle")}</p>
          </div>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/games/slots" className="flex items-center gap-2 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            {t("games.freeSpin.backToSlots")}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-72 h-72 sm:w-80 sm:h-80">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/40 via-fuchsia-500/20 to-amber-300/30 blur-2xl" />
                <motion.div
                  className="relative w-full h-full rounded-full border-[10px] border-amber-300/60 shadow-[0_20px_40px_rgba(15,23,42,0.4)] overflow-hidden"
                  animate={{ rotate: rotation }}
                  transition={{ duration: 4.2, ease: [0.12, 0.8, 0.2, 1] }}
                  style={{
                    background:
                      "conic-gradient(#fbbf24 0deg 45deg, #a855f7 45deg 90deg, #22c55e 90deg 135deg, #eab308 135deg 180deg, #f472b6 180deg 225deg, #4ade80 225deg 270deg, #f97316 270deg 315deg, #60a5fa 315deg 360deg)",
                  }}
                >
                  <div className="absolute inset-6 rounded-full bg-slate-950/80 border border-white/10 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-xs uppercase tracking-[0.25em] text-amber-300">{t("games.freeSpin.prize")}</p>
                      <p className="text-3xl font-black text-white">{reward ? `+${reward}` : "?"}</p>
                    </div>
                  </div>
                </motion.div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="w-6 h-6 bg-amber-300 rounded-full shadow-[0_0_18px_rgba(251,191,36,0.9)]" />
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">{t("games.freeSpin.timer")}</p>
                <p className="text-xl font-bold text-purple-200">
                  {canSpin ? t("games.freeSpin.ready") : formatRemaining(nextAvailable)}
                </p>
              </div>

              <Button
                className={cn(
                  "w-full max-w-xs h-12 text-lg font-bold",
                  canSpin ? "bg-purple-500 text-white hover:bg-purple-600" : "bg-muted text-muted-foreground"
                )}
                onClick={spinWheel}
                disabled={!canSpin || spinning}
              >
                {spinning ? t("games.freeSpin.spinning") : t("games.freeSpin.spinNow")}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="rounded-xl bg-muted/40 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <p className="text-sm font-semibold">{t("games.freeSpin.howItWorks")}</p>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>{t("games.freeSpin.rule1")}</li>
                <li>{t("games.freeSpin.rule2")}</li>
                <li>{t("games.freeSpin.rule3")}</li>
              </ul>
            </div>

            <div className="rounded-xl bg-purple-500/10 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-purple-300" />
                <p className="text-sm font-semibold">{t("games.freeSpin.promoTitle")}</p>
              </div>
              <input
                value={promo}
                onChange={(event) => setPromo(event.target.value)}
                placeholder={PROMO_CODE}
                className="w-full rounded-lg bg-background/70 border border-purple-500/30 px-3 py-2 text-sm"
              />
              <Button
                className="w-full h-10 bg-purple-500 text-white hover:bg-purple-600"
                onClick={handlePromo}
              >
                {t("games.freeSpin.applyPromo")}
              </Button>
              {promoUnlocked && (
                <div className="text-xs text-purple-200">
                  {t("games.freeSpin.promoReady")}
                </div>
              )}
            </div>

            <div className="rounded-xl bg-emerald-500/10 p-4">
              <p className="text-xs text-muted-foreground">{t("games.freeSpin.lastReward")}</p>
              <p className="text-lg font-bold text-emerald-300">
                {reward ? `+${formatBalance(reward)}` : "--"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
