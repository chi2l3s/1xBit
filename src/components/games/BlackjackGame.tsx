"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatBalance } from "@/lib/utils"
import { Hand, Card as GameCard } from "@/lib/game-logic/blackjack"
import { Loader2, Volume2, VolumeX, Sparkles, History } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GameHelpModal } from "./GameHelpModal"
import { PlayingCard, CardData, Suit } from "./cards/PlayingCard"

interface DealerHand {
  cards: (GameCard | { hidden: true })[]
  value: number
}

interface HistoryItem {
  result: string
  win: boolean
  payout: number
}

// Convert game card to our CardData format
function toCardData(card: GameCard): CardData {
  const suitMap: Record<string, Suit> = {
    hearts: "hearts",
    diamonds: "diamonds",
    clubs: "clubs",
    spades: "spades"
  }
  return {
    suit: suitMap[card.suit] || "spades",
    rank: card.rank as CardData["rank"]
  }
}

export function BlackjackGame() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [balance, setBalance] = useState<number>(0)
  const [bet, setBet] = useState<number>(100)
  const [loading, setLoading] = useState(false)
  const [gameActive, setGameActive] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
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
  const [history, setHistory] = useState<HistoryItem[]>([])

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
    const isWin = data.payout > 0
    setResult({
      status: data.status,
      payout: data.payout,
      win: isWin,
    })
    setHistory(prev => [{
      result: data.status,
      win: isWin,
      payout: data.payout
    }, ...prev.slice(0, 9)])
  }

  const getStatusMessage = (status: string): { message: string; emoji: string } => {
    switch (status) {
      case "blackjack":
        return { message: "BLACKJACK!", emoji: "🎉" }
      case "playerWin":
        return { message: "You Win!", emoji: "🏆" }
      case "dealerBusted":
        return { message: "Dealer Busted!", emoji: "💥" }
      case "playerBusted":
        return { message: "Busted!", emoji: "💔" }
      case "dealerWin":
        return { message: "Dealer Wins", emoji: "😔" }
      case "push":
        return { message: "Push - Bet Returned", emoji: "🤝" }
      default:
        return { message: "", emoji: "" }
    }
  }

  const renderCard = (card: GameCard | { hidden: true }, index: number) => {
    if ("hidden" in card) {
      return <PlayingCard key={index} card={{ hidden: true }} index={index} size="md" />
    }
    return <PlayingCard key={index} card={toCardData(card)} index={index} size="md" />
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
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <span className="text-2xl">🃏</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Blackjack</h1>
            <p className="text-sm text-muted-foreground">Beat the dealer to 21</p>
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
            <p>7. Blackjack (A + 10-value) pays enhanced 2.5x.</p>
          </GameHelpModal>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Game Area */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardContent className="p-0">
            {/* Game Table */}
            <div className="relative bg-gradient-to-b from-green-800 via-green-900 to-green-950 min-h-[450px] p-6">
              {/* Table texture */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)]" />

              {/* Dealer area */}
              <div className="relative text-center mb-8">
                <div className="inline-block px-4 py-1 bg-black/30 rounded-full text-sm text-green-300 mb-4">
                  Dealer
                </div>
                <div className="flex justify-center -space-x-6 min-h-[120px] items-center">
                  <AnimatePresence>
                    {dealerHand?.cards.map((card, i) => renderCard(card, i))}
                  </AnimatePresence>
                </div>
                {dealerHand && (
                  <motion.p
                    key={dealerHand.value}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="mt-3 text-2xl font-bold text-white"
                  >
                    {"cards" in dealerHand && !dealerHand.cards.some((c) => "hidden" in c)
                      ? dealerHand.value
                      : "?"}
                  </motion.p>
                )}
              </div>

              {/* Result Display */}
              <div className="flex justify-center mb-8 min-h-[60px]">
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0 }}
                      className={cn(
                        "px-8 py-4 rounded-2xl text-center",
                        result.win
                          ? "bg-gradient-to-r from-green-500/30 to-emerald-500/30 border-2 border-green-400"
                          : result.payout > 0
                          ? "bg-gradient-to-r from-amber-500/30 to-orange-500/30 border-2 border-amber-400"
                          : "bg-gradient-to-r from-red-500/30 to-rose-500/30 border-2 border-red-400"
                      )}
                    >
                      <div className="flex items-center gap-2 justify-center mb-1">
                        <span className="text-2xl">{getStatusMessage(result.status).emoji}</span>
                        <span className={cn(
                          "text-xl font-black",
                          result.win ? "text-green-400" : result.payout > 0 ? "text-amber-400" : "text-red-400"
                        )}>
                          {getStatusMessage(result.status).message}
                        </span>
                      </div>
                      {result.payout > 0 && (
                        <p className="text-lg font-bold text-gradient-gold">+{formatBalance(result.payout)}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Player area */}
              <div className="relative text-center">
                <div className="flex justify-center -space-x-6 min-h-[120px] items-center">
                  <AnimatePresence>
                    {playerHand?.cards.map((card, i) => (
                      <PlayingCard key={i} card={toCardData(card)} index={i} size="md" />
                    ))}
                  </AnimatePresence>
                </div>
                {playerHand && (
                  <motion.p
                    key={playerHand.value}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    className="mt-3 text-2xl font-bold text-white"
                  >
                    {playerHand.value}
                    {playerHand.soft && playerHand.value <= 21 && (
                      <span className="text-sm text-green-300 ml-2">(soft)</span>
                    )}
                  </motion.p>
                )}
                <div className="inline-block px-4 py-1 bg-black/30 rounded-full text-sm text-green-300 mt-4">
                  Your Hand
                </div>
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="p-4 bg-muted/20 border-t border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Recent Games</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {history.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium",
                        item.win
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : item.payout > 0
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      )}
                    >
                      {item.win ? `+${formatBalance(item.payout)}` : item.payout > 0 ? "Push" : "Lost"}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Balance */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <p className="text-xs text-muted-foreground mb-1">Your Balance</p>
              <p className="text-2xl font-bold text-gradient-gold tabular-nums">{formatBalance(balance)}</p>
            </div>

            {!gameActive ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bet Amount</label>
                  <Input
                    type="number"
                    value={bet}
                    onChange={(e) => setBet(Math.max(1, Math.min(balance, parseInt(e.target.value) || 0)))}
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

                <Button
                  className="w-full h-14 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
                  onClick={startGame}
                  disabled={loading || bet <= 0 || bet > balance}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span className="mr-2">🃏</span>
                      Deal
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-3">
                <Button
                  className="w-full h-12 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  onClick={() => handleAction("hit")}
                  disabled={loading || !canHit}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Hit"}
                </Button>
                <Button
                  className="w-full h-12 text-lg font-bold"
                  variant="secondary"
                  onClick={() => handleAction("stand")}
                  disabled={loading || !canStand}
                >
                  Stand
                </Button>
              </div>
            )}

            {/* Payouts */}
            <div className="p-4 rounded-xl bg-muted/30 space-y-2 text-sm">
              <p className="font-semibold">Payouts:</p>
              <div className="space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Blackjack</span>
                  <span className="text-amber-400 font-bold">2.5×</span>
                </div>
                <div className="flex justify-between">
                  <span>Regular Win</span>
                  <span className="text-amber-400 font-bold">2×</span>
                </div>
                <div className="flex justify-between">
                  <span>Push</span>
                  <span className="text-muted-foreground">Bet returned</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
