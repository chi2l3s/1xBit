"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatBalance } from "@/lib/utils"
import { BetType, ROULETTE_NUMBERS, getBetMultiplier } from "@/lib/game-logic/roulette"
import { CircleDot, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GameHelpModal } from "./GameHelpModal"

interface PlacedBet {
  type: BetType
  numbers?: number[]
  amount: number
  label: string
}

export function RouletteGame() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [balance, setBalance] = useState<number>(0)
  const [chipValue, setChipValue] = useState<number>(10)
  const [bets, setBets] = useState<PlacedBet[]>([])
  const [loading, setLoading] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{
    number: number
    color: string
    totalPayout: number
    win: boolean
  } | null>(null)

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

  const spin = async () => {
    if (!session || bets.length === 0) return

    setLoading(true)
    setSpinning(true)
    setResult(null)

    try {
      const res = await fetch("/api/games/roulette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bets }),
      })

      const data = await res.json()

      setTimeout(() => {
        setSpinning(false)
        if (res.ok) {
          setResult({
            number: data.number,
            color: data.color,
            totalPayout: data.totalPayout,
            win: data.win,
          })
          setBalance(data.newBalance)
          setBets([])
        }
        setLoading(false)
      }, 3000)
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
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-red-500/20">
            <CircleDot className="h-8 w-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Roulette</h1>
            <p className="text-muted-foreground">Classic European roulette</p>
          </div>
        </div>
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

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <Card className="xl:col-span-3">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <motion.div
                  animate={spinning ? { rotate: 360 * 5 } : {}}
                  transition={{ duration: 3, ease: "easeOut" }}
                  className="w-48 h-48 rounded-full border-8 border-amber-500 bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center"
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={result?.number ?? "waiting"}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold",
                        result?.color === "red" && "bg-red-600",
                        result?.color === "black" && "bg-gray-800",
                        result?.color === "green" && "bg-green-600",
                        !result && "bg-muted"
                      )}
                    >
                      {result ? result.number : "?"}
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </div>

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "text-xl font-bold p-4 rounded-lg",
                    result.win
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  )}
                >
                  {result.win
                    ? `You won ${formatBalance(result.totalPayout)} coins!`
                    : "No win. Try again!"}
                </motion.div>
              )}

              <div className="w-full overflow-x-auto">
                <div className="min-w-[600px] p-4 bg-green-800 rounded-lg">
                  <div className="grid grid-cols-13 gap-1">
                    <button
                      onClick={() => placeBet("number", "0", [0])}
                      className="col-span-1 row-span-3 bg-green-600 hover:bg-green-500 text-white font-bold py-8 rounded transition-colors"
                      disabled={loading}
                    >
                      0
                    </button>

                    {[...Array(12)].map((_, col) => (
                      [3, 2, 1].map((row) => {
                        const num = col * 3 + row
                        const numData = ROULETTE_NUMBERS.find((n) => n.number === num)
                        return (
                          <button
                            key={num}
                            onClick={() => placeBet("number", String(num), [num])}
                            className={cn(
                              "p-2 font-bold rounded transition-colors text-sm",
                              numData?.color === "red"
                                ? "bg-red-600 hover:bg-red-500"
                                : "bg-gray-800 hover:bg-gray-700",
                              "text-white"
                            )}
                            disabled={loading}
                          >
                            {num}
                          </button>
                        )
                      })
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <button
                      onClick={() => placeBet("1st12", "1st 12")}
                      className="bg-muted hover:bg-muted/80 p-2 rounded font-bold transition-colors"
                      disabled={loading}
                    >
                      1st 12 (3x)
                    </button>
                    <button
                      onClick={() => placeBet("2nd12", "2nd 12")}
                      className="bg-muted hover:bg-muted/80 p-2 rounded font-bold transition-colors"
                      disabled={loading}
                    >
                      2nd 12 (3x)
                    </button>
                    <button
                      onClick={() => placeBet("3rd12", "3rd 12")}
                      className="bg-muted hover:bg-muted/80 p-2 rounded font-bold transition-colors"
                      disabled={loading}
                    >
                      3rd 12 (3x)
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-2 mt-2">
                    <button
                      onClick={() => placeBet("1-18", "1-18")}
                      className="bg-muted hover:bg-muted/80 p-2 rounded font-bold transition-colors"
                      disabled={loading}
                    >
                      1-18
                    </button>
                    <button
                      onClick={() => placeBet("even", "Even")}
                      className="bg-muted hover:bg-muted/80 p-2 rounded font-bold transition-colors"
                      disabled={loading}
                    >
                      Even
                    </button>
                    <button
                      onClick={() => placeBet("red", "Red")}
                      className="bg-red-600 hover:bg-red-500 p-2 rounded font-bold text-white transition-colors"
                      disabled={loading}
                    >
                      Red
                    </button>
                    <button
                      onClick={() => placeBet("black", "Black")}
                      className="bg-gray-800 hover:bg-gray-700 p-2 rounded font-bold text-white transition-colors"
                      disabled={loading}
                    >
                      Black
                    </button>
                    <button
                      onClick={() => placeBet("odd", "Odd")}
                      className="bg-muted hover:bg-muted/80 p-2 rounded font-bold transition-colors"
                      disabled={loading}
                    >
                      Odd
                    </button>
                    <button
                      onClick={() => placeBet("19-36", "19-36")}
                      className="bg-muted hover:bg-muted/80 p-2 rounded font-bold transition-colors"
                      disabled={loading}
                    >
                      19-36
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Place Bets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Balance: <span className="text-amber-400 font-bold">{formatBalance(balance)}</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm">Chip Value</label>
              <Input
                type="number"
                value={chipValue}
                onChange={(e) => setChipValue(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                disabled={loading}
              />
              <div className="flex gap-2 flex-wrap">
                {[1, 5, 10, 25, 100].map((val) => (
                  <Button
                    key={val}
                    variant={chipValue === val ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChipValue(val)}
                    disabled={loading}
                  >
                    {val}
                  </Button>
                ))}
              </div>
            </div>

            {bets.length > 0 && (
              <div className="p-3 rounded-lg bg-muted space-y-2">
                <p className="text-sm font-medium">Current Bets:</p>
                {bets.map((bet, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{bet.label}</span>
                    <span>{formatBalance(bet.amount)} ({getBetMultiplier(bet.type)}x)</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-amber-400">{formatBalance(totalBet)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearBets}
                disabled={loading || bets.length === 0}
                className="flex-1"
              >
                Clear
              </Button>
              <Button
                variant="gold"
                onClick={spin}
                disabled={loading || bets.length === 0}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "SPIN"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
