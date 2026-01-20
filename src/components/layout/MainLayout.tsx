"use client"

import { useState } from "react"
import { Header } from "./Header"
import { Sidebar } from "./Sidebar"
import { Footer } from "./Footer"
import { LiveFeed } from "./sidebar/LiveFeed"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className={cn("border-b border-border/40 bg-background/80 backdrop-blur-sm")}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
          <LiveFeed />
        </div>
      </div>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={() => setSidebarCollapsed(v => !v)}
      />
      <main
        className={cn(
          "min-h-[calc(100vh-4rem)]",
          sidebarCollapsed ? "md:ml-20" : "md:ml-72"
        )}
      >
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
        <Footer />
      </main>
    </div>
  )
}
