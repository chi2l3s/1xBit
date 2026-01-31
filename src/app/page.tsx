"use client"

import { GameCard } from "@/components/GameCard"
import {
  Dices,
  TrendingUp,
  CircleDot,
  Spade,
  SquareStack,
  Target,
  Sparkles,
  Shield,
  Zap,
  Users
} from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePreferences } from "@/components/providers/PreferencesProvider"
import type { TranslationKey } from "@/lib/i18n"

const games = [
  {
    nameKey: "games.dice.title",
    descriptionKey: "games.dice.subtitle",
    href: "/games/dice",
    icon: Dices,
    tone: "text-sky-300",
    players: "1.2k",
  },
  {
    nameKey: "games.crash.title",
    descriptionKey: "games.crash.subtitle",
    href: "/games/crash",
    icon: TrendingUp,
    tone: "text-emerald-300",
    players: "3.4k",
    hot: true,
  },
  {
    nameKey: "games.slots.title",
    descriptionKey: "games.slots.subtitle",
    href: "/games/slots",
    icon: SquareStack,
    tone: "text-fuchsia-300",
    players: "2.8k",
    hot: true,
  },
  {
    nameKey: "games.roulette.title",
    descriptionKey: "games.roulette.subtitle",
    href: "/games/roulette",
    icon: CircleDot,
    tone: "text-rose-300",
    players: "1.5k",
  },
  {
    nameKey: "games.blackjack.title",
    descriptionKey: "games.blackjack.subtitle",
    href: "/games/blackjack",
    icon: Spade,
    tone: "text-amber-300",
    players: "2.1k",
  },
  {
    nameKey: "games.poker.title",
    descriptionKey: "games.poker.subtitle",
    href: "/games/poker",
    icon: Target,
    tone: "text-pink-300",
    players: "890",
  },
]

const features = [
  {
    icon: Zap,
    titleKey: "home.features.instantPayouts",
    descriptionKey: "home.features.instantPayoutsDesc",
    color: "text-yellow-500",
  },
  {
    icon: Shield,
    titleKey: "home.features.provablyFair",
    descriptionKey: "home.features.provablyFairDesc",
    color: "text-blue-500",
  },
  {
    icon: Users,
    titleKey: "home.features.support",
    descriptionKey: "home.features.supportDesc",
    color: "text-green-500",
  },
]

export default function HomePage() {
  const { t } = usePreferences()

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl surface border border-border/50 p-8 md:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">{t("home.welcomeBonus")}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-primary">{t("home.playWin")}</span>
              <br />
              <span className="text-foreground">{t("home.casino")}</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              {t("home.heroSubtitle")}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/games/crash"
                className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 button-convex"
              >
                <TrendingUp className="h-5 w-5" />
                {t("home.playCrash")}
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl bg-muted/60 hover:bg-muted/80 text-foreground font-semibold transition-colors"
              >
                {t("home.createAccount")}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative z-10 mt-12 grid grid-cols-3 gap-4 md:gap-8 max-w-xl"
        >
          {[
            { value: "$2.5M+", label: t("home.totalPaidOut") },
            { value: "50K+", label: t("home.activePlayers") },
            { value: "99.9%", label: t("home.uptime") },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.titleKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="p-6 rounded-2xl surface border border-border/50 hover:border-border transition-colors"
          >
            <feature.icon className={`h-8 w-8 ${feature.color} mb-4`} />
            <h3 className="font-semibold mb-1">{t(feature.titleKey as TranslationKey)}</h3>
            <p className="text-sm text-muted-foreground">{t(feature.descriptionKey as TranslationKey)}</p>
          </motion.div>
        ))}
      </section>

      {/* Games Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{t("home.popularGamesTitle")}</h2>
            <p className="text-muted-foreground">{t("home.popularGamesDesc")}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>8,432 {t("home.playersOnline")}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index }}
            >
              <GameCard
                name={t(game.nameKey as TranslationKey)}
                description={t(game.descriptionKey as TranslationKey)}
                href={game.href}
                icon={game.icon}
                tone={game.tone}
                players={game.players}
                hot={game.hot}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-3xl surface-strong p-8 md:p-12 text-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("home.ctaTitle")}
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            {t("home.ctaSubtitle")}
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors button-convex"
          >
            <Sparkles className="h-5 w-5" />
            {t("home.ctaButton")}
          </Link>
        </div>
      </section>
    </div>
  )
}
