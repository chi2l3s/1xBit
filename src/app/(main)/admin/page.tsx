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
import { usePreferences } from "@/components/providers/PreferencesProvider"

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

const MODE_CONFIG: Record<OddsMode, { labelKey: "admin.mode.normal" | "admin.mode.alwaysWin" | "admin.mode.alwaysLose" | "admin.mode.custom"; icon: React.ReactNode; color: string }> = {
  normal: { labelKey: "admin.mode.normal", icon: <Minus className="w-4 h-4" />, color: "bg-gray-500" },
  always_win: { labelKey: "admin.mode.alwaysWin", icon: <TrendingUp className="w-4 h-4" />, color: "bg-green-500" },
  always_lose: { labelKey: "admin.mode.alwaysLose", icon: <TrendingDown className="w-4 h-4" />, color: "bg-red-500" },
  custom: { labelKey: "admin.mode.custom", icon: <Sparkles className="w-4 h-4" />, color: "bg-purple-500" },
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = usePreferences()
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
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 flex items-center justify-center shadow-lg shadow-black/20">
          <Shield className="w-7 h-7 text-rose-200" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("admin.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("admin.subtitle")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            {t("admin.users")} ({users.length})
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
                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-200 font-bold">
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
                    <p className="text-lg font-bold text-amber-300">
                      {formatBalance(user.balance)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user._count.gameHistory} {t("admin.gamesPlayed")}
                    </p>
                  </div>
                </div>

                {editingUser === user.id ? (
                  <div className="p-4 rounded-lg bg-background/50 border border-border space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t("admin.balance")}</label>
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
                        <label className="text-sm font-medium mb-2 block">{t("admin.winRate")}</label>
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
                      <label className="text-sm font-medium mb-2 block">{t("admin.oddsMode")}</label>
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
                              <span className="text-xs font-medium">{t(config.labelKey)}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={cancelEditing} disabled={saving}>
                        {t("admin.cancel")}
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
                        {t("admin.save")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{t("admin.currentMode")}</span>
                      {user.odds ? (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                            MODE_CONFIG[user.odds.mode as OddsMode]?.color || "bg-gray-500"
                          }`}
                        >
                          {t(MODE_CONFIG[user.odds.mode as OddsMode]?.labelKey || "admin.mode.normal")}
                          {user.odds.mode === "custom" && ` (${user.odds.winRate}%)`}
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-gray-500">
                          {t("admin.mode.normal")}
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
                          {t("admin.reset")}
                        </Button>
                      )}
                      <Button size="sm" onClick={() => startEditing(user)}>
                        {t("admin.adjustBalance")}
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
