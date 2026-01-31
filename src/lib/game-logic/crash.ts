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
  const maxMultiplier = 100

  if (random < houseEdge) {
    return 1.00
  }

  const weighted = Math.pow(Math.random(), 2.6)
  const crashPoint = 1.01 + (maxMultiplier - 1.01) * weighted
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
