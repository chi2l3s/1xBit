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
          "absolute -inset-6 rounded-full blur-3xl opacity-60",
          glowClassName ?? "bg-cyan-400/40"
        )}
        animate={{ opacity: [0.4, 0.75, 0.45] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg
        width="96"
        height="96"
        viewBox="0 0 120 150"
        className="relative drop-shadow-[0_22px_32px_rgba(0,0,0,0.45)]"
      >
        <defs>
          {/* Body */}
          <linearGradient id="bodyPro" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f8fafc" />
            <stop offset="0.35" stopColor="#cbd5f5" />
            <stop offset="0.7" stopColor="#6b7280" />
            <stop offset="1" stopColor="#111827" />
          </linearGradient>

          {/* Accent */}
          <linearGradient id="accentPro" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#38bdf8" />
            <stop offset="0.5" stopColor="#60a5fa" />
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

          <linearGradient id="trimPro" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f97316" />
            <stop offset="1" stopColor="#ef4444" />
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
          d="M60 6 C44 26 40 42 38 60 L82 60 C80 42 76 26 60 6 Z"
          fill="url(#accentPro)"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="2"
        />

        {/* Main body */}
        <path
          d="M38 60 C30 90 34 112 48 132 C54 142 66 142 72 132 C86 112 90 90 82 60 Z"
          fill="url(#bodyPro)"
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="2"
        />

        {/* Waist trim */}
        <path
          d="M40 82 L80 82 C78 88 76 92 60 94 C44 92 42 88 40 82 Z"
          fill="url(#trimPro)"
          opacity="0.9"
        />

        {/* Center accent stripe */}
        <path
          d="M52 64 C50 90 52 108 60 128 C68 108 70 90 68 64 Z"
          fill="url(#accentPro)"
          opacity="0.9"
        />

        {/* Windows */}
        <circle cx="60" cy="78" r="11" fill="url(#glassPro)" stroke="white" strokeWidth="2" />
        <circle cx="60" cy="102" r="7" fill="url(#glassPro)" opacity="0.85" />
        <circle cx="60" cy="78" r="4" fill="white" opacity="0.35" />

        {/* Fins */}
        <path d="M38 92 L16 114 L42 120 Z" fill="url(#trimPro)" />
        <path d="M82 92 L104 114 L78 120 Z" fill="url(#trimPro)" />
        <path d="M44 96 L24 112 L46 116 Z" fill="#f97316" opacity="0.6" />
        <path d="M76 96 L96 112 L74 116 Z" fill="#f97316" opacity="0.6" />

        {/* Engine */}
        <path
          d="M46 132 C48 148 72 148 74 132 C70 138 50 138 46 132 Z"
          fill="#020617"
        />
        <ellipse cx="60" cy="136" rx="16" ry="6" fill="#0f172a" opacity="0.7" />

        {/* Engraved lines */}
        <line x1="44" y1="72" x2="76" y2="72" stroke="rgba(255,255,255,0.15)" />
        <line x1="46" y1="90" x2="74" y2="90" stroke="rgba(255,255,255,0.15)" />
        <line x1="48" y1="112" x2="72" y2="112" stroke="rgba(255,255,255,0.12)" />

        {/* Moving highlight */}
        <motion.rect
          x="40"
          y="60"
          width="40"
          height="72"
          fill="url(#highlightPro)"
          opacity="0.35"
          animate={{ x: [40, 58, 40] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>

      {/* Flame */}
      {flame && (
        <motion.div
          className="absolute left-1/2 -bottom-8 -translate-x-1/2"
          animate={{ y: [0, 3, 0] }}
          transition={{ duration: 0.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg width="52" height="52" viewBox="0 0 120 120">
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
