export interface CrashResult {
  crashPoint: number
  cashedOut: boolean
  cashOutMultiplier: number
  win: boolean
  payout: number
}

export function generateCrashPoint(): number {
  const houseEdge = 0.03
  const random = Math.random()

  if (random < houseEdge) {
    return 1.00
  }

  const crashPoint = 1 / (1 - random)
  return Math.max(1.00, Math.floor(crashPoint * 100) / 100)
}

export function playCrash(
  bet: number,
  cashOutAt: number,
  crashPoint: number
): CrashResult {
  const cashedOut = cashOutAt <= crashPoint
  const cashOutMultiplier = cashedOut ? cashOutAt : 0
  const payout = cashedOut ? bet * cashOutMultiplier : 0

  return {
    crashPoint,
    cashedOut,
    cashOutMultiplier,
    win: cashedOut,
    payout: Math.floor(payout * 100) / 100,
  }
}
