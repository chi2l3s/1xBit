"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { usePreferences } from "@/components/providers/PreferencesProvider"
import { formatBalance } from "@/lib/utils"
import { QrCode } from "lucide-react"

const AUTO_REDIRECT_MS = 10000

function makeMockQrSvg(seed: string, size = 220) {
  // Pseudo-QR: deterministic random blocks based on a seed hash (visual only)
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  const rand = () => {
    h += 0x6D2B79F5
    let t = Math.imul(h ^ (h >>> 15), 1 | h)
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const cells = 29
  const pad = 10
  const cell = Math.floor((size - pad * 2) / cells)
  const w = pad * 2 + cell * cells

  const blocks: string[] = []
  const isFinder = (x: number, y: number) => {
    const inTL = x < 7 && y < 7
    const inTR = x >= cells - 7 && y < 7
    const inBL = x < 7 && y >= cells - 7
    return inTL || inTR || inBL
  }

  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      if (isFinder(x, y)) continue
      const r = rand()
      if (r > 0.62) {
        blocks.push(`<rect x="${pad + x * cell}" y="${pad + y * cell}" width="${cell}" height="${cell}" rx="2" />`)
      }
    }
  }

  const finder = (fx: number, fy: number) => {
    const x = pad + fx * cell
    const y = pad + fy * cell
    const s = cell * 7
    const inner = cell * 5
    const dot = cell * 3
    return `
      <rect x="${x}" y="${y}" width="${s}" height="${s}" rx="8" fill="none" stroke="currentColor" stroke-width="${Math.max(2, Math.floor(cell / 2))}" />
      <rect x="${x + cell}" y="${y + cell}" width="${inner}" height="${inner}" rx="6" fill="none" stroke="currentColor" stroke-width="${Math.max(2, Math.floor(cell / 2))}" />
      <rect x="${x + cell * 2}" y="${y + cell * 2}" width="${dot}" height="${dot}" rx="6" fill="currentColor" />
    `
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w}" viewBox="0 0 ${w} ${w}">
      <rect x="0" y="0" width="${w}" height="${w}" rx="20" fill="rgba(0,0,0,0)" />
      <g fill="#0f172a" style="color:#0f172a">
        ${finder(0, 0)}
        ${finder(cells - 7, 0)}
        ${finder(0, cells - 7)}
        ${blocks.join("")}
      </g>
    </svg>
  `
  const encoded = encodeURIComponent(svg).replace(/%20/g, " ")
  return `data:image/svg+xml;charset=utf-8,${encoded}`
}

export default function SbpPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const { t } = usePreferences()
  const hasProcessed = useRef(false)
  const amountParam = searchParams.get("amount")
  const amount = Number(amountParam ?? 0)
  const hasAmount = Number.isFinite(amount) && amount > 0
  const [isProcessing, setIsProcessing] = useState(false)

  const qrCode = useMemo(() => {
    const seed = `${session?.user?.id ?? "guest"}-${hasAmount ? amount : "default"}`
    return makeMockQrSvg(seed)
  }, [session?.user?.id, amount, hasAmount])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated" || !hasAmount || hasProcessed.current) return
    hasProcessed.current = true
    const runDeposit = async () => {
      setIsProcessing(true)
      try {
        await fetch("/api/deposit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, method: "sbp" }),
        })
      } catch (error) {
        console.error("SBP deposit error:", error)
      } finally {
        setIsProcessing(false)
      }
    }
    runDeposit()
  }, [status, amount, hasAmount])

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/")
    }, AUTO_REDIRECT_MS)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.18),_transparent_60%)]" />
      <div className="relative max-w-6xl mx-auto px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-center">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">{t("sbp.scanTitle")}</p>
                <p className="text-xl font-semibold">{t("sbp.subtitle")}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/20">
                <QrCode className="h-6 w-6 text-emerald-200" />
              </div>
            </div>
            <div className="mt-8 flex items-center justify-center">
              <div className="rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.45)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrCode} alt="SBP QR" className="h-56 w-56" />
              </div>
            </div>
            <p className="mt-6 text-sm text-white/70">{t("sbp.scanSubtitle")}</p>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.4em] text-white/70">
              SBP
            </div>
            <h1 className="text-3xl font-semibold md:text-4xl">{t("sbp.title")}</h1>
            <p className="text-base text-white/70">{t("sbp.subtitle")}</p>
            {hasAmount && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">{t("common.total")}</p>
                <p className="text-2xl font-semibold">{formatBalance(amount)}</p>
              </div>
            )}
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">{t("sbp.redirectLabel")}</p>
              <p className="text-sm text-white/70">{t("sbp.redirectHint")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Button
                className="h-12 rounded-full bg-emerald-500 px-6 text-base font-semibold text-slate-900 hover:bg-emerald-400"
                onClick={() => router.push("/")}
              >
                {t("sbp.backHome")}
              </Button>
              <span className="text-xs text-white/60">
                {isProcessing ? t("common.loading") : t("sbp.scanSubtitle")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
