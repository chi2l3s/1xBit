import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (digits.startsWith("8") && digits.length === 11) return `7${digits.slice(1)}`
  if (digits.startsWith("7") && digits.length === 11) return digits
  if (digits.length === 10) return `7${digits}`
  return digits
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { amount, phone } = await request.json()
    const normalizedPhone = normalizePhone(String(phone || ""))

    if (!amount || amount <= 0 || amount > 100000) {
      return NextResponse.json(
        { error: "Invalid amount. Must be between 1 and 100,000" },
        { status: 400 }
      )
    }

    // RU-like phone: country(7) + 10 digits
    if (!/^\d{11}$/.test(normalizedPhone)) {
      return NextResponse.json(
        { error: "Invalid phone. Provide a valid phone number." },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.balance < amount) {
      return NextResponse.json({ error: "Insufficient balance" }, { status: 400 })
    }

    const newBalance = user.balance - amount

    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.user.id },
        data: { balance: newBalance }
      }),
      prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: "withdraw_phone",
          amount,
          game: normalizedPhone
        }
      })
    ])

    return NextResponse.json({
      success: true,
      newBalance,
      message: "Withdrawal request created"
    })
  } catch (error) {
    console.error("Withdraw error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


