"use client"

import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"
import type { ReactNode } from "react"
import { PreferencesProvider } from "@/components/providers/PreferencesProvider"

export function ProvidersClient({ children, session }: { children: ReactNode; session: Session | null }) {
  return (
    <SessionProvider session={session}>
      <PreferencesProvider>{children}</PreferencesProvider>
    </SessionProvider>
  )
}

