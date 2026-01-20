"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatBalance } from "@/lib/utils"
import { SLOT_SYMBOLS } from "@/lib/game-logic/slots"
import { SquareStack, Loader2, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GameHelpModal } from "./GameHelpModal"

export function SlotsGame() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [balance, setBalance] = useState<number>(0)
  const [bet, setBet] = useState<number>(100)
  const [loading, setLoading] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [grid, setGrid] = useState<string[][]>([
    ["🍒", "🍋", "🍊", "🍇", "🔔"],
    ["💎", "7️⃣", "🍒", "🍋", "🍊"],
    ["🔔", "🍇", "💎", "7️⃣", "🍒"],
  ])
  const [result, setResult] = useState<{
    win: boolean
    payout: number
    winLines: { line: number; symbols: string; multiplier: number }[]
  } | null>(null)

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

    const spinInterval = setInterval(() => {
      setGrid((prev) =>
        prev.map((row) =>
          row.map(() => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].emoji)
        )
      )
    }, 100)

    try {
      const res = await fetch("/api/games/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bet }),
      })

      const data = await res.json()

      setTimeout(() => {
        clearInterval(spinInterval)
        setSpinning(false)

        if (res.ok) {
          setGrid(data.grid)
          setResult({
            win: data.win,
            payout: data.payout,
            winLines: data.winLines,
          })
          setBalance(data.newBalance)
        }
        setLoading(false)
      }, 2000)
    } catch (error) {
      console.error("Game error:", error)
      clearInterval(spinInterval)
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-purple-500/20">
            <SquareStack className="h-8 w-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Slots</h1>
            <p className="text-muted-foreground">Spin the reels and hit the jackpot!</p>
          </div>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="bg-gradient-to-b from-purple-900/50 to-purple-950/50 rounded-xl p-6 border-4 border-amber-500/50 relative overflow-hidden">
              {spinning && (
                <motion.div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                />
              )}
              <div className="bg-black/50 rounded-lg p-4">
                <div className="grid grid-rows-3 gap-2">
                  {grid.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className={cn(
                        "flex justify-center gap-2 p-2 rounded-lg",
                        result?.winLines.some((w) => w.line === rowIndex + 1) &&
                          "bg-green-500/20 ring-2 ring-green-500"
                      )}
                    >
                      {row.map((symbol, colIndex) => (
                        <motion.div
                          key={`${rowIndex}-${colIndex}`}
                          animate={spinning ? { y: [0, -10, 0] } : {}}
                          transition={{
                            duration: 0.1,
                            repeat: spinning ? Infinity : 0,
                            delay: colIndex * 0.05,
                          }}
                          className="w-14 h-14 md:w-16 md:h-16 bg-white/10 rounded-lg flex items-center justify-center text-3xl md:text-4xl"
                        >
                          {symbol}
                        </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={cn(
                      "mt-4 p-4 rounded-lg text-center font-bold text-xl",
                      result.win
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    )}
                  >
                    {result.win
                      ? `You won ${formatBalance(result.payout)} coins!`
                      : "No win this time. Try again!"}
                  </motion.div>
                )}
              </AnimatePresence>

              {result?.winLines && result.winLines.length > 0 && (
                <div className="mt-4 space-y-2">
                  {result.winLines.map((line, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm bg-green-500/10 p-2 rounded"
                    >
                      <span>Line {line.line}: {line.symbols} x3+</span>
                      <span className="text-green-400">{line.multiplier}x</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Place Bet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Balance: <span className="text-amber-400 font-bold">{formatBalance(balance)}</span>
            </div>

            <div className="space-y-2">
              <label className="text-sm">Bet Amount</label>
              <Input
                type="number"
                value={bet}
                onChange={(e) => handleBetChange(e.target.value)}
                min={1}
                max={balance}
                disabled={loading}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBet(Math.floor(balance / 4))}
                  disabled={loading}
                >
                  1/4
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBet(Math.floor(balance / 2))}
                  disabled={loading}
                >
                  1/2
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBet(balance)}
                  disabled={loading}
                >
                  Max
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted space-y-2">
              <p className="text-sm font-medium mb-2">Paytable:</p>
              {SLOT_SYMBOLS.slice(0, 4).map((symbol) => (
                <div key={symbol.id} className="flex items-center justify-between text-sm">
                  <span>{symbol.emoji} x3</span>
                  <span className="text-amber-400">{symbol.multiplier}x</span>
                </div>
              ))}
            </div>

            <Button
              className="w-full"
              size="lg"
              variant="gold"
              onClick={spin}
              disabled={loading || bet <= 0 || bet > balance}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Spinning...
                </>
              ) : (
                "SPIN"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
