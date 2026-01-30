export type BetType = "number" | "red" | "black" | "odd" | "even" | "1-18" | "19-36" | "1st12" | "2nd12" | "3rd12"

export interface RouletteBet {
  type: BetType
  numbers?: number[]
  amount: number
}

export interface RouletteResult {
  number: number
  color: "red" | "black" | "green"
  bets: { type: BetType; amount: number; win: boolean; payout: number }[]
  totalPayout: number
  win: boolean
}

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]

export function getNumberColor(n: number): "red" | "black" | "green" {
  if (n === 0) return "green"
  if (RED_NUMBERS.includes(n)) return "red"
  return "black"
}

export function getBetMultiplier(type: BetType): number {
  switch (type) {
    case "number":
      return 36
    case "red":
    case "black":
    case "odd":
    case "even":
    case "1-18":
    case "19-36":
      return 2
    case "1st12":
    case "2nd12":
    case "3rd12":
      return 3
    default:
      return 0
  }
}

export function checkBetWin(type: BetType, number: number, betNumbers?: number[]): boolean {
  const color = getNumberColor(number)

  switch (type) {
    case "number":
      return betNumbers?.includes(number) ?? false
    case "red":
      return color === "red"
    case "black":
      return color === "black"
    case "odd":
      return number !== 0 && number % 2 === 1
    case "even":
      return number !== 0 && number % 2 === 0
    case "1-18":
      return number >= 1 && number <= 18
    case "19-36":
      return number >= 19 && number <= 36
    case "1st12":
      return number >= 1 && number <= 12
    case "2nd12":
      return number >= 13 && number <= 24
    case "3rd12":
      return number >= 25 && number <= 36
    default:
      return false
  }
}

export function spinRoulette(): number {
  return Math.floor(Math.random() * 37)
}

export function playRoulette(bets: RouletteBet[], riggedNumber?: number): RouletteResult {
  const number = riggedNumber ?? spinRoulette()
  const color = getNumberColor(number)

  const betResults = bets.map((bet) => {
    const win = checkBetWin(bet.type, number, bet.numbers)
    const multiplier = getBetMultiplier(bet.type)
    const payout = win ? bet.amount * multiplier : 0

    return {
      type: bet.type,
      amount: bet.amount,
      win,
      payout,
    }
  })

  const totalPayout = betResults.reduce((sum, b) => sum + b.payout, 0)

  return {
    number,
    color,
    bets: betResults,
    totalPayout,
    win: totalPayout > 0,
  }
}

export const ROULETTE_NUMBERS = Array.from({ length: 37 }, (_, i) => ({
  number: i,
  color: getNumberColor(i),
}))
