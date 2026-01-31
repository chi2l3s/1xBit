"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { LucideIcon, Users, Play } from "lucide-react"
import { motion } from "framer-motion"
import { usePreferences } from "@/components/providers/PreferencesProvider"

export interface GameCardProps {
  name: string
  description: string
  href: string
  icon: LucideIcon
  tone?: string
  players?: string
  hot?: boolean
}

export function GameCard({
  name,
  description,
  href,
  icon: Icon,
  tone = "text-primary",
  players,
  hot,
}: GameCardProps) {
  const { t } = usePreferences()

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -4 }}
        className="group relative overflow-hidden rounded-2xl bg-card/80 border border-border/50 hover:border-border transition-all cursor-pointer"
      >
        {hot && (
          <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-bold uppercase">
            {t("common.hot")}
          </div>
        )}

        <div className="h-36 flex items-center justify-center bg-muted/30">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/20" />
            <Icon className={cn("h-16 w-16 transition-transform group-hover:scale-110 relative z-10", tone)} />
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold">{name}</h3>
            {players && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>{players}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
              <Play className="h-4 w-4 fill-current" />
              <span>{t("common.playNow")}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
