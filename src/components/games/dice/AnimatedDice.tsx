"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedDiceProps {
  value: number | null
  isRolling: boolean
  size?: number
}

// Dot positions for each face (1-6)
const DOT_POSITIONS: Record<number, Array<{ x: number; y: number }>> = {
  1: [{ x: 50, y: 50 }],
  2: [{ x: 25, y: 25 }, { x: 75, y: 75 }],
  3: [{ x: 25, y: 25 }, { x: 50, y: 50 }, { x: 75, y: 75 }],
  4: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
  5: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 50, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
  6: [{ x: 25, y: 25 }, { x: 75, y: 25 }, { x: 25, y: 50 }, { x: 75, y: 50 }, { x: 25, y: 75 }, { x: 75, y: 75 }],
}

function DiceFace({ value, className }: { value: number; className?: string }) {
  const dots = DOT_POSITIONS[value] || []

  return (
    <div className={cn(
      "absolute inset-0 rounded-xl border-2 border-white/20 flex items-center justify-center",
      "bg-gradient-to-br from-white via-gray-100 to-gray-200",
      "shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.1)]",
      className
    )}>
      <svg viewBox="0 0 100 100" className="w-full h-full p-2">
        {dots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={10}
            className="fill-gray-900"
            filter="url(#dotShadow)"
          />
        ))}
        <defs>
          <filter id="dotShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
          </filter>
        </defs>
      </svg>
    </div>
  )
}

export function AnimatedDice({ value, isRolling, size = 120 }: AnimatedDiceProps) {
  const [displayValue, setDisplayValue] = useState(value || 1)
  const [randomRotation, setRandomRotation] = useState({ x: 0, y: 0, z: 0 })

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setDisplayValue(Math.ceil(Math.random() * 6))
      }, 80)
      return () => clearInterval(interval)
    } else if (value !== null) {
      setDisplayValue(value)
      // Calculate rotation based on final value for 3D effect
      const rotations: Record<number, { x: number; y: number; z: number }> = {
        1: { x: 0, y: 0, z: 0 },
        2: { x: 0, y: 90, z: 0 },
        3: { x: -90, y: 0, z: 0 },
        4: { x: 90, y: 0, z: 0 },
        5: { x: 0, y: -90, z: 0 },
        6: { x: 180, y: 0, z: 0 },
      }
      setRandomRotation(rotations[value] || { x: 0, y: 0, z: 0 })
    }
  }, [isRolling, value])

  return (
    <div
      className="relative preserve-3d"
      style={{
        width: size,
        height: size,
        perspective: 600,
      }}
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={isRolling ? {
          rotateX: [0, 360, 720, 1080],
          rotateY: [0, 180, 360, 540],
          rotateZ: [0, 90, 180, 270],
        } : {
          rotateX: randomRotation.x,
          rotateY: randomRotation.y,
          rotateZ: randomRotation.z,
        }}
        transition={isRolling ? {
          duration: 0.8,
          repeat: Infinity,
          ease: "linear"
        } : {
          type: "spring",
          stiffness: 100,
          damping: 15,
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front face (shows displayValue) */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            transform: "translateZ(60px)",
            backfaceVisibility: "hidden"
          }}
        >
          <DiceFace value={displayValue} />
        </div>

        {/* Back face */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            transform: "rotateY(180deg) translateZ(60px)",
            backfaceVisibility: "hidden"
          }}
        >
          <DiceFace value={7 - displayValue} />
        </div>

        {/* Left face */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            transform: "rotateY(-90deg) translateZ(60px)",
            backfaceVisibility: "hidden"
          }}
        >
          <DiceFace value={Math.max(1, Math.min(6, displayValue + 1))} />
        </div>

        {/* Right face */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            transform: "rotateY(90deg) translateZ(60px)",
            backfaceVisibility: "hidden"
          }}
        >
          <DiceFace value={Math.max(1, Math.min(6, displayValue - 1))} />
        </div>

        {/* Top face */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            transform: "rotateX(90deg) translateZ(60px)",
            backfaceVisibility: "hidden"
          }}
        >
          <DiceFace value={Math.max(1, Math.min(6, (displayValue + 2) % 6 + 1))} />
        </div>

        {/* Bottom face */}
        <div
          className="absolute inset-0 rounded-xl overflow-hidden"
          style={{
            transform: "rotateX(-90deg) translateZ(60px)",
            backfaceVisibility: "hidden"
          }}
        >
          <DiceFace value={Math.max(1, Math.min(6, (displayValue + 3) % 6 + 1))} />
        </div>
      </motion.div>

      {/* Shadow */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-4 rounded-full bg-black/30 blur-md"
        animate={isRolling ? {
          scale: [1, 0.8, 1],
          opacity: [0.3, 0.15, 0.3],
        } : {
          scale: 1,
          opacity: 0.3,
        }}
        transition={isRolling ? {
          duration: 0.4,
          repeat: Infinity,
        } : {}}
        style={{ transform: "translateY(20px)" }}
      />
    </div>
  )
}

// Large display showing the rolled number with percentage context
interface DiceResultDisplayProps {
  value: number | null
  target: number
  isOver: boolean
  win: boolean | null
}

export function DiceResultDisplay({ value, target, isOver, win }: DiceResultDisplayProps) {
  return (
    <div className="relative">
      <motion.div
        key={value}
        initial={{ scale: 0.5, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className={cn(
          "w-40 h-40 rounded-3xl flex items-center justify-center text-7xl font-black",
          "shadow-2xl border-4",
          win === null && "bg-muted border-border text-foreground",
          win === true && "bg-gradient-to-br from-green-500 to-emerald-600 border-green-400 text-white glow-green",
          win === false && "bg-gradient-to-br from-red-500 to-rose-600 border-red-400 text-white glow-red"
        )}
      >
        {value ?? "?"}
      </motion.div>

      {win !== null && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "absolute -top-2 -right-2 px-3 py-1 rounded-full text-xs font-bold",
            win ? "bg-green-400 text-green-900" : "bg-red-400 text-red-900"
          )}
        >
          {win ? "WIN!" : "LOSE"}
        </motion.div>
      )}
    </div>
  )
}
