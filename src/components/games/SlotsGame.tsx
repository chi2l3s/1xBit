"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatBalance } from "@/lib/utils"
import { Loader2, Sparkles, Volume2, VolumeX, Zap, Trophy, History } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GameHelpModal } from "./GameHelpModal"
import { SlotMachine, SLOT_SYMBOLS, SlotSymbol } from "./slots/SlotReel"

interface HistoryItem {
  win: boolean
  payout: number
  time: string
}

export function SlotsGame() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [balance, setBalance] = useState<number>(0)
  const [bet, setBet] = useState<number>(100)
  const [loading, setLoading] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [grid, setGrid] = useState<string[][]>([
    ["cherry", "lemon", "orange", "grape", "bell"],
    ["diamond", "seven", "cherry", "lemon", "orange"],
    ["bell", "grape", "diamond", "seven", "cherry"],
  ])
  const [result, setResult] = useState<{
    win: boolean
    payout: number
    winLines: { line: number; symbols: string; multiplier: number }[]
  } | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [jackpot, setJackpot] = useState(125847)

  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot(prev => prev + Math.floor(Math.random() * 10))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

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

  const spin = async () => {
    if (!session || bet <= 0 || bet > balance) return

    setLoading(true)
    setSpinning(true)
    setResult(null)

    try {
      const res = await fetch("/api/games/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bet }),
      })

      const data = await res.json()

      if (res.ok) {
        setGrid(data.grid)
        setBalance(data.newBalance)

        setTimeout(() => {
          setSpinning(false)
          setResult({
            win: data.win,
            payout: data.payout,
            winLines: data.winLines,
          })

          const now = new Date()
          setHistory(prev => [{
            win: data.win,
            payout: data.payout,
            time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
          }, ...prev.slice(0, 9)])
          setLoading(false)
        }, 6000)
      } else {
        setSpinning(false)
        setLoading(false)
      }
    } catch (error) {
      console.error("Game error:", error)
      setSpinning(false)
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="text-2xl">🎰</span>
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center"
            >
              <Sparkles className="w-2.5 h-2.5 text-amber-900" />
            </motion.div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Mega Slots</h1>
            <p className="text-sm text-muted-foreground">Spin to win big!</p>
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
            title="How to play Slots"
            description="3x5 video slot with multiple win lines"
          >
            <p>1. Set your bet size in the right panel.</p>
            <p>2. Press <strong>SPIN</strong> to start the round.</p>
            <p>3. The reels spin and stop on a random 3x5 grid of symbols.</p>
            <p>4. Payouts are awarded for winning combinations from left to right according to the paytable.</p>
            <p>5. Highlighted rows show which lines have won and their multiplier.</p>
            <p>6. Your balance is updated automatically after each spin.</p>
          </GameHelpModal>
        </div>
      </div>

      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/30 p-4"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        />
        <div className="relative flex items-center justify-center gap-3">
          <Trophy className="w-8 h-8 text-amber-400" />
          <div className="text-center">
            <p className="text-xs text-amber-400/80 uppercase tracking-wider font-semibold">Progressive Jackpot</p>
            <motion.p
              key={jackpot}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="text-3xl font-black text-gradient-gold tabular-nums"
            >
              {jackpot.toLocaleString()}
            </motion.p>
          </div>
          <Trophy className="w-8 h-8 text-amber-400" />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardContent className="p-6">
            <SlotMachine
              grid={grid}
              spinning={spinning}
              winLines={result?.winLines}
            />

            <AnimatePresence>
              {result && !spinning && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "mt-6 p-5 rounded-xl text-center",
                    result.win
                      ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
                      : "bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30"
                  )}
                >
                  {result.win ? (
                    <div className="space-y-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-6 h-6 text-amber-400" />
                        <span className="text-2xl font-black text-green-400">YOU WIN!</span>
                        <Sparkles className="w-6 h-6 text-amber-400" />
                      </motion.div>
                      <p className="text-3xl font-black text-gradient-gold">
                        +{formatBalance(result.payout)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xl font-bold text-red-400">
                      No win this time. Try again!
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span>Place Bet</span>
              <Zap className="h-5 w-5 text-amber-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <p className="text-xs text-muted-foreground mb-1">Your Balance</p>
              <p className="text-2xl font-bold text-gradient-gold tabular-nums">{formatBalance(balance)}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bet Amount</label>
              <Input
                type="number"
                value={bet}
                onChange={(e) => handleBetChange(e.target.value)}
                min={1}
                max={balance}
                disabled={loading}
                className="text-lg font-semibold h-12"
              />
              <div className="grid grid-cols-4 gap-2">
                {[10, 50, 100, "MAX"].map((val) => (
                  <Button
                    key={String(val)}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (val === "MAX") setBet(balance)
                      else setBet(val as number)
                    }}
                    disabled={loading}
                    className="text-xs"
                  >
                    {val === "MAX" ? "MAX" : val}
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 space-y-3">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Paytable
              </p>
              <div className="space-y-2">
                {SLOT_SYMBOLS.slice(0, 5).map((symbol) => (
                  <div key={symbol.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <SlotSymbol symbolId={symbol.id} size="sm" />
                      <span className="text-muted-foreground">×3</span>
                    </div>
                    <span className="text-amber-400 font-bold">{symbol.value}×</span>
                  </div>
                ))}
              </div>
            </div>

            <Button
              className={cn(
                "w-full h-14 text-lg font-bold",
                "bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700",
                spinning && "animate-pulse"
              )}
              onClick={spin}
              disabled={loading || bet <= 0 || bet > balance}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Spinning...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="text-2xl">🎰</span>
                  SPIN
                </span>
              )}
            </Button>

            {history.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <History className="w-4 h-4" />
                  <span>Recent Spins</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {history.slice(0, 5).map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium",
                        item.win
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      )}
                    >
                      {item.win ? `+${formatBalance(item.payout)}` : "×"}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
