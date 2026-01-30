"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatBalance } from "@/lib/utils"
import {
  Loader2,
  Users,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Save,
  RotateCcw,
} from "lucide-react"

interface UserOdds {
  mode: string
  winRate: number
}

interface User {
  id: string
  email: string
  username: string
  balance: number
  role: string
  createdAt: string
  odds: UserOdds | null
  _count: {
    gameHistory: number
  }
}

type OddsMode = "normal" | "always_win" | "always_lose" | "custom"

const MODE_CONFIG: Record<OddsMode, { label: string; icon: React.ReactNode; color: string }> = {
  normal: { label: "Normal", icon: <Minus className="w-4 h-4" />, color: "bg-gray-500" },
  always_win: { label: "Always Win", icon: <TrendingUp className="w-4 h-4" />, color: "bg-green-500" },
  always_lose: { label: "Always Lose", icon: <TrendingDown className="w-4 h-4" />, color: "bg-red-500" },
  custom: { label: "Custom %", icon: <Sparkles className="w-4 h-4" />, color: "bg-purple-500" },
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{
    mode: OddsMode
    winRate: number
    balance: number
  }>({ mode: "normal", winRate: 50, balance: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.status === 403) {
        router.push("/")
        return
      }
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const startEditing = (user: User) => {
    setEditingUser(user.id)
    setEditValues({
      mode: (user.odds?.mode as OddsMode) || "normal",
      winRate: user.odds?.winRate || 50,
      balance: user.balance,
    })
  }

  const cancelEditing = () => {
    setEditingUser(null)
  }

  const saveChanges = async (userId: string) => {
    setSaving(true)
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: editValues.balance }),
      })

      await fetch(`/api/admin/users/${userId}/odds`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: editValues.mode,
          winRate: editValues.winRate,
        }),
      })

      await fetchUsers()
      setEditingUser(null)
    } catch (error) {
      console.error("Failed to save:", error)
    } finally {
      setSaving(false)
    }
  }

  const resetOdds = async (userId: string) => {
    setSaving(true)
    try {
      await fetch(`/api/admin/users/${userId}/odds`, {
        method: "DELETE",
      })
      await fetchUsers()
    } catch (error) {
      console.error("Failed to reset:", error)
    } finally {
      setSaving(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Manage users and their odds</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="p-4 rounded-xl border border-border bg-muted/20 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-bold">
                      {user.username[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{user.username}</p>
                        {user.role === "admin" && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-red-500/20 text-red-400 rounded-full">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gradient-gold">
                      {formatBalance(user.balance)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user._count.gameHistory} games played
                    </p>
                  </div>
                </div>

                {editingUser === user.id ? (
                  <div className="p-4 rounded-lg bg-background/50 border border-border space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Balance</label>
                        <Input
                          type="number"
                          value={editValues.balance}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              balance: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="h-10"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Win Rate %</label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={editValues.winRate}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev,
                              winRate: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
                            }))
                          }
                          disabled={editValues.mode !== "custom"}
                          className="h-10"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Odds Mode</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(Object.keys(MODE_CONFIG) as OddsMode[]).map((mode) => {
                          const config = MODE_CONFIG[mode]
                          return (
                            <button
                              key={mode}
                              onClick={() =>
                                setEditValues((prev) => ({ ...prev, mode }))
                              }
                              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                                editValues.mode === mode
                                  ? `border-white/50 ${config.color}`
                                  : "border-border bg-muted/30 hover:bg-muted/50"
                              }`}
                            >
                              {config.icon}
                              <span className="text-xs font-medium">{config.label}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={cancelEditing} disabled={saving}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => saveChanges(user.id)}
                        disabled={saving}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Current mode:</span>
                      {user.odds ? (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                            MODE_CONFIG[user.odds.mode as OddsMode]?.color || "bg-gray-500"
                          }`}
                        >
                          {MODE_CONFIG[user.odds.mode as OddsMode]?.label || user.odds.mode}
                          {user.odds.mode === "custom" && ` (${user.odds.winRate}%)`}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-gray-500">
                          Normal
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {user.odds && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resetOdds(user.id)}
                          disabled={saving}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Reset
                        </Button>
                      )}
                      <Button size="sm" onClick={() => startEditing(user)}>
                        Edit Odds
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
