import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { playSlots, SLOT_SYMBOLS } from "@/lib/game-logic/slots"
import { getUserOdds, rigSlotsGrid } from "@/lib/user-odds"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { bet } = await request.json()

    if (!bet || bet <= 0) {
      return NextResponse.json(
        { error: "Invalid bet amount" },
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
    const symbolIds = SLOT_SYMBOLS.map(s => s.id)
    const riggedGrid = odds.mode !== "normal" ? rigSlotsGrid(odds, symbolIds) : undefined

    const result = playSlots(bet, riggedGrid)
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
          game: "slots"
        }
      }),
      ...(result.win ? [
        prisma.transaction.create({
          data: {
            userId: session.user.id,
            type: "win",
            amount: result.payout,
            game: "slots"
          }
        })
      ] : []),
      prisma.gameHistory.create({
        data: {
          userId: session.user.id,
          game: "slots",
          bet,
          result: result.payout,
          details: JSON.stringify({
            grid: result.grid,
            winLines: result.winLines,
            totalMultiplier: result.totalMultiplier
          })
        }
      })
    ])

    return NextResponse.json({
      ...result,
      newBalance
    })
  } catch (error) {
    console.error("Slots game error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
