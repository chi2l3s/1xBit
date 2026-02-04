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

const REWARDS = [{ label: "Повестка", value: 0, type: "summons" }]

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
  const [reward, setReward] = useState<(typeof REWARDS)[number] | null>(null)
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
    const targetRotation = 360 * 7 + (REWARDS.length - index) * slice - slice / 2
    setRotation(prev => prev + targetRotation)
    const rewardValue = REWARDS[index]
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
              <div className="relative w-72 h-72 sm:w-[420px] sm:h-[420px]">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 via-fuchsia-500/20 to-amber-300/30 blur-3xl" />
                <motion.div
                  className="relative w-full h-full rounded-full border-[14px] border-amber-200/80 shadow-[0_26px_60px_rgba(15,23,42,0.5)] overflow-hidden"
                  animate={{ rotate: rotation }}
                  transition={{ duration: 5, ease: [0.12, 0.85, 0.18, 1] }}
                  style={{
                    background:
                      "conic-gradient(#fde047 0deg 36deg, #a855f7 36deg 72deg, #22c55e 72deg 108deg, #38bdf8 108deg 144deg, #f472b6 144deg 180deg, #f59e0b 180deg 216deg, #34d399 216deg 252deg, #c084fc 252deg 288deg, #60a5fa 288deg 324deg, #fb7185 324deg 360deg)",
                  }}
                >
                  {REWARDS.map((item, index) => (
                    <div
                      key={item.label}
                      className="absolute left-1/2 top-1/2 h-1/2 w-1/2 origin-bottom-left"
                      style={{ transform: `rotate(${index * (360 / REWARDS.length)}deg)` }}
                    >
                      <div className="absolute left-6 top-6 w-36 -rotate-90 text-[11px] font-semibold text-slate-950/90">
                        {item.label}
                      </div>
                    </div>
                  ))}
                  <div className="absolute inset-8 rounded-full bg-slate-950/90 border border-white/10 flex items-center justify-center">
                    <div className="text-center space-y-1">
                      <p className="text-[10px] uppercase tracking-[0.45em] text-amber-300">{t("games.freeSpin.prize")}</p>
                      <p className="text-3xl font-black text-white">
                        {reward ? (reward.type === "summons" ? "Повестка" : `+${reward.value}`) : "?"}
                      </p>
                    </div>
                  </div>
                </motion.div>
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="h-8 w-8 rotate-45 bg-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.9)]" />
                  <div className="mt-1 h-2 w-2 rounded-full bg-amber-200" />
                </div>
              </div>

              {reward?.type === "summons" && (
                <motion.div
                  className="relative w-full max-w-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="relative rounded-3xl bg-slate-900/70 border border-white/10 p-6 overflow-hidden">
                    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-rose-500/20 blur-3xl" />
                    <div className="absolute -left-16 -bottom-16 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
                    <div className="relative">
                      <p className="text-xs uppercase tracking-[0.4em] text-rose-300">Важное уведомление</p>
                      <p className="text-lg font-semibold text-white">Повестка на СВО</p>
                      <p className="text-sm text-white/70">
                        Письмо с уведомлением уже сформировано. Проверьте данные внутри.
                      </p>
                    </div>
                    <div className="relative mt-6 h-60">
                      <motion.div
                        className="absolute inset-x-8 bottom-8 h-36 rounded-2xl bg-gradient-to-br from-white via-amber-50 to-amber-100 shadow-[0_12px_30px_rgba(15,23,42,0.35)]"
                        initial={{ y: 90, opacity: 0 }}
                        animate={{ y: -8, opacity: 1 }}
                        transition={{ duration: 1.1, ease: [0.2, 0.8, 0.2, 1] }}
                      >
                        <div className="h-full rounded-2xl border border-amber-300/40 bg-white/95 p-5 text-slate-800">
                          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-500">Повестка</p>
                          <p className="text-base font-semibold">Андрухов Илья Сергеевич</p>
                          <p className="text-sm text-slate-600">2009 года рождения</p>
                          <div className="mt-4 h-px w-full bg-slate-200" />
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-slate-500">Подпись</span>
                            <span className="font-hand text-base text-slate-700">И. С. Андрухов</span>
                          </div>
                        </div>
                      </motion.div>
                      <div className="absolute inset-x-2 bottom-0 h-32 rounded-[28px] bg-amber-300/20 blur-lg" />
                      <div className="absolute inset-x-5 bottom-1 h-28 rounded-3xl bg-amber-200/40 border border-amber-200/50" />
                      <div className="absolute inset-x-5 bottom-1 h-28 rounded-3xl bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200 shadow-[0_10px_25px_rgba(15,23,42,0.25)]" />
                      <div className="absolute inset-x-5 bottom-1 h-28 rounded-3xl border border-amber-100/60" />
                      <div className="absolute inset-x-5 bottom-1 h-28">
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-200/40 via-transparent to-transparent" />
                        <div className="absolute inset-0 rounded-3xl border border-amber-100/50" />
                        <div className="absolute left-1/2 top-0 h-14 w-14 -translate-x-1/2 -translate-y-6 rotate-45 bg-amber-200/90 border border-amber-100/80" />
                      </div>
                      <motion.div
                        className="absolute inset-x-5 bottom-[84px] h-16 origin-top"
                        initial={{ rotateX: 0 }}
                        animate={{ rotateX: -155 }}
                        transition={{ delay: 0.2, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-200 via-amber-100 to-amber-50 border border-amber-100/70 shadow-[0_6px_16px_rgba(15,23,42,0.25)]" />
                        <div className="absolute left-1/2 top-0 h-12 w-12 -translate-x-1/2 -translate-y-6 rotate-45 bg-amber-200/90 border border-amber-100/80" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              )}

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
                {reward ? (reward.type === "summons" ? "Повестка на СВО" : `+${formatBalance(reward.value)}`) : "--"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
