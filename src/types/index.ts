import { User, Transaction, GameHistory } from "@/generated/prisma/client"

export type { User, Transaction, GameHistory }

export interface GameResult {
  win: boolean
  amount: number
  multiplier?: number
  details?: Record<string, unknown>
}

export interface BetRequest {
  amount: number
  gameData?: Record<string, unknown>
}

export type GameType = "slots" | "roulette" | "blackjack" | "poker" | "crash" | "dice"

export interface SlotSymbol {
  id: string
  name: string
  emoji: string
  multiplier: number
}

export interface RouletteNumber {
  number: number
  color: "red" | "black" | "green"
}

export interface Card {
  suit: "hearts" | "diamonds" | "clubs" | "spades"
  rank: string
  value: number
}

export interface BlackjackHand {
  cards: Card[]
  value: number
  isBusted: boolean
  isBlackjack: boolean
}

export interface PokerHand {
  cards: Card[]
  rank: string
  multiplier: number
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
    }
  }
}
