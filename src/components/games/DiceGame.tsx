"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { cn, formatBalance } from "@/lib/utils"
import { calculateDiceMultiplier } from "@/lib/game-logic/dice"
import { Dices, ArrowUp, ArrowDown, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function DiceGame() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [balance, setBalance] = useState<number>(0)
  const [bet, setBet] = useState<number>(100)
  const [target, setTarget] = useState<number>(50)
  const [isOver, setIsOver] = useState<boolean>(true)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    roll: number
    win: boolean
    payout: number
  } | null>(null)

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
    setResult(null)

    try {
      const res = await fetch("/api/games/dice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bet, target, isOver }),
      })

      const data = await res.json()

      if (res.ok) {
        setResult({
          roll: data.roll,
          win: data.win,
          payout: data.payout,
        })
        setBalance(data.newBalance)
      }
    } catch (error) {
      console.error("Game error:", error)
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-blue-500/20">
          <Dices className="h-8 w-8 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Dice</h1>
          <p className="text-muted-foreground">Guess if the roll will be higher or lower</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={result?.roll ?? "waiting"}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  className={cn(
                    "w-32 h-32 rounded-2xl flex items-center justify-center text-5xl font-bold",
                    result
                      ? result.win
                        ? "bg-green-500/20 text-green-400 glow-green"
                        : "bg-red-500/20 text-red-400 glow-red"
                      : "bg-muted"
                  )}
                >
                  {result ? result.roll : "?"}
                </motion.div>
              </AnimatePresence>

              {result && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={cn(
                    "text-xl font-bold",
                    result.win ? "text-green-400" : "text-red-400"
                  )}
                >
                  {result.win
                    ? `You won ${formatBalance(result.payout)} coins!`
                    : "You lost!"}
                </motion.div>
              )}

              <div className="w-full space-y-4">
                <div className="flex justify-between text-sm">
                  <span>1</span>
                  <span className="font-bold text-lg">{target}</span>
                  <span>100</span>
                </div>

                <div className="relative">
                  <div className="h-4 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        isOver ? "bg-green-500" : "bg-red-500"
                      )}
                      style={{
                        width: `${isOver ? 100 - target : target}%`,
                        marginLeft: isOver ? `${target}%` : 0,
                      }}
                    />
                  </div>
                  <Slider
                    value={[target]}
                    onValueChange={(v) => setTarget(v[0])}
                    min={1}
                    max={99}
                    step={1}
                    className="absolute inset-0"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    variant={!isOver ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setIsOver(false)}
                  >
                    <ArrowDown className="mr-2 h-4 w-4" />
                    Roll Under {target}
                  </Button>
                  <Button
                    variant={isOver ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setIsOver(true)}
                  >
                    <ArrowUp className="mr-2 h-4 w-4" />
                    Roll Over {target}
                  </Button>
                </div>
              </div>
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
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBet(Math.floor(balance / 4))}
                >
                  1/4
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBet(Math.floor(balance / 2))}
                >
                  1/2
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBet(balance)}
                >
                  Max
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Win Chance</span>
                <span className="font-bold">{winChance.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Multiplier</span>
                <span className="font-bold text-amber-400">{multiplier.toFixed(4)}x</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Profit on Win</span>
                <span className="font-bold text-green-400">
                  +{formatBalance(bet * multiplier - bet)}
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handlePlay}
              disabled={loading || bet <= 0 || bet > balance}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rolling...
                </>
              ) : (
                `Roll ${isOver ? "Over" : "Under"} ${target}`
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
