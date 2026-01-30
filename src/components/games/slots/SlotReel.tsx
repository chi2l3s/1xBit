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
        "rounded-lg flex items-center justify-center shrink-0",
        "bg-muted/40",
        "border border-border/60",
        isWinning && "ring-2 ring-amber-400 animate-pulse"
      )}
    >
      <Image
        src={symbol.image}
        alt={symbol.id}
        width={imgSizes[size]}
        height={imgSizes[size]}
        className="object-contain"
        priority
      />
    </div>
  )
}

const SYMBOL_SIZE = 88
const VISIBLE = 3

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
  const hasResult = useRef(false)

  useEffect(() => {
    if (spinning && !prevSpinning.current) {
      prevSpinning.current = true
      hasResult.current = false

      const allSymbols: string[] = []
      for (let i = 0; i < 20; i++) {
        allSymbols.push(SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].id)
      }
      allSymbols.push(...finalSymbols)
      setSymbols(allSymbols)

      const totalScroll = (allSymbols.length - VISIBLE) * SYMBOL_SIZE
      const delay = reelIndex * 0.4
      const duration = 2 + reelIndex * 0.5

      controls.set({ y: 0 })
      controls.start({
        y: -totalScroll,
        transition: {
          duration,
          delay,
          ease: [0.2, 0.8, 0.3, 1],
        }
      }).then(() => {
        setSymbols(finalSymbols)
        controls.set({ y: 0 })
        onStop?.()
      })
    }

    if (!spinning && prevSpinning.current) {
      prevSpinning.current = false
      if (!hasResult.current) {
        hasResult.current = true
        setSymbols(finalSymbols)
        controls.set({ y: 0 })
      }
    }
  }, [spinning, finalSymbols, controls, reelIndex, onStop])

  useEffect(() => {
    if (spinning && prevSpinning.current) {
      hasResult.current = true
      const allSymbols: string[] = []
      for (let i = 0; i < 20; i++) {
        allSymbols.push(SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)].id)
      }
      allSymbols.push(...finalSymbols)
      setSymbols(allSymbols)

      const totalScroll = (allSymbols.length - VISIBLE) * SYMBOL_SIZE
      const delay = reelIndex * 0.4
      const duration = 2 + reelIndex * 0.5

      controls.set({ y: 0 })
      controls.start({
        y: -totalScroll,
        transition: {
          duration,
          delay,
          ease: [0.2, 0.8, 0.3, 1],
        }
      }).then(() => {
        setSymbols(finalSymbols)
        controls.set({ y: 0 })
        onStop?.()
      })
    }
  }, [finalSymbols])

  return (
    <div className="relative">
    <div className="bg-muted/40 rounded-xl p-1 border-2 border-amber-600/30">
      <div
        className="relative overflow-hidden rounded-lg bg-background/80"
        style={{ height: SYMBOL_SIZE * VISIBLE }}
      >
          <motion.div
            animate={controls}
            className="flex flex-col"
          >
            {symbols.map((id, i) => (
              <div key={i} className="p-1" style={{ height: SYMBOL_SIZE }}>
                <SlotSymbol symbolId={id} size="lg" />
              </div>
            ))}
          </motion.div>

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-8 bg-background/60" />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-background/60" />
          </div>

          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none" style={{ height: SYMBOL_SIZE }}>
            <div className="absolute inset-x-0 top-0 h-0.5 bg-amber-400/50" />
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-400/50" />
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
      <div className="bg-background/70 rounded-2xl p-4 border-2 border-amber-500/40 shadow-2xl">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-amber-300/90 rounded-full shadow-lg">
          <span className="text-sm font-black text-amber-900 tracking-wider">{title}</span>
        </div>

        <div className="flex gap-1.5 justify-center mt-2">
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

      <div className="absolute -top-2 left-4 right-4 flex justify-between">
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
    </div>
  )
}
