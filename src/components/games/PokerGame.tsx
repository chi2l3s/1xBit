"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatBalance } from "@/lib/utils"
import { PAYTABLE, Card as GameCard } from "@/lib/game-logic/poker"
import { Loader2, Volume2, VolumeX, Trophy, Sparkles, History } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { GameHelpModal } from "./GameHelpModal"
import { PlayingCard, CardData, Suit } from "./cards/PlayingCard"
import { usePreferences } from "@/components/providers/PreferencesProvider"

type Phase = "betting" | "draw" | "complete"

interface HistoryItem {
  rank: string
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

export function PokerGame() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = usePreferences()
  const [balance, setBalance] = useState<number>(0)
  const [bet, setBet] = useState<number>(100)
  const [loading, setLoading] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [phase, setPhase] = useState<Phase>("betting")
  const [hand, setHand] = useState<GameCard[]>([])
  const [heldCards, setHeldCards] = useState<Set<number>>(new Set())
  const [result, setResult] = useState<{
    rank: string
    multiplier: number
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
        const newResult = {
          rank: data.rank,
          multiplier: data.multiplier,
          payout: data.payout,
          win: data.win,
        }
        setResult(newResult)
        setBalance(data.newBalance)
        setHistory(prev => [{
          rank: data.rank,
          win: data.win,
          payout: data.payout
        }, ...prev.slice(0, 9)])
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

  const getRankLabel = (rank: string) => {
    switch (rank) {
      case "Royal Flush":
        return t("games.poker.rank.royalFlush")
      case "Straight Flush":
        return t("games.poker.rank.straightFlush")
      case "Four of a Kind":
        return t("games.poker.rank.fourKind")
      case "Full House":
        return t("games.poker.rank.fullHouse")
      case "Flush":
        return t("games.poker.rank.flush")
      case "Straight":
        return t("games.poker.rank.straight")
      case "Three of a Kind":
        return t("games.poker.rank.threeKind")
      case "Two Pair":
        return t("games.poker.rank.twoPair")
      case "Jacks or Better":
        return t("games.poker.rank.jacksBetter")
      case "High Card":
        return t("games.poker.rank.highCard")
      case "Low Pair":
        return t("games.poker.rank.lowPair")
      default:
        return rank
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
            <div className="w-14 h-14 rounded-2xl bg-pink-500/20 flex items-center justify-center shadow-lg shadow-black/20">
              <span className="text-2xl">🎴</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("games.poker.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("games.poker.subtitle")}</p>
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
            title={t("games.poker.helpTitle")}
            description={t("games.poker.helpDesc")}
          >
            <p>1. {t("games.poker.helpStep1")}</p>
            <p>2. {t("games.poker.helpStep2")}</p>
            <p>3. {t("games.poker.helpStep3")}</p>
            <p>4. {t("games.poker.helpStep4")}</p>
          </GameHelpModal>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Game Area */}
        <Card className="lg:col-span-2 overflow-hidden">
          <CardContent className="p-0">
            {/* Game Table */}
            <div className="relative bg-pink-900/30 p-8 min-h-[350px]">
              {/* Decorative elements */}
              <div className="absolute inset-0 bg-pink-500/10" />

              {/* Cards */}
              <div className="relative flex justify-center gap-3 min-h-[160px] items-center">
                {hand.length > 0 ? (
                  <AnimatePresence>
                    {hand.map((card, i) => (
                      <PlayingCard
                        key={i}
                        card={toCardData(card)}
                        index={i}
                        isHeld={heldCards.has(i)}
                        onClick={() => toggleHold(i)}
                        disabled={phase !== "draw"}
                        size="lg"
                      />
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="flex gap-3">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-[100px] h-[140px] rounded-xl border-2 border-dashed border-pink-500/30 bg-pink-500/5 flex items-center justify-center"
                      >
                        <span className="text-4xl text-pink-500/20">?</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Instructions */}
              {phase === "draw" && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mt-6 text-sm text-muted-foreground"
                >
                  {t("games.poker.instruction")}
                </motion.p>
              )}

              {/* Result Display */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "mt-6 p-5 rounded-xl text-center",
                      result.win
                        ? "bg-emerald-500/20 border border-emerald-500/30"
                        : "bg-muted/50 border border-border"
                    )}
                  >
                    <p className={cn(
                      "text-2xl font-black",
                      result.win ? "text-green-400" : "text-muted-foreground"
                    )}>
                      {getRankLabel(result.rank)}
                    </p>
                    {result.win && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mt-2 flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <span className="text-xl font-bold text-amber-300">
                          {result.multiplier}× - {t("games.poker.payout")} {formatBalance(result.payout)}
                        </span>
                        <Sparkles className="w-5 h-5 text-amber-400" />
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="p-4 bg-muted/20 border-t border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{t("games.poker.recentHands")}</span>
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
                          : "bg-muted text-muted-foreground border border-border"
                      )}
                    >
                      {item.win ? getRankLabel(item.rank) : t("games.poker.lose")}
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
            <CardTitle>{t("games.poker.controls")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Balance */}
            <div className="p-4 rounded-xl surface-soft border border-border/50">
              <p className="text-xs text-muted-foreground mb-1">{t("common.balance")}</p>
              <p className="text-2xl font-bold text-foreground tabular-nums">{formatBalance(balance)}</p>
            </div>

            {phase === "betting" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("games.bonus.bet")}</label>
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
                  className="w-full h-14 text-lg font-bold bg-pink-500 text-white hover:bg-pink-600"
                  onClick={deal}
                  disabled={loading || bet <= 0 || bet > balance}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span className="mr-2">🎴</span>
                      {t("games.poker.deal")}
                    </>
                  )}
                </Button>
              </>
            )}

            {phase === "draw" && (
              <Button
                className="w-full h-14 text-lg font-bold bg-pink-500 text-white hover:bg-pink-600"
                onClick={draw}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  t("games.poker.draw")
                )}
              </Button>
            )}

            {phase === "complete" && (
              <Button
                className="w-full h-14 text-lg font-bold"
                onClick={newGame}
              >
                {t("games.poker.newGame")}
              </Button>
            )}

            {/* Paytable */}
            <div className="p-4 rounded-xl bg-muted/30 space-y-2">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                {t("games.poker.paytable")}
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {PAYTABLE.map((p) => (
                  <div
                    key={p.rank}
                    className={cn(
                      "flex justify-between text-sm py-1 px-2 rounded",
                      result?.rank === p.rank && result?.win && "bg-green-500/20"
                    )}
                  >
                    <span className={cn(
                      "text-muted-foreground",
                      result?.rank === p.rank && result?.win && "text-green-400 font-medium"
                    )}>
                      {getRankLabel(p.rank)}
                    </span>
                    <span className="text-amber-400 font-bold">{p.multiplier}×</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
