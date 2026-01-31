"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimation } from "framer-motion"
import { cn } from "@/lib/utils"
import Image from "next/image"

export const SLOT_SYMBOLS = [
  { id: "seven", image: "/slots/seven.png", value: 100 },
  { id: "diamond", image: "/slots/diamond.png", value: 50 },
  { id: "bell", image: "/slots/bell.png", value: 25 },
  { id: "cherry", image: "/slots/cherry.png", value: 15 },
  { id: "lemon", image: "/slots/lemon.png", value: 10 },
  { id: "orange", image: "/slots/orange.png", value: 10 },
  { id: "grape", image: "/slots/grape.png", value: 5 },
]

interface SlotSymbolProps {
  symbolId: string
  isWinning?: boolean
  size?: "sm" | "md" | "lg"
}

export function SlotSymbol({ symbolId, isWinning = false, size = "md" }: SlotSymbolProps) {
  const symbol = SLOT_SYMBOLS.find(s => s.id === symbolId) || SLOT_SYMBOLS[0]

  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20"
  }

  const imgSizes = {
    sm: 40,
    md: 56,
    lg: 72
  }

  return (
    <div
      className={cn(
        sizeClasses[size],
        "rounded-xl flex items-center justify-center shrink-0",
        "bg-gradient-to-br from-white via-slate-100 to-slate-200",
        "border border-amber-500/40 shadow-[inset_0_1px_4px_rgba(255,255,255,0.7),inset_0_-8px_10px_rgba(15,23,42,0.25)]",
        isWinning && "ring-2 ring-amber-400 animate-pulse"
      )}
    >
      <Image
        src={symbol.image}
        alt={symbol.id}
        width={imgSizes[size]}
        height={imgSizes[size]}
        className="object-contain drop-shadow-md"
        priority
      />
    </div>
  )
}

const SYMBOL_SIZE = 96
const VISIBLE = 3
const REEL_SPINS = 5
const STOP_OVERSHOOT = 0.2

interface SlotReelProps {
  finalSymbols: string[]
  spinning: boolean
  reelIndex: number
  onStop?: () => void
}

export function SlotReel({ finalSymbols, spinning, reelIndex, onStop }: SlotReelProps) {
  const controls = useAnimation()
  const [symbols, setSymbols] = useState<string[]>(finalSymbols)
  const prevSpinning = useRef(false)

  useEffect(() => {
    if (spinning && !prevSpinning.current) {
      prevSpinning.current = true

      const baseStrip = SLOT_SYMBOLS.map(symbol => symbol.id)
      const spinStrip = Array.from({ length: REEL_SPINS + reelIndex }, () => baseStrip).flat()
      const allSymbols = [...spinStrip, ...finalSymbols]
      setSymbols(allSymbols)

      const totalScroll = (allSymbols.length - VISIBLE) * SYMBOL_SIZE
      const delay = reelIndex * 0.25
      const duration = 2.4 + reelIndex * 0.35
      const overshoot = SYMBOL_SIZE * STOP_OVERSHOOT

      controls.set({ y: 0 })
      controls
        .start({
          y: [0, -totalScroll - overshoot, -totalScroll],
          transition: {
            duration,
            delay,
            ease: [0.16, 0.84, 0.2, 1],
            times: [0, 0.86, 1],
          }
        })
        .then(() => {
          setSymbols(finalSymbols)
          controls.set({ y: 0 })
          onStop?.()
        })
    }

    if (!spinning && prevSpinning.current) {
      prevSpinning.current = false
      setSymbols(finalSymbols)
      controls.set({ y: 0 })
    }
  }, [spinning, finalSymbols, controls, reelIndex, onStop])

  return (
    <div className="relative">
      <div className="bg-gradient-to-b from-amber-300/20 via-amber-200/10 to-amber-500/20 rounded-2xl p-1 border border-amber-400/40 shadow-[0_8px_20px_rgba(15,23,42,0.35)]">
        <div
          className="relative overflow-hidden rounded-xl bg-slate-900/80"
          style={{ height: SYMBOL_SIZE * VISIBLE }}
        >
          <motion.div
            animate={controls}
            className="flex flex-col"
          >
            {symbols.map((id, i) => (
              <div key={i} className="p-1.5" style={{ height: SYMBOL_SIZE }}>
                <SlotSymbol symbolId={id} size="lg" />
              </div>
            ))}
          </motion.div>

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-slate-900 via-slate-900/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-900 via-slate-900/70 to-transparent" />
          </div>

          <div
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ height: SYMBOL_SIZE }}
          >
            <div className="absolute inset-x-4 top-0 h-0.5 bg-amber-300/70 shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
            <div className="absolute inset-x-4 bottom-0 h-0.5 bg-amber-300/70 shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface SlotMachineProps {
  grid: string[][]
  spinning: boolean
  winLines?: { line: number; symbols: string; multiplier: number }[]
  onAllStopped?: () => void
  title?: string
  lineLabel?: string
}

export function SlotMachine({
  grid,
  spinning,
  winLines = [],
  onAllStopped,
  title = "MEGA SLOTS",
  lineLabel = "Line"
}: SlotMachineProps) {
  const [allStopped, setAllStopped] = useState(true)
  const stoppedCount = useRef(0)

  useEffect(() => {
    if (spinning) {
      stoppedCount.current = 0
      setAllStopped(false)
    }
  }, [spinning])

  useEffect(() => {
    if (allStopped && !spinning) {
      onAllStopped?.()
    }
  }, [allStopped, spinning, onAllStopped])

  const handleStop = () => {
    stoppedCount.current++
    if (stoppedCount.current >= 5) {
      setAllStopped(true)
    }
  }

  return (
    <div className="relative">
      <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-black rounded-[32px] p-6 border border-amber-400/30 shadow-[0_30px_60px_rgba(15,23,42,0.65)]">
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-8 py-2 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 rounded-full shadow-[0_6px_20px_rgba(251,191,36,0.6)]">
          <span className="text-sm font-black text-amber-900 tracking-[0.2em]">{title}</span>
        </div>

        <div className="absolute -left-3 top-8 bottom-8 w-4 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-200 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]" />
        <div className="absolute -right-3 top-8 bottom-8 w-4 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-200 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]" />

        <div className="flex gap-2 justify-center mt-4">
          {[0, 1, 2, 3, 4].map((col) => (
            <SlotReel
              key={col}
              finalSymbols={grid.map(row => row[col])}
              spinning={spinning}
              reelIndex={col}
              onStop={handleStop}
            />
          ))}
        </div>

        {allStopped && !spinning && winLines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-1"
          >
            {winLines.map((line, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30"
              >
                <span className="text-sm text-green-300">{lineLabel} {line.line}</span>
                <span className="text-green-400 font-bold">{line.multiplier}×</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="absolute -top-3 left-6 right-6 flex justify-between">
        {[...Array(9)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              backgroundColor: spinning ? ["#fbbf24", "#ef4444", "#22c55e", "#fbbf24"] : "#fbbf24",
            }}
            transition={{ duration: 0.3, repeat: spinning ? Infinity : 0, delay: i * 0.05 }}
            className="w-2.5 h-2.5 rounded-full shadow-lg"
          />
        ))}
      </div>

      <div className="absolute -bottom-4 left-8 right-8 h-8 rounded-full bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 shadow-[0_10px_20px_rgba(0,0,0,0.4)]" />
    </div>
  )
}
