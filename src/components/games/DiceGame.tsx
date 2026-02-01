"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { cn, formatBalance } from "@/lib/utils"
import { calculateDiceMultiplier } from "@/lib/game-logic/dice"
import { ArrowUp, ArrowDown, Loader2, TrendingUp, History, Volume2, VolumeX } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GameHelpModal } from "./GameHelpModal"
import { AnimatedDice, DiceResultDisplay } from "./dice/AnimatedDice"
import { usePreferences } from "@/components/providers/PreferencesProvider"
import { RecentWins } from "./RecentWins"

interface HistoryItem {
  roll: number
  target: number
  isOver: boolean
  win: boolean
  payout: number
}

export function DiceGame() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = usePreferences()
  const [balance, setBalance] = useState<number>(0)
  const [bet, setBet] = useState<number>(100)
  const [target, setTarget] = useState<number>(50)
  const [isOver, setIsOver] = useState<boolean>(true)
  const [loading, setLoading] = useState(false)
  const [rolling, setRolling] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const rollAudioRef = useRef<HTMLAudioElement | null>(null)
  const [result, setResult] = useState<{
    roll: number
    win: boolean
    payout: number
  } | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])

  const multiplier = calculateDiceMultiplier(target, isOver)
  const winChance = isOver ? 100 - target : target

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchBalance()
  }, [])

  useEffect(() => {
    const audio = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_4f7f1b9981.mp3?filename=dice-roll-20557.mp3")
    audio.preload = "auto"
    audio.loop = true
    audio.volume = 0.5
    rollAudioRef.current = audio

    return () => {
      audio.pause()
      rollAudioRef.current = null
    }
  }, [])

  useEffect(() => {
    const audio = rollAudioRef.current
    if (!audio) return

    if (rolling && soundEnabled) {
      audio.currentTime = 0
      audio.play().catch(() => {})
    } else {
      audio.pause()
      audio.currentTime = 0
    }
  }, [rolling, soundEnabled])

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

  const handlePlay = async () => {
    if (!session || bet <= 0 || bet > balance) return

    setLoading(true)
    setRolling(true)
    setResult(null)

    try {
      const res = await fetch("/api/games/dice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bet, target, isOver }),
      })

      const data = await res.json()

      // Wait for dice animation
      await new Promise(resolve => setTimeout(resolve, 1200))

      setRolling(false)

      if (res.ok) {
        const newResult = {
          roll: data.roll,
          win: data.win,
          payout: data.payout,
        }
        setResult(newResult)
        setBalance(data.newBalance)
        setHistory(prev => [{
          roll: data.roll,
          target,
          isOver,
          win: data.win,
          payout: data.payout
        }, ...prev.slice(0, 9)])
      }
    } catch (error) {
      console.error("Game error:", error)
      setRolling(false)
    } finally {
      setLoading(false)
    }
  }

  const handleBetChange = (value: string) => {
    const num = parseFloat(value)
    if (!isNaN(num) && num >= 0) {
      setBet(Math.min(num, balance))
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center shadow-lg shadow-black/20">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-primary" fill="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <circle cx="8" cy="8" r="1.5"/>
                <circle cx="16" cy="8" r="1.5"/>
                <circle cx="12" cy="12" r="1.5"/>
                <circle cx="8" cy="16" r="1.5"/>
                <circle cx="16" cy="16" r="1.5"/>
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("games.dice.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("games.dice.subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-muted-foreground"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          <GameHelpModal
            title={t("games.dice.helpTitle")}
            description={t("games.dice.helpDesc")}
          >
            <p>1. {t("games.dice.helpStep1")}</p>
            <p>2. {t("games.dice.helpStep2")}</p>
            <p>3. {t("games.dice.helpStep3")}</p>
            <ul className="list-disc list-inside ml-2">
              <li>
                <strong>{t("games.dice.rollUnder")}</strong> — {t("games.dice.helpStep4")}
              </li>
              <li>
                <strong>{t("games.dice.rollOver")}</strong> — {t("games.dice.helpStep5")}
              </li>
            </ul>
            <p>4. {t("games.dice.helpStep6")}</p>
            <p>5. {t("games.dice.helpStep7")}</p>
          </GameHelpModal>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Game Area */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardContent className="p-0">
            {/* Dice Display Area */}
            <div className="relative bg-background/80 p-8 min-h-[320px] flex flex-col items-center justify-center">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col items-center gap-6">
                <AnimatePresence mode="wait">
                  {rolling ? (
                    <motion.div
                      key="rolling"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <AnimatedDice value={null} isRolling={true} size={140} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <DiceResultDisplay
                        value={result?.roll ?? null}
                        target={target}
                        isOver={isOver}
                        win={result?.win ?? null}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {result && !rolling && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
                      className={cn(
                        "text-lg font-bold px-6 py-2 rounded-full",
                        result.win
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      )}
                    >
                      {result.win
                        ? `+${formatBalance(result.payout - bet)} ${t("common.profit")}!`
                        : `-${formatBalance(bet)} ${t("common.lost")}`}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Slider Area */}
            <div className="p-6 space-y-6 border-t border-border/50">
              {/* Visual progress bar */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">0</span>
                  <motion.span
                    key={target}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="text-xl font-bold tabular-nums"
                  >
                    {target}
                  </motion.span>
                  <span className="text-muted-foreground">100</span>
                </div>

                <div className="relative h-10 rounded-full overflow-hidden bg-muted/30">
                  {/* Win zone indicator */}
                  <motion.div
                    className={cn(
                      "absolute top-0 h-full transition-all duration-300",
                      isOver ? "bg-emerald-400/40" : "bg-rose-400/40"
                    )}
                    style={{
                      left: isOver ? `${target}%` : 0,
                      width: isOver ? `${100 - target}%` : `${target}%`,
                    }}
                  />

                  {/* Lose zone */}
                  <motion.div
                    className={cn(
                      "absolute top-0 h-full transition-all duration-300 opacity-30",
                      isOver ? "bg-red-500/30" : "bg-green-500/30"
                    )}
                    style={{
                      left: isOver ? 0 : `${target}%`,
                      width: isOver ? `${target}%` : `${100 - target}%`,
                    }}
                  />

                  {/* Target line */}
                  <motion.div
                    className="absolute top-0 w-1 h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ left: `${target}%`, transform: 'translateX(-50%)' }}
                  />

                  {/* Result indicator */}
                  <AnimatePresence>
                    {result && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold",
                          result.win
                            ? "bg-green-500 border-green-300 text-white"
                            : "bg-red-500 border-red-300 text-white"
                        )}
                        style={{ left: `${result.roll}%`, transform: 'translate(-50%, -50%)' }}
                      >
                        {result.roll}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Slider
                    value={[target]}
                    onValueChange={(v) => setTarget(v[0])}
                    min={2}
                    max={98}
                    step={1}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={rolling}
                  />
                </div>
              </div>

              {/* Mode Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={!isOver ? "default" : "outline"}
                  className={cn(
                    "h-14 text-lg font-semibold transition-all",
                    !isOver && "bg-rose-500 text-white hover:bg-rose-600"
                  )}
                  onClick={() => setIsOver(false)}
                  disabled={rolling}
                >
                  <ArrowDown className="mr-2 h-5 w-5" />
                  {t("games.dice.rollUnder")} {target}
                </Button>
                <Button
                  variant={isOver ? "default" : "outline"}
                  className={cn(
                    "h-14 text-lg font-semibold transition-all",
                    isOver && "bg-emerald-500 text-white hover:bg-emerald-600"
                  )}
                  onClick={() => setIsOver(true)}
                  disabled={rolling}
                >
                  <ArrowUp className="mr-2 h-5 w-5" />
                  {t("games.dice.rollOver")} {target}
                </Button>
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="p-4 bg-muted/20 border-t border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{t("games.dice.recentRolls")}</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {history.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "shrink-0 px-3 py-1.5 rounded-full text-sm font-medium",
                        item.win
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      )}
                    >
                      {item.roll}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Betting Panel */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span>{t("games.betPanel.title")}</span>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Balance */}
            <div className="p-4 rounded-xl surface-soft border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">{t("games.bonus.balance")}</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">{formatBalance(balance)}</p>
            </div>

            {/* Bet Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("games.bonus.bet")}</label>
              <Input
                type="number"
                value={bet}
                onChange={(e) => handleBetChange(e.target.value)}
                min={1}
                max={balance}
                disabled={rolling}
                className="text-lg font-semibold h-12"
              />
              <div className="grid grid-cols-4 gap-2">
                {[0.5, 2, "½", "MAX"].map((mult) => (
                  <Button
                    key={String(mult)}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (mult === "MAX") setBet(balance)
                      else if (mult === "½") setBet(Math.floor(balance / 2))
                      else setBet(prev => Math.min(prev * (mult as number), balance))
                    }}
                    disabled={rolling}
                    className="text-xs"
                  >
                    {mult === "½" ? "½" : mult === "MAX" ? "MAX" : `${mult}×`}
                  </Button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3 p-4 rounded-xl bg-muted/30">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("common.winChance")}</span>
                <motion.span
                  key={winChance}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold"
                >
                  {winChance.toFixed(2)}%
                </motion.span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("common.multiplier")}</span>
                <motion.span
                  key={multiplier}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold text-amber-300"
                >
                  {multiplier.toFixed(4)}×
                </motion.span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">{t("games.dice.profitOnWin")}</span>
                <motion.span
                  key={`${bet}-${multiplier}`}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-lg font-bold text-green-400"
                >
                  +{formatBalance(Math.floor(bet * multiplier - bet))}
                </motion.span>
              </div>
            </div>

            {/* Roll Button */}
            <Button
              className={cn(
                "w-full h-14 text-lg font-bold",
                isOver
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "bg-rose-500 text-white hover:bg-rose-600"
              )}
              onClick={handlePlay}
              disabled={loading || bet <= 0 || bet > balance}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {t("games.dice.rolling")}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {isOver ? <ArrowUp className="h-5 w-5" /> : <ArrowDown className="h-5 w-5" />}
                  {isOver ? t("games.dice.rollOver") : t("games.dice.rollUnder")} {target}
                </span>
              )}
            </Button>

            <RecentWins />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
