import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { playDice, calculateDiceMultiplier } from "@/lib/game-logic/dice"
import { getUserOdds, rigDiceRoll } from "@/lib/user-odds"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { bet, target, isOver } = await request.json()

    if (!bet || bet <= 0 || target === undefined || isOver === undefined) {
      return NextResponse.json(
        { error: "Invalid bet parameters" },
        { status: 400 }
      )
    }

    if (target < 1 || target > 99) {
      return NextResponse.json(
        { error: "Target must be between 1 and 99" },
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

    const odds = await getUserOdds(session.user.id)
    const riggedRoll = odds.mode !== "normal" ? rigDiceRoll(odds, target, isOver) : undefined

    const result = playDice(bet, target, isOver, riggedRoll)
    const multiplier = calculateDiceMultiplier(target, isOver)

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
          game: "dice"
        }
      }),
      ...(result.win ? [
        prisma.transaction.create({
          data: {
            userId: session.user.id,
            type: "win",
            amount: result.payout,
            game: "dice"
          }
        })
      ] : []),
      prisma.gameHistory.create({
        data: {
          userId: session.user.id,
          game: "dice",
          bet,
          result: result.payout,
          details: JSON.stringify({
            roll: result.roll,
            target,
            isOver,
            multiplier
          })
        }
      })
    ])

    return NextResponse.json({
      ...result,
      newBalance
    })
  } catch (error) {
    console.error("Dice game error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
