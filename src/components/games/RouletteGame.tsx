"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatBalance } from "@/lib/utils"
import { BetType, getBetMultiplier } from "@/lib/game-logic/roulette"
import { Loader2, Volume2, VolumeX, Coins, Trash2, History } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GameHelpModal } from "./GameHelpModal"
import { RouletteWheel, BettingTable } from "./roulette/RouletteWheel"
import { usePreferences } from "@/components/providers/PreferencesProvider"

interface PlacedBet {
  type: BetType
  numbers?: number[]
  amount: number
  label: string
}

interface HistoryItem {
  number: number
  color: string
  win: boolean
}

export function RouletteGame() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = usePreferences()
  const [balance, setBalance] = useState<number>(0)
  const [chipValue, setChipValue] = useState<number>(10)
  const [bets, setBets] = useState<PlacedBet[]>([])
  const [loading, setLoading] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [result, setResult] = useState<{
    number: number
    color: string
    totalPayout: number
    win: boolean
  } | null>(null)
  const [pendingResult, setPendingResult] = useState<{
    number: number
    color: string
    totalPayout: number
    win: boolean
    newBalance: number
  } | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])

  const totalBet = bets.reduce((sum, b) => sum + b.amount, 0)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchBalance()
  }, [])

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

  const placeBet = (type: BetType, label: string, numbers?: number[]) => {
    if (totalBet + chipValue > balance) return

    setBets((prev) => {
      const existing = prev.find((b) => b.type === type && b.label === label)
      if (existing) {
        return prev.map((b) =>
          b.type === type && b.label === label
            ? { ...b, amount: b.amount + chipValue }
            : b
        )
      }
      return [...prev, { type, numbers, amount: chipValue, label }]
    })
  }

  const clearBets = () => {
    setBets([])
    setResult(null)
  }

  const [spinResult, setSpinResult] = useState<number | null>(null)

  const spin = async () => {
    if (!session || bets.length === 0) return

    setLoading(true)
    setSpinning(true)
    setResult(null)
    setSpinResult(null)
    setPendingResult(null)

    try {
      const res = await fetch("/api/games/roulette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bets }),
      })

      const data = await res.json()

      if (res.ok) {
        setSpinResult(data.number)
        setPendingResult({
          number: data.number,
          color: data.color,
          totalPayout: data.totalPayout,
          win: data.win,
          newBalance: data.newBalance,
        })
      }
    } catch (error) {
      console.error("Game error:", error)
      setSpinning(false)
      setLoading(false)
    }
  }

  const handleSpinComplete = () => {
    if (!pendingResult) return
    setSpinning(false)
    setResult({
      number: pendingResult.number,
      color: pendingResult.color,
      totalPayout: pendingResult.totalPayout,
      win: pendingResult.win,
    })
    setBalance(pendingResult.newBalance)
    setBets([])
    setHistory(prev => [{
      number: pendingResult.number,
      color: pendingResult.color,
      win: pendingResult.win
    }, ...prev.slice(0, 14)])
    setPendingResult(null)
    setLoading(false)
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center shadow-lg shadow-black/20">
              <span className="text-2xl">🎡</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("games.roulette.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("games.roulette.subtitle")}</p>
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
            title={t("games.roulette.helpTitle")}
            description={t("games.roulette.helpDesc")}
          >
            <p>1. {t("games.roulette.helpStep1")}</p>
            <p>2. {t("games.roulette.helpStep2")}</p>
            <p>3. {t("games.roulette.helpStep3")}</p>
            <p>4. {t("games.roulette.helpStep4")}</p>
            <p>5. {t("games.roulette.helpStep5")}</p>
            <p>6. {t("games.roulette.helpStep6")}</p>
          </GameHelpModal>
        </div>
      </div>

      {/* History bar */}
      {history.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50">
          <History className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {history.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white",
                  item.color === "red" && "bg-red-600",
                  item.color === "black" && "bg-gray-800",
                  item.color === "green" && "bg-green-600"
                )}
              >
                {item.number}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Game Area */}
        <Card className="xl:col-span-3">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-8">
              <RouletteWheel
                spinning={spinning}
                result={spinResult}
                onSpinComplete={handleSpinComplete}
              />

              {/* Result Display */}
              <AnimatePresence>
                {result && !spinning && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "text-xl font-bold p-5 rounded-xl text-center w-full max-w-md",
                      result.win
                        ? "bg-emerald-500/20 border border-emerald-500/30"
                        : "bg-rose-500/20 border border-rose-500/30"
                    )}
                  >
                    {result.win ? (
                      <div className="space-y-1">
                        <p className="text-green-400">{t("games.roulette.youWon")}</p>
                        <p className="text-2xl font-black text-amber-300">+{formatBalance(result.totalPayout)}</p>
                      </div>
                    ) : (
                      <p className="text-red-400">{t("games.roulette.noWin")}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Betting Table */}
              <BettingTable
                onPlaceBet={placeBet}
                disabled={loading || spinning}
                currentBets={bets}
              />
            </div>
          </CardContent>
        </Card>

        {/* Betting Panel */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span>{t("games.roulette.placeBets")}</span>
              <Coins className="h-5 w-5 text-amber-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Balance */}
            <div className="p-4 rounded-xl surface-soft border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">{t("common.balance")}</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">{formatBalance(balance)}</p>
            </div>

            {/* Chip Value */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("games.bonus.chipValue")}</label>
              <Input
                type="number"
                value={chipValue}
                onChange={(e) => setChipValue(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                disabled={loading}
                className="text-lg font-semibold h-12"
              />
              <div className="grid grid-cols-5 gap-1">
                {[1, 5, 10, 25, 100].map((val) => (
                  <Button
                    key={val}
                    variant={chipValue === val ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChipValue(val)}
                    disabled={loading}
                    className={cn(
                      "text-xs font-bold",
                      chipValue === val && "bg-amber-500 hover:bg-amber-600"
                    )}
                  >
                    {val}
                  </Button>
                ))}
              </div>
            </div>

            {/* Current Bets */}
            {bets.length > 0 && (
              <div className="p-4 rounded-xl bg-muted/30 space-y-3 max-h-48 overflow-y-auto">
                <p className="text-sm font-semibold">{t("games.roulette.currentBets")}</p>
                {bets.map((bet, i) => (
                  <div key={i} className="flex justify-between text-sm items-center">
                    <span className="text-muted-foreground">{bet.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="tabular-nums">{formatBalance(bet.amount)}</span>
                      <span className="text-amber-400 text-xs">({getBetMultiplier(bet.type)}×)</span>
                    </div>
                  </div>
                ))}
                <div className="border-t border-border pt-3 mt-3 flex justify-between font-bold">
                  <span>{t("common.total")}:</span>
                  <span className="text-amber-400 tabular-nums">{formatBalance(totalBet)}</span>
                </div>
              </div>
            )}

            {/* Potential Win */}
            {bets.length > 0 && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("games.roulette.maxWin")}</span>
                  <span className="text-green-400 font-bold">
                    {formatBalance(bets.reduce((sum, b) => sum + b.amount * getBetMultiplier(b.type), 0))}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearBets}
                disabled={loading || bets.length === 0}
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {t("games.bonus.clear")}
              </Button>
              <Button
                onClick={spin}
                disabled={loading || bets.length === 0}
                className={cn(
                  "flex-1 font-bold",
                  "bg-rose-500 text-white hover:bg-rose-600"
                )}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span className="mr-2">🎡</span>
                    {t("games.roulette.spin")}
                  </>
                )}
              </Button>
            </div>

            {/* Payouts Info */}
            <div className="p-3 rounded-lg bg-muted/30 text-xs space-y-1">
              <p className="font-semibold mb-2">{t("games.roulette.payouts")}</p>
              <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                <span>{t("games.roulette.payout.single")}</span><span className="text-amber-400 text-right">35×</span>
                <span>{t("games.roulette.payout.redBlack")}</span><span className="text-amber-400 text-right">2×</span>
                <span>{t("games.roulette.payout.evenOdd")}</span><span className="text-amber-400 text-right">2×</span>
                <span>{t("games.roulette.payout.dozen")}</span><span className="text-amber-400 text-right">3×</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
