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

const games = [
  {
    name: "Dice",
    description: "Predict the roll outcome and multiply your bet",
    href: "/games/dice",
    icon: Dices,
    gradient: "from-blue-500 to-blue-700",
    players: "1.2k",
  },
  {
    name: "Crash",
    description: "Cash out before the plane crashes",
    href: "/games/crash",
    icon: TrendingUp,
    gradient: "from-green-500 to-emerald-700",
    players: "3.4k",
    hot: true,
  },
  {
    name: "Slots",
    description: "Spin to win massive jackpots",
    href: "/games/slots",
    icon: SquareStack,
    gradient: "from-purple-500 to-violet-700",
    players: "2.8k",
    hot: true,
  },
  {
    name: "Roulette",
    description: "Classic European roulette experience",
    href: "/games/roulette",
    icon: CircleDot,
    gradient: "from-red-500 to-rose-700",
    players: "1.5k",
  },
  {
    name: "Blackjack",
    description: "Beat the dealer and hit 21",
    href: "/games/blackjack",
    icon: Spade,
    gradient: "from-amber-500 to-orange-700",
    players: "2.1k",
  },
  {
    name: "Video Poker",
    description: "Jacks or Better - classic poker action",
    href: "/games/poker",
    icon: Target,
    gradient: "from-pink-500 to-rose-700",
    players: "890",
  },
]

const features = [
  {
    icon: Zap,
    title: "Instant Payouts",
    description: "Withdraw your winnings instantly",
    color: "text-yellow-500",
  },
  {
    icon: Shield,
    title: "Provably Fair",
    description: "Verified random outcomes",
    color: "text-blue-500",
  },
  {
    icon: Users,
    title: "24/7 Support",
    description: "Always here to help you",
    color: "text-green-500",
  },
]

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent border border-border/50 p-8 md:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Welcome Bonus Available</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-gradient-blue">Play & Win</span>
              <br />
              <span className="text-foreground">at 1xBit Casino</span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Experience the thrill of premium casino gaming. Instant deposits, fast withdrawals, and the best odds in the industry.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/games/crash"
                className="px-6 py-3 rounded-xl bg-gradient-blue text-white font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <TrendingUp className="h-5 w-5" />
                Play Crash
              </Link>
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold transition-colors"
              >
                Create Account
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
            { value: "$2.5M+", label: "Total Paid Out" },
            { value: "50K+", label: "Active Players" },
            { value: "99.9%", label: "Uptime" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-gradient-gold">{stat.value}</p>
              <p className="text-xs md:text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className="p-6 rounded-xl bg-gradient-card border border-border/50 hover:border-border transition-colors"
          >
            <feature.icon className={`h-8 w-8 ${feature.color} mb-4`} />
            <h3 className="font-semibold mb-1">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </motion.div>
        ))}
      </section>

      {/* Games Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Popular Games</h2>
            <p className="text-muted-foreground">Choose from our selection of premium games</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>8,432 players online</span>
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
              <GameCard {...game} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-purple-600 p-8 md:p-12 text-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />

        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Winning?
          </h2>
          <p className="text-white/80 mb-8 max-w-lg mx-auto">
            Join thousands of players and experience the best online casino. Get your welcome bonus today!
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-primary font-bold hover:bg-white/90 transition-colors"
          >
            <Sparkles className="h-5 w-5" />
            Get Started Now
          </Link>
        </div>
      </section>
    </div>
  )
}
