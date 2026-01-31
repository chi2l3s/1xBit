import { generateCrashPoint } from "./crash"

interface CrashRound {
  id: string
  userId: string
  bet: number
  crashPoint: number
  startedAt: number
}

const rounds = new Map<string, CrashRound>()
const ROUND_TTL_MS = 5 * 60 * 1000

const pruneRounds = () => {
  const now = Date.now()
  for (const [id, round] of rounds.entries()) {
    if (now - round.startedAt > ROUND_TTL_MS) {
      rounds.delete(id)
    }
  }
}

export const createCrashRound = (userId: string, bet: number) => {
  pruneRounds()
  const crashPoint = generateCrashPoint()
  const roundId = crypto.randomUUID()
  rounds.set(roundId, {
    id: roundId,
    userId,
    bet,
    crashPoint,
    startedAt: Date.now(),
  })

  return { roundId, crashPoint }
}

export const getCrashRound = (roundId: string) => {
  pruneRounds()
  return rounds.get(roundId)
}

export const removeCrashRound = (roundId: string) => {
  rounds.delete(roundId)
}
