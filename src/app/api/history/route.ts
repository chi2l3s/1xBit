import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "transactions"
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)

    if (type === "transactions") {
      const transactions = await prisma.transaction.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: limit
      })
      return NextResponse.json({ transactions })
    }

    if (type === "games") {
      const games = await prisma.gameHistory.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: limit
      })
      return NextResponse.json({ games })
    }

    return NextResponse.json(
      { error: "Invalid type" },
      { status: 400 }
    )
  } catch (error) {
    console.error("History error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
