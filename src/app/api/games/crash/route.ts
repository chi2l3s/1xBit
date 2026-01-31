import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCrashRound, getCrashRound, removeCrashRound } from "@/lib/game-logic/crash-rounds"
import { playCrash } from "@/lib/game-logic/crash"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const payload = await request.json()
    const action = payload?.action ?? "start"

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 400 }
      )
    }

    if (action === "start") {
      const bet = Number(payload?.bet ?? 0)

      if (!bet || bet <= 0) {
        return NextResponse.json(
          { error: "Invalid bet parameters" },
          { status: 400 }
        )
      }

      if (user.balance < bet) {
        return NextResponse.json(
          { error: "Insufficient balance" },
          { status: 400 }
        )
      }

      const { roundId, crashPoint } = createCrashRound(session.user.id, bet)

      const newBalance = user.balance - bet

      await prisma.$transaction([
        prisma.user.update({
          where: { id: session.user.id },
          data: { balance: newBalance }
        }),
        prisma.transaction.create({
          data: {
            userId: session.user.id,
            type: "bet",
            amount: -bet,
            game: "crash"
          }
        })
      ])

      return NextResponse.json({
        roundId,
        crashPoint,
        newBalance
      })
    }

    if (action === "cashout") {
      const roundId = String(payload?.roundId ?? "")
      const cashOutAt = Number(payload?.cashOutAt ?? 0)

      if (!roundId || !cashOutAt || cashOutAt < 1.01) {
        return NextResponse.json(
          { error: "Invalid cash out parameters" },
          { status: 400 }
        )
      }

      const round = getCrashRound(roundId)
      if (!round || round.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Round not found" },
          { status: 404 }
        )
      }

      const result = playCrash(round.bet, cashOutAt, round.crashPoint)
      const newBalance = user.balance + result.payout

      await prisma.$transaction([
        prisma.user.update({
          where: { id: session.user.id },
          data: { balance: newBalance }
        }),
        ...(result.win ? [
          prisma.transaction.create({
            data: {
              userId: session.user.id,
              type: "win",
              amount: result.payout,
              game: "crash"
            }
          })
        ] : []),
        prisma.gameHistory.create({
          data: {
            userId: session.user.id,
            game: "crash",
            bet: round.bet,
            result: result.payout,
            details: JSON.stringify({
              crashPoint: round.crashPoint,
              cashOutAt,
              cashedOut: result.cashedOut
            })
          }
        })
      ])

      removeCrashRound(roundId)

      return NextResponse.json({
        ...result,
        crashPoint: round.crashPoint,
        newBalance
      })
    }

    if (action === "crash") {
      const roundId = String(payload?.roundId ?? "")

      if (!roundId) {
        return NextResponse.json(
          { error: "Invalid crash parameters" },
          { status: 400 }
        )
      }

      const round = getCrashRound(roundId)
      if (!round || round.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Round not found" },
          { status: 404 }
        )
      }

      await prisma.gameHistory.create({
        data: {
          userId: session.user.id,
          game: "crash",
          bet: round.bet,
          result: 0,
          details: JSON.stringify({
            crashPoint: round.crashPoint,
            cashOutAt: null,
            cashedOut: false
          })
        }
      })

      removeCrashRound(roundId)

      return NextResponse.json({
        win: false,
        payout: 0,
        cashOutMultiplier: 0,
        crashPoint: round.crashPoint,
        newBalance: user.balance
      })
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Crash game error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
