"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatBalance } from "@/lib/utils"
import { getCardDisplay, isRedSuit, Hand, Card as GameCard } from "@/lib/game-logic/blackjack"
import { Spade, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GameHelpModal } from "./GameHelpModal"

interface DealerHand {
  cards: (GameCard | { hidden: true })[]
  value: number
}

export function BlackjackGame() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [balance, setBalance] = useState<number>(0)
  const [bet, setBet] = useState<number>(100)
  const [loading, setLoading] = useState(false)
  const [gameActive, setGameActive] = useState(false)
  const [playerHand, setPlayerHand] = useState<Hand | null>(null)
  const [dealerHand, setDealerHand] = useState<DealerHand | Hand | null>(null)
  const [canHit, setCanHit] = useState(false)
  const [canStand, setCanStand] = useState(false)
  const [gameStatus, setGameStatus] = useState<string | null>(null)
  const [result, setResult] = useState<{
    status: string
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

  const startGame = async () => {
    if (!session || bet <= 0 || bet > balance) return

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/games/blackjack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", bet }),
      })

      const data = await res.json()

      if (res.ok) {
        setPlayerHand(data.playerHand)
        setDealerHand(data.dealerHand)
        setCanHit(data.canHit)
        setCanStand(data.canStand)
        setGameStatus(data.status)
        setGameActive(!data.gameOver)

        if (data.gameOver) {
          handleGameOver(data)
        } else {
          setBalance((prev) => prev - bet)
        }
      }
    } catch (error) {
      console.error("Game error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: "hit" | "stand") => {
    setLoading(true)

    try {
      const res = await fetch("/api/games/blackjack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      const data = await res.json()

      if (res.ok) {
        setPlayerHand(data.playerHand)
        setDealerHand(data.dealerHand)
        setCanHit(data.canHit)
        setCanStand(data.canStand)
        setGameStatus(data.status)

        if (data.gameOver) {
          handleGameOver(data)
        }
      }
    } catch (error) {
      console.error("Game error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGameOver = (data: { status: string; payout: number; newBalance: number }) => {
    setGameActive(false)
    setBalance(data.newBalance)
    setResult({
      status: data.status,
      payout: data.payout,
      win: data.payout > 0,
    })
  }

  const getStatusMessage = (status: string): string => {
    switch (status) {
      case "blackjack":
        return "BLACKJACK! You win 2.5x!"
      case "playerWin":
        return "You win!"
      case "dealerBusted":
        return "Dealer busted! You win!"
      case "playerBusted":
        return "Busted! You lose."
      case "dealerWin":
        return "Dealer wins."
      case "push":
        return "Push! Bet returned."
      default:
        return ""
    }
  }

  const renderCard = (card: GameCard | { hidden: true }, index: number) => {
    if ("hidden" in card) {
      return (
        <motion.div
          key={index}
          initial={{ scale: 0, rotateY: 180 }}
          animate={{ scale: 1, rotateY: 0 }}
          className="w-16 h-24 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-lg flex items-center justify-center"
        >
          <span className="text-2xl">🂠</span>
        </motion.div>
      )
    }

    return (
      <motion.div
        key={index}
        initial={{ scale: 0, x: -50 }}
        animate={{ scale: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className={cn(
          "w-16 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center text-xl font-bold",
          isRedSuit(card.suit) ? "text-red-600" : "text-gray-900"
        )}
      >
        {getCardDisplay(card)}
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
          <div className="p-3 rounded-lg bg-amber-500/20">
            <Spade className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Blackjack</h1>
            <p className="text-muted-foreground">Beat the dealer to 21!</p>
          </div>
        </div>
        <GameHelpModal
          title="How to play Blackjack"
          description="Classic 21 vs dealer"
        >
          <p>1. Set your bet and press <strong>Deal</strong> to start a round.</p>
          <p>2. You and dealer each get two cards; dealer may have one hidden card.</p>
          <p>3. Your goal is to get as close to 21 as possible without going over.</p>
          <p>4. On your turn you can:</p>
          <ul className="list-disc list-inside ml-2">
            <li><strong>Hit</strong> — take another card.</li>
            <li><strong>Stand</strong> — stop and let the dealer play.</li>
          </ul>
          <p>5. Dealer draws until reaching at least 17, then stands.</p>
          <p>6. If you bust (&gt;21) you lose; if dealer busts you win automatically.</p>
          <p>7. Blackjack (A + 10-value) pays enhanced 2.5x according to the rules block.</p>
        </GameHelpModal>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="bg-gradient-to-b from-green-800 to-green-900 rounded-xl p-6 min-h-[400px]">
              <div className="space-y-8">
                <div className="text-center">
                  <p className="text-sm text-green-300 mb-2">Dealer</p>
                  <div className="flex justify-center gap-2 min-h-[96px]">
                    <AnimatePresence>
                      {dealerHand?.cards.map((card, i) => renderCard(card, i))}
                    </AnimatePresence>
                  </div>
                  {dealerHand && (
                    <p className="mt-2 text-lg font-bold">
                      {"cards" in dealerHand && !dealerHand.cards.some((c) => "hidden" in c)
                        ? dealerHand.value
                        : "?"}
                    </p>
                  )}
                </div>

                <div className="flex justify-center">
                  <AnimatePresence>
                    {result && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className={cn(
                          "px-6 py-3 rounded-lg text-lg font-bold",
                          result.win
                            ? "bg-green-500/20 text-green-400"
                            : result.payout > 0
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                        )}
                      >
                        {getStatusMessage(result.status)}
                        {result.payout > 0 && ` (+${formatBalance(result.payout)})`}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="text-center">
                  <p className="text-sm text-green-300 mb-2">Your Hand</p>
                  <div className="flex justify-center gap-2 min-h-[96px]">
                    <AnimatePresence>
                      {playerHand?.cards.map((card, i) => renderCard(card, i))}
                    </AnimatePresence>
                  </div>
                  {playerHand && (
                    <p className="mt-2 text-lg font-bold">
                      {playerHand.value}
                      {playerHand.soft && playerHand.value <= 21 && " (soft)"}
                    </p>
                  )}
                </div>
              </div>
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

            {!gameActive ? (
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
                  onClick={startGame}
                  disabled={loading || bet <= 0 || bet > balance}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Deal"
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleAction("hit")}
                  disabled={loading || !canHit}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hit"}
                </Button>
                <Button
                  className="w-full"
                  size="lg"
                  variant="secondary"
                  onClick={() => handleAction("stand")}
                  disabled={loading || !canStand}
                >
                  Stand
                </Button>
              </div>
            )}

            <div className="p-4 rounded-lg bg-muted space-y-2 text-sm">
              <p className="font-medium">Payouts:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Blackjack pays 2.5x</li>
                <li>Regular win pays 2x</li>
                <li>Dealer stands on 17</li>
                <li>Push returns your bet</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
