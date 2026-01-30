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

    try {
      const res = await fetch("/api/games/roulette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bets }),
      })

      const data = await res.json()

      if (res.ok) {
        setSpinResult(data.number)

        setTimeout(() => {
          setSpinning(false)
          setResult({
            number: data.number,
            color: data.color,
            totalPayout: data.totalPayout,
            win: data.win,
          })
          setBalance(data.newBalance)
          setBets([])

          setHistory(prev => [{
            number: data.number,
            color: data.color,
            win: data.win
          }, ...prev.slice(0, 14)])

          setLoading(false)
        }, 5500)
      }
    } catch (error) {
      console.error("Game error:", error)
      setSpinning(false)
      setLoading(false)
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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/25">
              <span className="text-2xl">🎡</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">European Roulette</h1>
            <p className="text-sm text-muted-foreground">Place your bets and spin the wheel</p>
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
            title="How to play Roulette"
            description="European roulette with inside & outside bets"
          >
            <p>1. Set chip value in the right panel.</p>
            <p>2. Click numbers or outside areas (red/black, even/odd, dozens, etc.) to place bets.</p>
            <p>3. Each click adds one chip of the selected value to that spot.</p>
            <p>4. Total bet cannot exceed your current balance.</p>
            <p>5. Press <strong>SPIN</strong> to spin the wheel and resolve all bets at once.</p>
            <p>6. Payouts depend on bet type (inside bets pay more, outside bets hit more often).</p>
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
                        ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
                        : "bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30"
                    )}
                  >
                    {result.win ? (
                      <div className="space-y-1">
                        <p className="text-green-400">You won!</p>
                        <p className="text-2xl font-black text-gradient-gold">+{formatBalance(result.totalPayout)}</p>
                      </div>
                    ) : (
                      <p className="text-red-400">No win. Try again!</p>
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
              <span>Place Bets</span>
              <Coins className="h-5 w-5 text-amber-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Balance */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <p className="text-xs text-muted-foreground mb-1">Your Balance</p>
              <p className="text-2xl font-bold text-gradient-gold tabular-nums">{formatBalance(balance)}</p>
            </div>

            {/* Chip Value */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Chip Value</label>
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
                <p className="text-sm font-semibold">Current Bets:</p>
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
                  <span>Total:</span>
                  <span className="text-amber-400 tabular-nums">{formatBalance(totalBet)}</span>
                </div>
              </div>
            )}

            {/* Potential Win */}
            {bets.length > 0 && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Max Potential Win:</span>
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
                Clear
              </Button>
              <Button
                onClick={spin}
                disabled={loading || bets.length === 0}
                className={cn(
                  "flex-1 font-bold",
                  "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700"
                )}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span className="mr-2">🎡</span>
                    SPIN
                  </>
                )}
              </Button>
            </div>

            {/* Payouts Info */}
            <div className="p-3 rounded-lg bg-muted/30 text-xs space-y-1">
              <p className="font-semibold mb-2">Payouts:</p>
              <div className="grid grid-cols-2 gap-1 text-muted-foreground">
                <span>Single number</span><span className="text-amber-400 text-right">35×</span>
                <span>Red/Black</span><span className="text-amber-400 text-right">2×</span>
                <span>Even/Odd</span><span className="text-amber-400 text-right">2×</span>
                <span>Dozens</span><span className="text-amber-400 text-right">3×</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
