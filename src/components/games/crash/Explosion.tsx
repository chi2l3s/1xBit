"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function Explosion({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)} aria-hidden="true">
      {/* shockwave */}
      <motion.div
        className="absolute inset-0 rounded-full border border-orange-400/60"
        initial={{ scale: 0.2, opacity: 0.9 }}
        animate={{ scale: 2.6, opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />

      {/* glow ball */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-400 blur-xl"
        initial={{ scale: 0.2, opacity: 0.95 }}
        animate={{ scale: 2.1, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* sparks */}
      <svg width="120" height="120" viewBox="0 0 120 120" className="relative">
        <defs>
          <linearGradient id="spark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fbbf24" />
            <stop offset="1" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        {Array.from({ length: 10 }).map((_, i) => {
          const angle = (i / 10) * Math.PI * 2
          const x2 = 60 + Math.cos(angle) * 46
          const y2 = 60 + Math.sin(angle) * 46
          return (
            <motion.line
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              x1="60"
              y1="60"
              x2={x2}
              y2={y2}
              stroke="url(#spark)"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ opacity: 0.9, pathLength: 0 }}
              animate={{ opacity: 0, pathLength: 1 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.015 }}
            />
          )
        })}
      </svg>

      {/* smoke blobs */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      >
        {[
          { x: -10, y: 10, s: 42 },
          { x: 12, y: -12, s: 34 },
          { x: 18, y: 18, s: 38 },
        ].map((b, i) => (
          <motion.div
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            className="absolute rounded-full bg-slate-200/20 blur-md"
            style={{ width: b.s, height: b.s, left: `calc(50% + ${b.x}px)`, top: `calc(50% + ${b.y}px)` }}
            initial={{ scale: 0.2, x: 0, y: 0 }}
            animate={{ scale: 1.6, x: b.x * 1.4, y: b.y * 1.4 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.05 * i }}
          />
        ))}
      </motion.div>
    </div>
  )
}


