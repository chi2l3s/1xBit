import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id } = await params

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

  const body = await request.json()
  const { mode, winRate } = body

  if (!["normal", "always_win", "always_lose", "custom"].includes(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 })
  }

  if (typeof winRate !== "number" || winRate < 0 || winRate > 100) {
    return NextResponse.json({ error: "Invalid winRate" }, { status: 400 })
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
  })

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const odds = await prisma.userOdds.upsert({
    where: { userId: id },
    update: { mode, winRate },
    create: { userId: id, mode, winRate },
  })

  return NextResponse.json(odds)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  const { id } = await params

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

  await prisma.userOdds.deleteMany({
    where: { userId: id },
  })

  return NextResponse.json({ success: true })
}
