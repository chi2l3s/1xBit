import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateCrashPoint, playCrash } from "@/lib/game-logic/crash"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { bet, cashOutAt } = await request.json()

    if (!bet || bet <= 0 || !cashOutAt || cashOutAt < 1.01) {
      return NextResponse.json(
        { error: "Invalid bet parameters" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.balance < bet) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      )
    }

    const crashPoint = generateCrashPoint()
    const result = playCrash(bet, cashOutAt, crashPoint)

    const newBalance = user.balance - bet + result.payout

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
          bet,
          result: result.payout,
          details: JSON.stringify({
            crashPoint,
            cashOutAt,
            cashedOut: result.cashedOut
          })
        }
      })
    ])

    return NextResponse.json({
      ...result,
      newBalance
    })
  } catch (error) {
    console.error("Crash game error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
