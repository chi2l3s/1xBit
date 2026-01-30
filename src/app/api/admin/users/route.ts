import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (currentUser?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      balance: true,
      role: true,
      createdAt: true,
      odds: {
        select: {
          mode: true,
          winRate: true,
        },
      },
      _count: {
        select: {
          gameHistory: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(users)
}
