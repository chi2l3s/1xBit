import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startGame, hit, stand, getMultiplier, BlackjackGame } from "@/lib/game-logic/blackjack"

const activeGames = new Map<string, { game: BlackjackGame; bet: number }>()

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { action, bet } = await request.json()

    if (action === "start") {
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
          game: "blackjack"
        }
      })

      const game = startGame()
      activeGames.set(session.user.id, { game, bet })

      const isGameOver = game.status !== "playing"

      if (isGameOver) {
        return await finishGame(session.user.id, game, bet)
      }

      return NextResponse.json({
        playerHand: game.playerHand,
        dealerHand: {
          cards: [game.dealerHand.cards[0], { hidden: true }],
          value: game.dealerHand.cards[0].value,
        },
        status: game.status,
        canHit: true,
        canStand: true,
      })
    }

    const activeGame = activeGames.get(session.user.id)
    if (!activeGame) {
      return NextResponse.json(
        { error: "No active game" },
        { status: 400 }
      )
    }

    let { game } = activeGame
    const { bet: gameBet } = activeGame

    if (action === "hit") {
      game = hit(game)
      activeGames.set(session.user.id, { game, bet: gameBet })

      if (game.status !== "playing") {
        return await finishGame(session.user.id, game, gameBet)
      }

      return NextResponse.json({
        playerHand: game.playerHand,
        dealerHand: {
          cards: [game.dealerHand.cards[0], { hidden: true }],
          value: game.dealerHand.cards[0].value,
        },
        status: game.status,
        canHit: true,
        canStand: true,
      })
    }

    if (action === "stand") {
      game = stand(game)
      return await finishGame(session.user.id, game, gameBet)
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Blackjack game error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function finishGame(userId: string, game: BlackjackGame, bet: number) {
  activeGames.delete(userId)

  const multiplier = getMultiplier(game.status)
  const payout = Math.floor(bet * multiplier * 100) / 100

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const newBalance = user.balance + payout

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance }
    }),
    ...(payout > 0 ? [
      prisma.transaction.create({
        data: {
          userId,
          type: "win",
          amount: payout,
          game: "blackjack"
        }
      })
    ] : []),
    prisma.gameHistory.create({
      data: {
        userId,
        game: "blackjack",
        bet,
        result: payout,
        details: JSON.stringify({
          playerValue: game.playerHand.value,
          dealerValue: game.dealerHand.value,
          status: game.status,
          multiplier
        })
      }
    })
  ])

  return NextResponse.json({
    playerHand: game.playerHand,
    dealerHand: game.dealerHand,
    status: game.status,
    multiplier,
    payout,
    newBalance,
    canHit: false,
    canStand: false,
    gameOver: true,
  })
}
