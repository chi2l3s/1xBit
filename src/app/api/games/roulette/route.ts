import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { playRoulette, RouletteBet } from "@/lib/game-logic/roulette"
import { getUserOdds, rigRouletteResult } from "@/lib/user-odds"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { bets } = await request.json() as { bets: RouletteBet[] }

    if (!bets || !Array.isArray(bets) || bets.length === 0) {
      return NextResponse.json(
        { error: "Invalid bets" },
        { status: 400 }
      )
    }

    const totalBet = bets.reduce((sum, b) => sum + b.amount, 0)

    if (totalBet <= 0) {
      return NextResponse.json(
        { error: "Invalid bet amount" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.balance < totalBet) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      )
    }

    const odds = await getUserOdds(session.user.id)
    const riggedNumber = odds.mode !== "normal" ? rigRouletteResult(odds, bets) : undefined

    const result = playRoulette(bets, riggedNumber)
    const newBalance = user.balance - totalBet + result.totalPayout

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { balance: newBalance }
      }),
      prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: "bet",
          amount: -totalBet,
          game: "roulette"
        }
      }),
      ...(result.win ? [
        prisma.transaction.create({
          data: {
            userId: session.user.id,
            type: "win",
            amount: result.totalPayout,
            game: "roulette"
          }
        })
      ] : []),
      prisma.gameHistory.create({
        data: {
          userId: session.user.id,
          game: "roulette",
          bet: totalBet,
          result: result.totalPayout,
          details: JSON.stringify({
            number: result.number,
            color: result.color,
            bets: result.bets
          })
        }
      })
    ])

    return NextResponse.json({
      ...result,
      newBalance
    })
  } catch (error) {
    console.error("Roulette game error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
