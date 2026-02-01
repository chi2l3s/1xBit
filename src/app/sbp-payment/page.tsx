"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, QrCode, Timer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { usePreferences } from "@/components/providers/PreferencesProvider"

const REDIRECT_SECONDS = 10

const QR_PATTERN = [
  "111111101010111111",
  "100000101101100001",
  "101110101000101101",
  "101110101110101101",
  "101110100011101101",
  "100000101010100001",
  "111111101010111111",
  "000000000000000000",
  "110011100001110110",
  "001101011110010011",
  "110100110001101100",
  "011011001011010010",
  "101100101110001011",
  "000000000000000000",
  "111111100100111111",
  "100000101111100001",
  "101110100010101101",
  "100000101101100001",
  "111111101001111111",
]

export default function SbpPaymentPage() {
  const { t } = usePreferences()
  const router = useRouter()
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS)

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1))
    }, 1000)

    const timeout = setTimeout(() => {
      router.push("/")
    }, REDIRECT_SECONDS * 1000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [router])

  const rows = useMemo(() => QR_PATTERN.map((row) => row.split("")), [])

  return (
    <div className="relative min-h-[70vh] overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-rose-200/40 via-purple-200/30 to-slate-100/30 p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(244,114,182,0.35),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(248,113,113,0.25),transparent_55%)]" />

      <div className="relative mx-auto flex max-w-5xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/60 shadow-lg">
              <QrCode className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("sbp.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("sbp.subtitle")}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => router.push("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("sbp.backHome")}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <Card className="relative overflow-hidden border-0 bg-white/70 p-6 shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-[28px] bg-white p-6 shadow-[inset_0_2px_6px_rgba(255,255,255,0.8),inset_0_-8px_12px_rgba(15,23,42,0.12)]">
                <div className="grid grid-cols-[repeat(18,10px)] gap-[2px] bg-white p-2">
                  {rows.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`h-2.5 w-2.5 rounded-[2px] ${cell === "1" ? "bg-slate-800" : "bg-white"}`}
                      />
                    ))
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-lg font-semibold">{t("sbp.scanTitle")}</p>
                <p className="text-sm text-muted-foreground">{t("sbp.scanSubtitle")}</p>
              </div>
            </div>
          </Card>

          <Card className="border-0 bg-white/60 p-6 shadow-[0_20px_40px_rgba(15,23,42,0.1)]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Timer className="h-4 w-4 text-purple-500" />
                {t("sbp.redirectLabel")}
              </div>
              <motion.div
                key={secondsLeft}
                initial={{ scale: 1.1, opacity: 0.7 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-black text-purple-500"
              >
                {secondsLeft}s
              </motion.div>
              <div className="rounded-2xl bg-white/70 p-4 text-sm text-muted-foreground">
                {t("sbp.redirectHint")}
              </div>
              <Button className="w-full" onClick={() => router.push("/")}>
                {t("sbp.backHome")}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
