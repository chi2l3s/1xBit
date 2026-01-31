"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { usePreferences } from "@/components/providers/PreferencesProvider"

export type Suit = "hearts" | "diamonds" | "clubs" | "spades"
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K"

export interface CardData {
  suit: Suit
  rank: Rank
}

// SVG suit symbols
const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠"
}

const SUIT_COLORS: Record<Suit, string> = {
  hearts: "text-red-500",
  diamonds: "text-red-500",
  clubs: "text-gray-900",
  spades: "text-gray-900"
}

interface PlayingCardProps {
  card: CardData | { hidden: true }
  index?: number
  isHeld?: boolean
  onClick?: () => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function PlayingCard({
  card,
  index = 0,
  isHeld = false,
  onClick,
  disabled = false,
  size = "md",
  className
}: PlayingCardProps) {
  const { t } = usePreferences()
  const isHidden = "hidden" in card

  const sizeStyles = {
    sm: { width: 60, height: 84, fontSize: "text-lg", suitSize: "text-xl" },
    md: { width: 80, height: 112, fontSize: "text-xl", suitSize: "text-2xl" },
    lg: { width: 100, height: 140, fontSize: "text-2xl", suitSize: "text-3xl" }
  }

  const styles = sizeStyles[size]

  if (isHidden) {
    return (
      <motion.div
        initial={{ scale: 0, rotateY: 180 }}
        animate={{ scale: 1, rotateY: 0 }}
        transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
        className={cn(
          "relative rounded-xl overflow-hidden",
          "shadow-xl shadow-black/30",
          className
        )}
        style={{ width: styles.width, height: styles.height }}
      >
        {/* Card back design */}
        <div className="absolute inset-0 bg-blue-700/80" />
        <div className="absolute inset-2 border-2 border-blue-400/30 rounded-lg" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjEwIiBjeT0iMTAiIHI9IjIiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-50" />

        {/* Center emblem */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
            <span className="text-amber-900 font-black text-xs">1x</span>
          </div>
        </div>
      </motion.div>
    )
  }

  const { suit, rank } = card
  const suitSymbol = SUIT_SYMBOLS[suit]
  const colorClass = SUIT_COLORS[suit]

  return (
    <motion.button
      initial={{ scale: 0, rotateY: 180, x: -50 }}
      animate={{
        scale: 1,
        rotateY: 0,
        x: 0,
        y: isHeld ? -12 : 0
      }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={!disabled ? { y: isHeld ? -12 : -5 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative rounded-xl overflow-hidden",
        "bg-white",
        "shadow-xl shadow-black/30",
        "border-2 border-gray-200",
        !disabled && "cursor-pointer hover:shadow-2xl transition-shadow",
        isHeld && "ring-4 ring-amber-400 shadow-amber-400/50",
        className
      )}
      style={{ width: styles.width, height: styles.height }}
    >
      {/* Top left corner */}
      <div className={cn("absolute top-1.5 left-2 flex flex-col items-center leading-none", colorClass)}>
        <span className={cn("font-bold", styles.fontSize)}>{rank}</span>
        <span className={styles.suitSize}>{suitSymbol}</span>
      </div>

      {/* Bottom right corner (rotated) */}
      <div className={cn("absolute bottom-1.5 right-2 flex flex-col items-center leading-none rotate-180", colorClass)}>
        <span className={cn("font-bold", styles.fontSize)}>{rank}</span>
        <span className={styles.suitSize}>{suitSymbol}</span>
      </div>

      {/* Center suit */}
      <div className={cn("absolute inset-0 flex items-center justify-center", colorClass)}>
        <span className="text-4xl opacity-20">{suitSymbol}</span>
      </div>

      {/* Glossy effect */}
      <div className="absolute inset-0 bg-white/20 pointer-events-none" />

      {/* Hold indicator */}
      {isHeld && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-400 rounded-full text-[10px] font-black text-amber-900"
        >
          {t("games.poker.hold")}
        </motion.div>
      )}
    </motion.button>
  )
}

// Card fan layout for dealer/player hands
interface CardFanProps {
  cards: Array<CardData | { hidden: true }>
  label: string
  value?: number | string
  soft?: boolean
  size?: "sm" | "md" | "lg"
}

export function CardFan({ cards, label, value, soft, size = "md" }: CardFanProps) {
  const { t } = usePreferences()

  return (
    <div className="text-center space-y-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex justify-center -space-x-6">
        {cards.map((card, i) => (
          <PlayingCard key={i} card={card} index={i} size={size} />
        ))}
      </div>
      {value !== undefined && (
        <motion.p
          key={String(value)}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
        className="text-2xl font-bold"
      >
        {value}
        {soft && <span className="text-sm text-muted-foreground ml-1">({t("games.blackjack.soft")})</span>}
      </motion.p>
      )}
    </div>
  )
}

// Poker hand display with hold functionality
interface PokerHandProps {
  cards: CardData[]
  heldIndices: Set<number>
  onToggleHold: (index: number) => void
  disabled: boolean
  size?: "sm" | "md" | "lg"
}

export function PokerHand({ cards, heldIndices, onToggleHold, disabled, size = "lg" }: PokerHandProps) {
  return (
    <div className="flex justify-center gap-3">
      {cards.map((card, i) => (
        <PlayingCard
          key={i}
          card={card}
          index={i}
          isHeld={heldIndices.has(i)}
          onClick={() => onToggleHold(i)}
          disabled={disabled}
          size={size}
        />
      ))}
    </div>
  )
}
