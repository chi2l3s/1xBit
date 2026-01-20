import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { amount, method } = await request.json()
    const paymentMethod = String(method || "card")

    if (!amount || amount <= 0 || amount > 100000) {
      return NextResponse.json(
        { error: "Invalid amount. Must be between 1 and 100,000" },
        { status: 400 }
      )
    }

    if (!["card", "crypto", "sbp"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const newBalance = user.balance + amount

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { balance: newBalance }
      }),
      prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: `deposit_${paymentMethod}`,
          amount,
          game: null
        }
      })
    ])

    return NextResponse.json({
      success: true,
      newBalance,
      message: `Successfully deposited ${amount} coins!`
    })
  } catch (error) {
    console.error("Deposit error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
