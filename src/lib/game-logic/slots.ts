export const SLOT_SYMBOLS = [
  { id: "seven", emoji: "7️⃣", multiplier: 10 },
  { id: "diamond", emoji: "💎", multiplier: 5 },
  { id: "bell", emoji: "🔔", multiplier: 3 },
  { id: "cherry", emoji: "🍒", multiplier: 2 },
  { id: "lemon", emoji: "🍋", multiplier: 1.5 },
  { id: "orange", emoji: "🍊", multiplier: 1.2 },
  { id: "grape", emoji: "🍇", multiplier: 1 },
]

export interface SlotResult {
  grid: string[][]
  winLines: { line: number; symbols: string; multiplier: number }[]
  totalMultiplier: number
  payout: number
  win: boolean
}

function getRandomSymbol(): typeof SLOT_SYMBOLS[0] {
  const weights = [1, 2, 3, 4, 5, 6, 7]
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let random = Math.random() * totalWeight

  for (let i = 0; i < SLOT_SYMBOLS.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return SLOT_SYMBOLS[i]
    }
  }

  return SLOT_SYMBOLS[SLOT_SYMBOLS.length - 1]
}

function checkLine(symbols: string[]): { match: boolean; count: number } {
  const first = symbols[0]
  let count = 1

  for (let i = 1; i < symbols.length; i++) {
    if (symbols[i] === first) {
      count++
    } else {
      break
    }
  }

  return { match: count >= 3, count }
}

export function playSlots(bet: number): SlotResult {
  const rows = 3
  const cols = 5
  const grid: string[][] = []

  for (let row = 0; row < rows; row++) {
    grid[row] = []
    for (let col = 0; col < cols; col++) {
      grid[row][col] = getRandomSymbol().emoji
    }
  }

  const winLines: { line: number; symbols: string; multiplier: number }[] = []
  let totalMultiplier = 0

  for (let row = 0; row < rows; row++) {
    const lineSymbols = grid[row]
    const { match, count } = checkLine(lineSymbols)

    if (match) {
      const symbol = SLOT_SYMBOLS.find((s) => s.emoji === lineSymbols[0])
      if (symbol) {
        const lineMultiplier = symbol.multiplier * (count - 2)
        winLines.push({
          line: row + 1,
          symbols: lineSymbols[0],
          multiplier: lineMultiplier,
        })
        totalMultiplier += lineMultiplier
      }
    }
  }

  const middleDiagonal = [grid[0][0], grid[1][1], grid[2][2], grid[1][3], grid[0][4]]
  const { match: diagMatch, count: diagCount } = checkLine(middleDiagonal)
  if (diagMatch) {
    const symbol = SLOT_SYMBOLS.find((s) => s.emoji === middleDiagonal[0])
    if (symbol) {
      const diagMultiplier = symbol.multiplier * (diagCount - 2)
      winLines.push({
        line: 4,
        symbols: middleDiagonal[0],
        multiplier: diagMultiplier,
      })
      totalMultiplier += diagMultiplier
    }
  }

  const payout = Math.floor(bet * totalMultiplier * 100) / 100

  return {
    grid,
    winLines,
    totalMultiplier,
    payout,
    win: totalMultiplier > 0,
  }
}
