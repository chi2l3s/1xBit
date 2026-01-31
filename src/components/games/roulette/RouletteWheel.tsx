"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { cn } from "@/lib/utils"
import { usePreferences } from "@/components/providers/PreferencesProvider"

const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

function getNumberColor(num: number): "red" | "black" | "green" {
  if (num === 0) return "green"
  return RED_NUMBERS.includes(num) ? "red" : "black"
}

interface RouletteWheelProps {
  spinning: boolean
  result: number | null
  onSpinComplete?: () => void
}

export function RouletteWheel({ spinning, result, onSpinComplete }: RouletteWheelProps) {
  const [wheelRotation, setWheelRotation] = useState(0)
  const [ballAngle, setBallAngle] = useState(0)
  const [ballRadius, setBallRadius] = useState(115)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const animationRef = useRef<number | null>(null)

  const segmentAngle = 360 / WHEEL_NUMBERS.length

  useEffect(() => {
    if (spinning && result !== null) {
      setIsAnimating(true)
      setShowResult(false)

      const resultIndex = WHEEL_NUMBERS.indexOf(result)
      const targetSegmentAngle = resultIndex * segmentAngle

      const wheelSpins = 3
      const ballSpins = 5
      const totalDuration = 5000

      const startTime = Date.now()
      const startWheelRotation = wheelRotation
      const startBallAngle = ballAngle

      const finalWheelRotation = startWheelRotation + wheelSpins * 360
      const finalBallAngle = startBallAngle - ballSpins * 360 - targetSegmentAngle - segmentAngle / 2

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / totalDuration, 1)

        const easeOut = 1 - Math.pow(1 - progress, 3)

        const currentWheelRotation = startWheelRotation + (finalWheelRotation - startWheelRotation) * easeOut
        setWheelRotation(currentWheelRotation)

        const currentBallAngle = startBallAngle + (finalBallAngle - startBallAngle) * easeOut
        setBallAngle(currentBallAngle)

        if (progress > 0.6) {
          const fallProgress = (progress - 0.6) / 0.4
          const fallEase = fallProgress * fallProgress
          const newRadius = 115 - fallEase * 45
          setBallRadius(newRadius)
        } else {
          setBallRadius(115)
        }

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          setIsAnimating(false)
          setShowResult(true)
          onSpinComplete?.()
        }
      }

      animationRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [spinning, result])

  const ballX = Math.cos((ballAngle - 90) * Math.PI / 180) * ballRadius
  const ballY = Math.sin((ballAngle - 90) * Math.PI / 180) * ballRadius

  return (
    <div className="relative w-72 h-72 md:w-80 md:h-80">
      <div className="absolute inset-0 rounded-full bg-amber-800/40 shadow-2xl shadow-black/50" />

      <div className="absolute inset-2 rounded-full bg-amber-700/50 shadow-inner" />

      <div
        className="absolute inset-4 rounded-full overflow-hidden"
        style={{ transform: `rotate(${wheelRotation}deg)` }}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <filter id="innerShadow">
              <feOffset dx="0" dy="2" />
              <feGaussianBlur stdDeviation="2" result="offset-blur" />
              <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
              <feFlood floodColor="black" floodOpacity="0.5" result="color" />
              <feComposite operator="in" in="color" in2="inverse" result="shadow" />
              <feComposite operator="over" in="shadow" in2="SourceGraphic" />
            </filter>
          </defs>

          {WHEEL_NUMBERS.map((num, i) => {
            const startAngle = (i * segmentAngle - 90) * (Math.PI / 180)
            const endAngle = ((i + 1) * segmentAngle - 90) * (Math.PI / 180)
            const midAngle = ((i + 0.5) * segmentAngle - 90) * (Math.PI / 180)

            const x1 = 100 + 85 * Math.cos(startAngle)
            const y1 = 100 + 85 * Math.sin(startAngle)
            const x2 = 100 + 85 * Math.cos(endAngle)
            const y2 = 100 + 85 * Math.sin(endAngle)

            const textX = 100 + 70 * Math.cos(midAngle)
            const textY = 100 + 70 * Math.sin(midAngle)

            const color = getNumberColor(num)
            const fillColor = color === "red" ? "#dc2626" : color === "black" ? "#1f2937" : "#16a34a"

            return (
              <g key={num}>
                <path
                  d={`M 100 100 L ${x1} ${y1} A 85 85 0 0 1 ${x2} ${y2} Z`}
                  fill={fillColor}
                  stroke="#d4af37"
                  strokeWidth="0.5"
                />
                <text
                  x={textX}
                  y={textY}
                  fill="white"
                  fontSize="8"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${i * segmentAngle + segmentAngle / 2}, ${textX}, ${textY})`}
                >
                  {num}
                </text>
              </g>
            )
          })}

          <circle cx="100" cy="100" r="35" fill="#d4af37" />
          <circle cx="100" cy="100" r="30" fill="#1a1a2e" />
          <circle cx="100" cy="100" r="25" fill="#101827" />
        </svg>
      </div>

      <div className="absolute inset-4 rounded-full pointer-events-none">
          <div
            className="absolute w-4 h-4 rounded-full shadow-lg"
            style={{
            background: "#f8fafc",
            boxShadow: "0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.6)",
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${ballX}px), calc(-50% + ${ballY}px))`,
            }}
          />
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1">
        <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[20px] border-l-transparent border-r-transparent border-t-amber-400 drop-shadow-lg" />
      </div>

      <AnimatePresence>
        {showResult && result !== null && !spinning && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-2xl border-4 border-amber-400",
              getNumberColor(result) === "red" && "bg-red-600",
              getNumberColor(result) === "black" && "bg-gray-800",
              getNumberColor(result) === "green" && "bg-green-600"
            )}>
              {result}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl pointer-events-none"
          />
        )}
      </AnimatePresence>
    </div>
  )
}

