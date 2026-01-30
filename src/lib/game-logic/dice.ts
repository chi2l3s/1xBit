export interface DiceResult {
  roll: number
  target: number
  isOver: boolean
  win: boolean
  multiplier: number
  payout: number
}

export function calculateDiceMultiplier(target: number, isOver: boolean): number {
  const winChance = isOver ? (100 - target) / 100 : target / 100
  const houseEdge = 0.02
  return (1 - houseEdge) / winChance
}

export function playDice(
  bet: number,
  target: number,
  isOver: boolean,
  riggedRoll?: number
): DiceResult {
  const roll = riggedRoll ?? Math.floor(Math.random() * 100) + 1

  const win = isOver ? roll > target : roll < target
  const multiplier = calculateDiceMultiplier(target, isOver)
  const payout = win ? bet * multiplier : 0

  return {
    roll,
    target,
    isOver,
    win,
    multiplier,
    payout: Math.floor(payout * 100) / 100,
  }
}
