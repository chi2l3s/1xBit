"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function Rocket({
  className,
  glowClassName,
  flame = true,
}: {
  className?: string
  glowClassName?: string
  flame?: boolean
}) {
  return (
    <div className={cn("relative", className)}>
      {/* Glow */}
      <motion.div
        className={cn(
          "absolute -inset-4 rounded-full blur-3xl opacity-60",
          glowClassName ?? "bg-cyan-400/40"
        )}
        animate={{ opacity: [0.4, 0.75, 0.45] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg
        width="64"
        height="64"
        viewBox="0 0 120 140"
        className="relative drop-shadow-[0_18px_28px_rgba(0,0,0,0.5)]"
      >
        <defs>
          {/* Body */}
          <linearGradient id="bodyPro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f9fafb" />
            <stop offset="0.5" stopColor="#9ca3af" />
            <stop offset="1" stopColor="#1f2933" />
          </linearGradient>

          {/* Accent */}
          <linearGradient id="accentPro" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#38bdf8" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>

          {/* Window */}
          <radialGradient id="glassPro" cx="40%" cy="30%" r="60%">
            <stop offset="0" stopColor="#e0f2fe" />
            <stop offset="0.6" stopColor="#3b82f6" />
            <stop offset="1" stopColor="#020617" />
          </radialGradient>

          {/* Highlight */}
          <linearGradient id="highlightPro" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="white" stopOpacity="0" />
            <stop offset="0.5" stopColor="white" stopOpacity="0.5" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* Flame */}
          <radialGradient id="flamePro" cx="50%" cy="30%" r="70%">
            <stop offset="0" stopColor="#fff7ed" />
            <stop offset="0.45" stopColor="#fb923c" />
            <stop offset="1" stopColor="#dc2626" />
          </radialGradient>
        </defs>

        {/* Nose */}
        <path
          d="M60 6 C46 24 42 40 40 56 L80 56 C78 40 74 24 60 6 Z"
          fill="url(#accentPro)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
        />

        {/* Main body */}
        <path
          d="M40 56 C34 86 36 104 48 122 C54 132 66 132 72 122 C84 104 86 86 80 56 Z"
          fill="url(#bodyPro)"
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="2"
        />

        {/* Center accent stripe */}
        <path
          d="M52 60 C50 86 52 102 60 118 C68 102 70 86 68 60 Z"
          fill="url(#accentPro)"
          opacity="0.9"
        />

        {/* Windows */}
        <circle cx="60" cy="70" r="10" fill="url(#glassPro)" stroke="white" strokeWidth="2" />
        <circle cx="60" cy="92" r="6" fill="url(#glassPro)" opacity="0.85" />

        {/* Fins */}
        <path d="M40 84 L22 102 L42 108 Z" fill="#ef4444" />
        <path d="M80 84 L98 102 L78 108 Z" fill="#ef4444" />

        {/* Engine */}
        <path
          d="M48 120 C50 134 70 134 72 120 C68 126 52 126 48 120 Z"
          fill="#020617"
        />

        {/* Engraved lines */}
        <line x1="44" y1="66" x2="76" y2="66" stroke="rgba(255,255,255,0.15)" />
        <line x1="46" y1="84" x2="74" y2="84" stroke="rgba(255,255,255,0.15)" />

        {/* Moving highlight */}
        <motion.rect
          x="42"
          y="56"
          width="36"
          height="66"
          fill="url(#highlightPro)"
          opacity="0.35"
          animate={{ x: [40, 56, 40] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Flame */}
      {flame && (
        <motion.div
          className="absolute left-1/2 -bottom-6 -translate-x-1/2"
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 0.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="44" height="44" viewBox="0 0 120 120">
            <motion.path
              d="M60 22 C42 50 50 70 36 84 C30 94 40 110 60 114 C80 110 90 94 84 84 C70 70 78 50 60 22 Z"
              fill="url(#flamePro)"
              animate={{
                d: [
                  "M60 22 C42 50 50 70 36 84 C30 94 40 110 60 114 C80 110 90 94 84 84 C70 70 78 50 60 22 Z",
                  "M60 18 C46 48 54 70 40 82 C34 90 40 112 60 116 C80 112 86 90 80 82 C66 70 74 48 60 18 Z",
                  "M60 22 C42 50 50 70 36 84 C30 94 40 110 60 114 C80 110 90 94 84 84 C70 70 78 50 60 22 Z",
                ],
              }}
              transition={{ duration: 0.3, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </motion.div>
      )}
    </div>
  )
}
