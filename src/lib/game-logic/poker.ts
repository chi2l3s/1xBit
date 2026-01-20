export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades"
  rank: string
  value: number
}

export interface PokerHand {
  cards: Card[]
  rank: string
  multiplier: number
}

const SUITS: Card["suit"][] = ["hearts", "diamonds", "clubs", "spades"]
const RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"]

function getRankValue(rank: string): number {
  const index = RANKS.indexOf(rank)
  return index + 2
}

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank, value: getRankValue(rank) })
    }
  }
  return shuffleDeck(deck)
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function evaluateHand(cards: Card[]): { rank: string; multiplier: number } {
  const sortedCards = [...cards].sort((a, b) => b.value - a.value)
  const values = sortedCards.map((c) => c.value)
  const suits = sortedCards.map((c) => c.suit)
  const ranks = sortedCards.map((c) => c.rank)

  const isFlush = suits.every((s) => s === suits[0])
  const isStraight = checkStraight(values)
  const counts = getCounts(values)
  const countValues = Object.values(counts).sort((a, b) => b - a)

  if (isFlush && isStraight && values[0] === 14) {
    return { rank: "Royal Flush", multiplier: 800 }
  }
  if (isFlush && isStraight) {
    return { rank: "Straight Flush", multiplier: 50 }
  }
  if (countValues[0] === 4) {
    return { rank: "Four of a Kind", multiplier: 25 }
  }
  if (countValues[0] === 3 && countValues[1] === 2) {
    return { rank: "Full House", multiplier: 9 }
  }
  if (isFlush) {
    return { rank: "Flush", multiplier: 6 }
  }
  if (isStraight) {
    return { rank: "Straight", multiplier: 4 }
  }
  if (countValues[0] === 3) {
    return { rank: "Three of a Kind", multiplier: 3 }
  }
  if (countValues[0] === 2 && countValues[1] === 2) {
    return { rank: "Two Pair", multiplier: 2 }
  }
  if (countValues[0] === 2) {
    const pairValue = parseInt(Object.keys(counts).find((k) => counts[parseInt(k)] === 2) || "0")
    if (pairValue >= 11) {
      return { rank: "Jacks or Better", multiplier: 1 }
    }
    return { rank: "Low Pair", multiplier: 0 }
  }

  return { rank: "High Card", multiplier: 0 }
}

function checkStraight(values: number[]): boolean {
  const sorted = [...values].sort((a, b) => a - b)

  if (sorted[4] === 14 && sorted[0] === 2 && sorted[1] === 3 && sorted[2] === 4 && sorted[3] === 5) {
    return true
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1] - sorted[i] !== 1) {
      return false
    }
  }
  return true
}

function getCounts(values: number[]): Record<number, number> {
  const counts: Record<number, number> = {}
  for (const v of values) {
    counts[v] = (counts[v] || 0) + 1
  }
  return counts
}

export function dealHand(deck: Card[]): { hand: Card[]; remainingDeck: Card[] } {
  const hand = deck.slice(0, 5)
  const remainingDeck = deck.slice(5)
  return { hand, remainingDeck }
}

export function redraw(
  hand: Card[],
  deck: Card[],
  holdIndices: number[]
): { newHand: Card[]; remainingDeck: Card[] } {
  const newHand = [...hand]
  const remainingDeck = [...deck]

  for (let i = 0; i < 5; i++) {
    if (!holdIndices.includes(i)) {
      newHand[i] = remainingDeck.shift()!
    }
  }

  return { newHand, remainingDeck }
}

export function getCardDisplay(card: Card): string {
  const suitSymbols = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  }
  return `${card.rank}${suitSymbols[card.suit]}`
}

export function isRedSuit(suit: Card["suit"]): boolean {
  return suit === "hearts" || suit === "diamonds"
}

export const PAYTABLE = [
  { rank: "Royal Flush", multiplier: 800 },
  { rank: "Straight Flush", multiplier: 50 },
  { rank: "Four of a Kind", multiplier: 25 },
  { rank: "Full House", multiplier: 9 },
  { rank: "Flush", multiplier: 6 },
  { rank: "Straight", multiplier: 4 },
  { rank: "Three of a Kind", multiplier: 3 },
  { rank: "Two Pair", multiplier: 2 },
  { rank: "Jacks or Better", multiplier: 1 },
]
