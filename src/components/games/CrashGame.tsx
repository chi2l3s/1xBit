"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn, formatBalance } from "@/lib/utils"
import { Loader2, Users, History } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Rocket } from "./crash/Rocket"
import { Explosion } from "./crash/Explosion"

type GameState = "waiting" | "playing" | "crashed" | "cashed_out"

interface HistoryItem {
  multiplier: number
  time: string
}

export function CrashGame() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [balance, setBalance] = useState<number>(0)
  const [bet, setBet] = useState<number>(100)
  const [autoCashOut, setAutoCashOut] = useState<number>(2.0)
  const [gameState, setGameState] = useState<GameState>("waiting")
  const [currentMultiplier, setCurrentMultiplier] = useState<number>(1.0)
  const [crashPoint, setCrashPoint] = useState<number | null>(null)
  const [planePosition, setPlanePosition] = useState({ x: 0, y: 0 })
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([])
  const [result, setResult] = useState<{
    win: boolean
    payout: number
    multiplier: number
  } | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([
    { multiplier: 2.34, time: "12:45" },
    { multiplier: 1.12, time: "12:44" },
    { multiplier: 5.67, time: "12:43" },
    { multiplier: 1.89, time: "12:42" },
    { multiplier: 3.21, time: "12:41" },
  ])
  const animationRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchBalance()
  }, [])

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
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

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    ctx.clearRect(0, 0, rect.width, rect.height)

    // Draw grid
    ctx.strokeStyle = "rgba(55, 65, 81, 0.3)"
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
      const y = (rect.height / 5) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }

    // Draw trail/path
    if (trail.length > 1) {
      ctx.beginPath()
      ctx.strokeStyle = gameState === "crashed" ? "#ef4444" : "#10b981"
      ctx.lineWidth = 3
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      // Create gradient
      const gradient = ctx.createLinearGradient(0, rect.height, rect.width, 0)
      gradient.addColorStop(0, gameState === "crashed" ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)")
      gradient.addColorStop(1, gameState === "crashed" ? "#ef4444" : "#10b981")
      ctx.strokeStyle = gradient

      ctx.moveTo(trail[0].x * rect.width, rect.height - trail[0].y * rect.height)
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x * rect.width, rect.height - trail[i].y * rect.height)
      }
      ctx.stroke()

      // Fill area under curve
      ctx.lineTo(trail[trail.length - 1].x * rect.width, rect.height)
      ctx.lineTo(0, rect.height)
      ctx.closePath()
      const fillGradient = ctx.createLinearGradient(0, 0, 0, rect.height)
      fillGradient.addColorStop(0, gameState === "crashed" ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)")
      fillGradient.addColorStop(1, "rgba(0, 0, 0, 0)")
      ctx.fillStyle = fillGradient
      ctx.fill()
    }
  }, [trail, gameState])

  useEffect(() => {
    drawGraph()
  }, [drawGraph])

  const startGame = async () => {
    if (!session || bet <= 0 || bet > balance) return

    setGameState("playing")
    setResult(null)
    setCurrentMultiplier(1.0)
    setPlanePosition({ x: 0, y: 0 })
    setTrail([])

    try {
      const res = await fetch("/api/games/crash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bet, cashOutAt: autoCashOut }),
      })

      const data = await res.json()

      if (res.ok) {
        setCrashPoint(data.crashPoint)
        animateMultiplier(data.crashPoint, data)
      } else {
        setGameState("waiting")
      }
    } catch (error) {
      console.error("Game error:", error)
      setGameState("waiting")
    }
  }

  const animateMultiplier = (
    finalCrashPoint: number,
    serverResult: { win: boolean; payout: number; cashOutMultiplier: number; newBalance: number }
  ) => {
    const duration = Math.min((finalCrashPoint - 1) * 1500, 15000)
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const currentMult = 1 + (finalCrashPoint - 1) * Math.pow(progress, 0.6)

      // Vertical rocket path: keep in card bounds
      const x = 0.5
      const y = Math.min((currentMult - 1) / (finalCrashPoint + 1), 0.9)
      setPlanePosition({ x, y })
      setTrail(prev => [...prev, { x, y }])

      if (serverResult.win && currentMult >= autoCashOut) {
        setCurrentMultiplier(autoCashOut)
        setGameState("cashed_out")
        setResult({
          win: true,
          payout: serverResult.payout,
          multiplier: serverResult.cashOutMultiplier,
        })
        setBalance(serverResult.newBalance)
        addToHistory(serverResult.cashOutMultiplier)
        return
      }

      setCurrentMultiplier(Math.floor(currentMult * 100) / 100)

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setCurrentMultiplier(finalCrashPoint)
        if (!serverResult.win) {
          setGameState("crashed")
          setResult({
            win: false,
            payout: 0,
            multiplier: finalCrashPoint,
          })
          setBalance(serverResult.newBalance)
          addToHistory(finalCrashPoint)
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }

  const addToHistory = (multiplier: number) => {
    const now = new Date()
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    setHistory(prev => [{ multiplier, time }, ...prev.slice(0, 9)])
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
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
            <div className="scale-[0.6] -m-2">
              <Rocket flame={false} glowClassName="bg-emerald-500/45" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Crash</h1>
            <p className="text-muted-foreground text-sm">Cash out before the rocket explodes!</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>2,847 playing</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Game Area */}
        <Card className="lg:col-span-3 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative h-80 md:h-96 bg-gradient-to-b from-muted/50 to-background overflow-hidden">
              {/* Canvas for graph */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
              />

              {/* Multiplier Display */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                  key={`mult-${gameState}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center"
                >
                  <div className={cn(
                    "text-6xl md:text-8xl font-black tabular-nums",
                    gameState === "crashed" ? "text-red-500" :
                    gameState === "cashed_out" ? "text-green-500" :
                    gameState === "playing" ? "text-green-400" : "text-foreground"
                  )}>
                    {currentMultiplier.toFixed(2)}x
                  </div>
                  {gameState === "waiting" && (
                    <p className="text-muted-foreground mt-2">Place your bet to start</p>
                  )}
                </motion.div>
              </div>

              {/* Rocket */}
              <AnimatePresence>
              {gameState === "waiting" && (
                <motion.div
                  className="absolute left-1/2 bottom-[8%] -translate-x-1/2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Rocket className="scale-[0.9]" glowClassName="bg-emerald-500/30" flame={false} />
                </motion.div>
              )}

                {gameState === "playing" && (
                  <motion.div
                    className="absolute"
                    style={{
                      left: `${planePosition.x * 100}%`,
                      bottom: `${planePosition.y * 100}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: [0, -4, 0],
                    rotate: [0, -2, 2, 0],
                  }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Rocket className="scale-[0.9]" glowClassName="bg-emerald-500/45" />
                  </motion.div>
                )}

                {gameState === "crashed" && (
                  <motion.div
                    className="absolute"
                    style={{
                      left: `${planePosition.x * 100}%`,
                      bottom: `${planePosition.y * 100}%`,
                    }}
                    initial={{ opacity: 1, rotate: -30 }}
                    animate={{ opacity: 0, rotate: 90, y: 100 }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="relative">
                      <Rocket className="scale-[0.9] opacity-90" glowClassName="bg-red-500/40" />
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Explosion />
                      </div>
                    </div>
                  </motion.div>
                )}

                {gameState === "cashed_out" && (
                  <motion.div
                    className="absolute"
                    style={{
                      left: `${planePosition.x * 100}%`,
                      bottom: `${planePosition.y * 100}%`,
                    }}
                    animate={{
                      x: [0, 200],
                      y: [0, -100],
                      opacity: [1, 0],
                    }}
                    transition={{ duration: 1 }}
                  >
                    <div style={{ transform: "rotate(-28deg)" }}>
                      <Rocket className="scale-[0.9]" glowClassName="bg-emerald-500/45" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Crashed overlay */}
              <AnimatePresence>
                {gameState === "crashed" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-red-500/10 flex items-end justify-center pb-8"
                  >
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-red-500 font-bold text-2xl flex items-center gap-2"
                    >
                      <span>CRASHED @ {crashPoint?.toFixed(2)}x</span>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Cashed out overlay */}
              <AnimatePresence>
                {gameState === "cashed_out" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-green-500/10 flex items-end justify-center pb-8"
                  >
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-center"
                    >
                      <div className="text-green-500 font-bold text-2xl">
                        CASHED OUT @ {result?.multiplier}x
                      </div>
                      <div className="text-green-400 text-lg">
                        +{formatBalance(result?.payout || 0)}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* History bar */}
            <div className="p-3 bg-muted/30 border-t border-border/50">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <History className="h-4 w-4 text-muted-foreground shrink-0" />
                {history.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm font-medium shrink-0",
                      item.multiplier >= 2
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    )}
                  >
                    {item.multiplier.toFixed(2)}x
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Betting Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Place Bet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-xl bg-muted/50 text-center">
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="text-xl font-bold text-gradient-gold">{formatBalance(balance)}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Bet Amount</label>
              <Input
                type="number"
                value={bet}
                onChange={(e) => handleBetChange(e.target.value)}
                min={1}
                max={balance}
                disabled={gameState === "playing"}
                className="text-lg font-semibold"
              />
              <div className="grid grid-cols-4 gap-1">
                {[0.5, 2, 5, "MAX"].map((mult) => (
                  <Button
                    key={mult}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (mult === "MAX") setBet(balance)
                      else setBet(prev => Math.min(prev * (mult as number), balance))
                    }}
                    disabled={gameState === "playing"}
                    className="text-xs"
                  >
                    {mult === "MAX" ? mult : `${mult}x`}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Auto Cash Out</label>
              <Input
                type="number"
                value={autoCashOut}
                onChange={(e) => setAutoCashOut(Math.max(1.01, parseFloat(e.target.value) || 1.01))}
                min={1.01}
                step={0.1}
                disabled={gameState === "playing"}
                className="text-lg font-semibold"
              />
              <div className="grid grid-cols-4 gap-1">
                {[1.5, 2.0, 3.0, 5.0].map((mult) => (
                  <Button
                    key={mult}
                    variant="outline"
                    size="sm"
                    onClick={() => setAutoCashOut(mult)}
                    disabled={gameState === "playing"}
                    className="text-xs"
                  >
                    {mult}x
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target</span>
                <span className="font-bold text-green-400">{autoCashOut.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Potential Win</span>
                <span className="font-bold text-green-400">
                  {formatBalance(bet * autoCashOut)}
                </span>
              </div>
            </div>

            <Button
              className={cn(
                "w-full h-12 text-lg font-bold",
                gameState === "playing"
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
                  : "bg-gradient-to-r from-green-500 to-emerald-600"
              )}
              onClick={startGame}
              disabled={gameState === "playing" || bet <= 0 || bet > balance}
            >
              {gameState === "playing" ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Flying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span className="inline-flex scale-[0.6] -m-2">
                    <Rocket flame={false} />
                  </span>
                  Start Launch
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