type BetType = "number" | "red" | "black" | "odd" | "even" | "1-18" | "19-36" | "1st12" | "2nd12" | "3rd12"

interface BettingTableProps {
  onPlaceBet: (type: BetType, label: string, numbers?: number[]) => void
  disabled: boolean
  currentBets: Array<{ type: string; label: string; amount: number }>
}

export function BettingTable({ onPlaceBet, disabled, currentBets }: BettingTableProps) {
  const { t } = usePreferences()

  const getBetAmount = (label: string) => {
    const bet = currentBets.find(b => b.label === label)
    return bet?.amount || 0
  }

  const NumberButton = ({ num }: { num: number }) => {
    const color = getNumberColor(num)
    const amount = getBetAmount(String(num))

    return (
      <button
        onClick={() => onPlaceBet("number", String(num), [num])}
        disabled={disabled}
        className={cn(
          "relative p-2 font-bold rounded text-sm transition-all hover:scale-105",
          color === "red" && "bg-red-600 hover:bg-red-500",
          color === "black" && "bg-gray-800 hover:bg-gray-700",
          color === "green" && "bg-green-600 hover:bg-green-500",
          "text-white disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {num}
        {amount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full text-[10px] text-amber-900 font-bold flex items-center justify-center">
            {amount >= 1000 ? "K" : amount >= 100 ? Math.floor(amount / 100) : "•"}
          </span>
        )}
      </button>
    )
  }

  const OutsideBet = ({ type, label, className }: { type: BetType; label: string; className?: string }) => {
    const amount = getBetAmount(label)

    return (
      <button
        onClick={() => onPlaceBet(type, label)}
        disabled={disabled}
        className={cn(
          "relative p-2 rounded font-bold transition-all hover:scale-102",
          "bg-muted/50 hover:bg-muted/70 text-foreground",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        {label}
        {amount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full text-[10px] text-amber-900 font-bold flex items-center justify-center">
            •
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[500px] p-4 bg-emerald-900/40 rounded-xl border-2 border-amber-500/40">
        <div className="grid grid-cols-13 gap-1 mb-3">
          <button
            onClick={() => onPlaceBet("number", "0", [0])}
            disabled={disabled}
            className="col-span-1 row-span-3 bg-green-600 hover:bg-green-500 text-white font-bold py-8 rounded transition-all disabled:opacity-50"
          >
            0
          </button>

          {[...Array(12)].map((_, col) =>
            [3, 2, 1].map((row) => {
              const num = col * 3 + row
              return <NumberButton key={num} num={num} />
            })
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-2">
          <OutsideBet type="1st12" label={t("games.roulette.labels.first12")} className="text-sm" />
          <OutsideBet type="2nd12" label={t("games.roulette.labels.second12")} className="text-sm" />
          <OutsideBet type="3rd12" label={t("games.roulette.labels.third12")} className="text-sm" />
        </div>

        <div className="grid grid-cols-6 gap-2">
          <OutsideBet type="1-18" label={t("games.roulette.labels.low")} className="text-sm" />
          <OutsideBet type="even" label={t("games.roulette.labels.even")} className="text-sm" />
          <button
            onClick={() => onPlaceBet("red", t("games.roulette.labels.red"))}
            disabled={disabled}
            className="bg-red-600 hover:bg-red-500 text-white p-2 rounded font-bold text-sm disabled:opacity-50"
          >
            {t("games.roulette.labels.red")}
          </button>
          <button
            onClick={() => onPlaceBet("black", t("games.roulette.labels.black"))}
            disabled={disabled}
            className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded font-bold text-sm disabled:opacity-50"
          >
            {t("games.roulette.labels.black")}
          </button>
          <OutsideBet type="odd" label={t("games.roulette.labels.odd")} className="text-sm" />
          <OutsideBet type="19-36" label={t("games.roulette.labels.high")} className="text-sm" />
        </div>
      </div>
    </div>
  )
}
