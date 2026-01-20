import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createDeck, dealHand, redraw, evaluateHand, Card } from "@/lib/game-logic/poker"

const activeGames = new Map<string, { hand: Card[]; deck: Card[]; bet: number }>()

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { action, bet, holdIndices } = await request.json()

    if (action === "deal") {
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

      await prisma.user.update({
        where: { id: session.user.id },
        data: { balance: user.balance - bet }
      })

      await prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: "bet",
          amount: -bet,
          game: "poker"
        }
      })

      const deck = createDeck()
      const { hand, remainingDeck } = dealHand(deck)

      activeGames.set(session.user.id, { hand, deck: remainingDeck, bet })

      return NextResponse.json({
        hand,
        phase: "draw",
      })
    }

    if (action === "draw") {
      const activeGame = activeGames.get(session.user.id)
      if (!activeGame) {
        return NextResponse.json(
          { error: "No active game" },
          { status: 400 }
        )
      }

      const { hand, deck, bet: gameBet } = activeGame
      const { newHand } = redraw(hand, deck, holdIndices || [])

      activeGames.delete(session.user.id)

      const result = evaluateHand(newHand)
      const payout = Math.floor(gameBet * result.multiplier * 100) / 100

      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const newBalance = user.balance + payout

      await prisma.$transaction([
        prisma.user.update({
          where: { id: session.user.id },
          data: { balance: newBalance }
        }),
        ...(payout > 0 ? [
          prisma.transaction.create({
            data: {
              userId: session.user.id,
              type: "win",
              amount: payout,
              game: "poker"
            }
          })
        ] : []),
        prisma.gameHistory.create({
          data: {
            userId: session.user.id,
            game: "poker",
            bet: gameBet,
            result: payout,
            details: JSON.stringify({
              handRank: result.rank,
              multiplier: result.multiplier
            })
          }
        })
      ])

      return NextResponse.json({
        hand: newHand,
        rank: result.rank,
        multiplier: result.multiplier,
        payout,
        newBalance,
        phase: "complete",
        win: payout > 0,
      })
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Poker game error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
