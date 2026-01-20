import type { ReactNode } from "react"
import { auth } from "@/lib/auth"
import { Providers } from "@/components/providers"
import { MainLayout } from "@/components/layout/MainLayout"

export default async function AppShell({ children }: { children: ReactNode }) {
  const session = await auth()

  return (
    <Providers session={session}>
      <MainLayout>{children}</MainLayout>
    </Providers>
  )
}


