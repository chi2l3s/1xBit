"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatBalance, cn } from "@/lib/utils"
import { User, Coins, History, TrendingUp, TrendingDown, Loader2 } from "lucide-react"

interface Transaction {
  id: string
  type: string
  amount: number
  game: string | null
  createdAt: string
}

interface GameHistory {
  id: string
  game: string
  bet: number
  result: number
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<{
    username: string
    email: string
    balance: number
    createdAt: string
  } | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [games, setGames] = useState<GameHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [userRes, transactionsRes, gamesRes] = await Promise.all([
        fetch("/api/user"),
        fetch("/api/history?type=transactions&limit=50"),
        fetch("/api/history?type=games&limit=50"),
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData)
      }

      if (transactionsRes.ok) {
        const transData = await transactionsRes.json()
        setTransactions(transData.transactions)
      }

      if (gamesRes.ok) {
        const gamesData = await gamesRes.json()
        setGames(gamesData.games)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTransactionIcon = (type: string, amount: number) => {
    if (type === "deposit" || type === "win") {
      return <TrendingUp className="h-4 w-4 text-green-400" />
    }
    return <TrendingDown className="h-4 w-4 text-red-400" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const calculateStats = () => {
    const totalBets = transactions
      .filter((t) => t.type === "bet")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const totalWins = transactions
      .filter((t) => t.type === "win")
      .reduce((sum, t) => sum + t.amount, 0)

    const totalDeposits = transactions
      .filter((t) => t.type === "deposit")
      .reduce((sum, t) => sum + t.amount, 0)

    const gamesPlayed = games.length

    return { totalBets, totalWins, totalDeposits, gamesPlayed }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  const stats = calculateStats()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-lg bg-primary/20">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user?.username || "Profile"}</h1>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Coins className="h-6 w-6 mx-auto mb-2 text-amber-400" />
            <p className="text-2xl font-bold text-amber-400">
              {formatBalance(user?.balance || 0)}
            </p>
            <p className="text-xs text-muted-foreground">Current Balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <History className="h-6 w-6 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold">{stats.gamesPlayed}</p>
            <p className="text-xs text-muted-foreground">Games Played</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingDown className="h-6 w-6 mx-auto mb-2 text-red-400" />
            <p className="text-2xl font-bold">{formatBalance(stats.totalBets)}</p>
            <p className="text-xs text-muted-foreground">Total Wagered</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold">{formatBalance(stats.totalWins)}</p>
            <p className="text-xs text-muted-foreground">Total Won</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="w-full">
          <TabsTrigger value="transactions" className="flex-1">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="games" className="flex-1">
            Game History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No transactions yet
                </p>
              ) : (
                <div className="space-y-2">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(tx.type, tx.amount)}
                        <div>
                          <p className="font-medium capitalize">{tx.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {tx.game && `${tx.game} • `}
                            {formatDate(tx.createdAt)}
                          </p>
                        </div>
                      </div>
                      <p
                        className={cn(
                          "font-bold",
                          tx.amount > 0 ? "text-green-400" : "text-red-400"
                        )}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {formatBalance(tx.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games">
          <Card>
            <CardHeader>
              <CardTitle>Game History</CardTitle>
            </CardHeader>
            <CardContent>
              {games.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No games played yet
                </p>
              ) : (
                <div className="space-y-2">
                  {games.map((game) => (
                    <div
                      key={game.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="font-medium capitalize">{game.game}</p>
                        <p className="text-xs text-muted-foreground">
                          Bet: {formatBalance(game.bet)} • {formatDate(game.createdAt)}
                        </p>
                      </div>
                      <p
                        className={cn(
                          "font-bold",
                          game.result > 0 ? "text-green-400" : "text-red-400"
                        )}
                      >
                        {game.result > 0 ? `+${formatBalance(game.result)}` : "Loss"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
