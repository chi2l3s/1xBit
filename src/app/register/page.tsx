"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Gift } from "lucide-react"
import { usePreferences } from "@/components/providers/PreferencesProvider"

export default function RegisterPage() {
  const router = useRouter()
  const { t } = usePreferences()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t("register.error.failed"))
        return
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t("register.error.loginFailed"))
      } else {
        router.push("/")
        router.refresh()
      }
    } catch {
      setError(t("register.error.generic"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("register.title")}</CardTitle>
          <CardDescription>
            {t("register.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
            <Gift className="h-8 w-8 text-amber-400" />
            <div>
              <p className="font-medium text-amber-400">{t("register.bonusTitle")}</p>
              <p className="text-sm text-muted-foreground">
                {t("register.bonusDesc")}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">{t("register.username")}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t("register.usernamePlaceholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("register.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("register.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("register.passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" variant="gold" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("register.creating")}
                </>
              ) : (
                t("register.submit")
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              {t("register.haveAccount")}{" "}
              <Link href="/login" className="text-primary hover:underline">
                {t("register.signIn")}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
