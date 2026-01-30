import { prisma } from "./prisma"

export type OddsMode = "normal" | "always_win" | "always_lose" | "custom"

export interface UserOddsConfig {
  mode: OddsMode
  winRate: number
}

export async function getUserOdds(userId: string): Promise<UserOddsConfig> {
  const odds = await prisma.userOdds.findUnique({
    where: { userId },
  })

  if (!odds) {
    return { mode: "normal", winRate: 50 }
  }

  return {
    mode: odds.mode as OddsMode,
    winRate: odds.winRate,
  }
}

export function shouldWin(odds: UserOddsConfig, naturalWinChance?: number): boolean {
  switch (odds.mode) {
    case "always_win":
      return true
    case "always_lose":
      return false
    case "custom":
      return Math.random() * 100 < odds.winRate
    case "normal":
    default:
      if (naturalWinChance !== undefined) {
        return Math.random() * 100 < naturalWinChance
      }
      return Math.random() < 0.5
  }
}

export function rigDiceRoll(
  odds: UserOddsConfig,
  target: number,
  isOver: boolean
): number {
  const forcedWin = shouldWin(odds)

  if (odds.mode === "normal") {
    return Math.floor(Math.random() * 100) + 1
  }

  if (forcedWin) {
    if (isOver) {
      return Math.floor(Math.random() * (100 - target)) + target + 1
    } else {
      return Math.floor(Math.random() * (target - 1)) + 1
    }
  } else {
    if (isOver) {
      return Math.floor(Math.random() * target) + 1
    } else {
      return Math.floor(Math.random() * (100 - target)) + target + 1
    }
  }
}

export function rigRouletteResult(
  odds: UserOddsConfig,
  bets: Array<{ type: string; numbers?: number[] }>
): number {
  if (odds.mode === "normal") {
    return Math.floor(Math.random() * 37)
  }

  const allNumbers = Array.from({ length: 37 }, (_, i) => i)
  const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

  const winningNumbers: number[] = []
  const losingNumbers: number[] = [...allNumbers]

  for (const bet of bets) {
    let coveredNumbers: number[] = []

    switch (bet.type) {
      case "number":
        coveredNumbers = bet.numbers || []
        break
      case "red":
        coveredNumbers = RED_NUMBERS
        break
      case "black":
        coveredNumbers = allNumbers.filter((n) => n !== 0 && !RED_NUMBERS.includes(n))
        break
      case "odd":
        coveredNumbers = allNumbers.filter((n) => n !== 0 && n % 2 === 1)
        break
      case "even":
        coveredNumbers = allNumbers.filter((n) => n !== 0 && n % 2 === 0)
        break
      case "1-18":
        coveredNumbers = allNumbers.filter((n) => n >= 1 && n <= 18)
        break
      case "19-36":
        coveredNumbers = allNumbers.filter((n) => n >= 19 && n <= 36)
        break
      case "1st12":
        coveredNumbers = allNumbers.filter((n) => n >= 1 && n <= 12)
        break
      case "2nd12":
        coveredNumbers = allNumbers.filter((n) => n >= 13 && n <= 24)
        break
      case "3rd12":
        coveredNumbers = allNumbers.filter((n) => n >= 25 && n <= 36)
        break
    }

    for (const num of coveredNumbers) {
      if (!winningNumbers.includes(num)) {
        winningNumbers.push(num)
      }
      const idx = losingNumbers.indexOf(num)
      if (idx !== -1) {
        losingNumbers.splice(idx, 1)
      }
    }
  }

  const forcedWin = shouldWin(odds)

  if (forcedWin && winningNumbers.length > 0) {
    return winningNumbers[Math.floor(Math.random() * winningNumbers.length)]
  } else if (!forcedWin && losingNumbers.length > 0) {
    return losingNumbers[Math.floor(Math.random() * losingNumbers.length)]
  }

  return Math.floor(Math.random() * 37)
}

export function rigSlotsGrid(
  odds: UserOddsConfig,
  symbols: string[]
): string[][] {
  const rows = 3
  const cols = 5

  if (odds.mode === "normal") {
    const grid: string[][] = []
    for (let row = 0; row < rows; row++) {
      grid[row] = []
      for (let col = 0; col < cols; col++) {
        grid[row][col] = symbols[Math.floor(Math.random() * symbols.length)]
      }
    }
    return grid
  }

  const forcedWin = shouldWin(odds)

  if (forcedWin) {
    const winningSymbol = symbols[Math.floor(Math.random() * symbols.length)]
    const winRow = Math.floor(Math.random() * rows)
    const matchCount = 3 + Math.floor(Math.random() * 3)

    const grid: string[][] = []
    for (let row = 0; row < rows; row++) {
      grid[row] = []
      for (let col = 0; col < cols; col++) {
        if (row === winRow && col < matchCount) {
          grid[row][col] = winningSymbol
        } else {
          grid[row][col] = symbols[Math.floor(Math.random() * symbols.length)]
        }
      }
    }
    return grid
  } else {
    const grid: string[][] = []
    for (let row = 0; row < rows; row++) {
      grid[row] = []
      let prevSymbol = ""
      let sameCount = 0

      for (let col = 0; col < cols; col++) {
        let symbol: string
        do {
          symbol = symbols[Math.floor(Math.random() * symbols.length)]
        } while (symbol === prevSymbol && sameCount >= 2)

        if (symbol === prevSymbol) {
          sameCount++
        } else {
          sameCount = 1
          prevSymbol = symbol
        }

        grid[row][col] = symbol
      }
    }
    return grid
  }
}

export function rigBlackjackDeal(
  odds: UserOddsConfig,
  currentPlayerTotal: number,
  currentDealerTotal: number,
  deck: Array<{ suit: string; rank: string; value: number }>
): { suit: string; rank: string; value: number } {
  if (odds.mode === "normal" || deck.length === 0) {
    return deck[Math.floor(Math.random() * deck.length)]
  }

  const forcedWin = shouldWin(odds)

  if (forcedWin) {
    const goodCards = deck.filter((card) => {
      const newTotal = currentPlayerTotal + card.value
      return newTotal <= 21 && newTotal > currentPlayerTotal
    })
    if (goodCards.length > 0) {
      return goodCards[Math.floor(Math.random() * goodCards.length)]
    }
  } else {
    const bustCards = deck.filter((card) => currentPlayerTotal + card.value > 21)
    if (bustCards.length > 0) {
      return bustCards[Math.floor(Math.random() * bustCards.length)]
    }
  }

  return deck[Math.floor(Math.random() * deck.length)]
}
