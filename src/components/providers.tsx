import type { ReactNode } from "react"
import type { Session } from "next-auth"
import { ProvidersClient } from "@/components/providers/ProvidersClient"

export function Providers({ children, session }: { children: ReactNode; session: Session | null }) {
  return <ProvidersClient session={session}>{children}</ProvidersClient>
}
