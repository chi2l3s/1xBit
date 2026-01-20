"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatBalance } from "@/lib/utils"
import { getCardDisplay, isRedSuit, PAYTABLE, Card as GameCard } from "@/lib/game-logic/poker"
import { Target, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GameHelpModal } from "./GameHelpModal"

type Phase = "betting" | "draw" | "complete"

export function PokerGame() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [balance, setBalance] = useState<number>(0)
  const [bet, setBet] = useState<number>(100)
  const [loading, setLoading] = useState(false)
  const [phase, setPhase] = useState<Phase>("betting")
  const [hand, setHand] = useState<GameCard[]>([])
  const [heldCards, setHeldCards] = useState<Set<number>>(new Set())
  const [result, setResult] = useState<{
    rank: string
    multiplier: number
    payout: number
    win: boolean
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

  const deal = async () => {
    if (!session || bet <= 0 || bet > balance) return

    setLoading(true)
    setResult(null)
    setHeldCards(new Set())

    try {
      const res = await fetch("/api/games/poker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deal", bet }),
      })

      const data = await res.json()

      if (res.ok) {
        setHand(data.hand)
        setPhase("draw")
        setBalance((prev) => prev - bet)
      }
    } catch (error) {
      console.error("Game error:", error)
    } finally {
      setLoading(false)
    }
  }

  const draw = async () => {
    setLoading(true)

    try {
      const res = await fetch("/api/games/poker", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "draw",
          holdIndices: Array.from(heldCards),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setHand(data.hand)
        setPhase("complete")
        setResult({
          rank: data.rank,
          multiplier: data.multiplier,
          payout: data.payout,
          win: data.win,
        })
        setBalance(data.newBalance)
      }
    } catch (error) {
      console.error("Game error:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleHold = (index: number) => {
    if (phase !== "draw") return

    setHeldCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  const newGame = () => {
    setPhase("betting")
    setHand([])
    setHeldCards(new Set())
    setResult(null)
  }

  const renderCard = (card: GameCard, index: number) => {
    const isHeld = heldCards.has(index)

    return (
      <motion.div
        key={index}
        initial={{ scale: 0, rotateY: 180 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ delay: index * 0.1 }}
        className="relative"
      >
        <button
          onClick={() => toggleHold(index)}
          disabled={phase !== "draw"}
          className={cn(
            "w-20 h-28 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center text-2xl font-bold transition-all",
            isRedSuit(card.suit) ? "text-red-600" : "text-gray-900",
            phase === "draw" && "hover:ring-2 hover:ring-amber-400 cursor-pointer",
            isHeld && "ring-4 ring-amber-400 -translate-y-2"
          )}
        >
          {getCardDisplay(card)}
        </button>
        {isHeld && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-amber-400">
            HOLD
          </div>
        )}
      </motion.div>
    )
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
          <div className="p-3 rounded-lg bg-pink-500/20">
            <Target className="h-8 w-8 text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Video Poker</h1>
            <p className="text-muted-foreground">Jacks or Better</p>
          </div>
        </div>
        <GameHelpModal
          title="How to play Video Poker"
          description="Jacks or Better, 5-card draw"
        >
          <p>1. Choose your bet amount and press <strong>Deal</strong>.</p>
          <p>2. You receive 5 cards; click any card to mark it as HOLD.</p>
          <p>3. Press <strong>Draw</strong> to replace non-held cards with new ones.</p>
          <p>4. Final 5-card hand is evaluated according to the paytable on the right.</p>
          <p>5. Minimum paying hand is usually Jacks or Better; stronger hands pay more.</p>
          <p>6. After payout you can start a new game with <strong>New Game</strong>.</p>
        </GameHelpModal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="bg-gradient-to-b from-pink-900/50 to-pink-950/50 rounded-xl p-6 border-4 border-pink-500/30">
              <div className="flex justify-center gap-3 min-h-[140px] items-center">
                {hand.length > 0 ? (
                  <AnimatePresence>
                    {hand.map((card, i) => renderCard(card, i))}
                  </AnimatePresence>
                ) : (
                  <div className="text-muted-foreground">
                    Place your bet and deal to start
                  </div>
                )}
              </div>

              {phase === "draw" && (
                <p className="text-center mt-8 text-sm text-muted-foreground">
                  Click cards to hold, then click Draw
                </p>
              )}

              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "mt-6 p-4 rounded-lg text-center",
                      result.win
                        ? "bg-green-500/20 text-green-400"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <p className="text-xl font-bold">{result.rank}</p>
                    {result.win && (
                      <p className="text-lg">
                        {result.multiplier}x - Won {formatBalance(result.payout)} coins!
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Balance: <span className="text-amber-400 font-bold">{formatBalance(balance)}</span>
            </div>

            {phase === "betting" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm">Bet Amount</label>
                  <Input
                    type="number"
                    value={bet}
                    onChange={(e) => setBet(Math.max(1, Math.min(balance, parseInt(e.target.value) || 0)))}
                    min={1}
                    max={balance}
                    disabled={loading}
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

                <Button
                  className="w-full"
                  size="lg"
                  variant="gold"
                  onClick={deal}
                  disabled={loading || bet <= 0 || bet > balance}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deal"}
                </Button>
              </>
            )}

            {phase === "draw" && (
              <Button
                className="w-full"
                size="lg"
                variant="gold"
                onClick={draw}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Draw"}
              </Button>
            )}

            {phase === "complete" && (
              <Button
                className="w-full"
                size="lg"
                onClick={newGame}
              >
                New Game
              </Button>
            )}

            <div className="p-4 rounded-lg bg-muted space-y-1 text-xs">
              <p className="font-medium mb-2">Paytable:</p>
              {PAYTABLE.map((p) => (
                <div key={p.rank} className="flex justify-between">
                  <span>{p.rank}</span>
                  <span className="text-amber-400">{p.multiplier}x</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
