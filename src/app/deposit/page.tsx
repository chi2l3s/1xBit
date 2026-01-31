"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatBalance } from "@/lib/utils"
import { CreditCard, Wallet, Loader2, CheckCircle, Shield, Zap, Bitcoin, QrCode, PhoneOutgoing } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { usePreferences } from "@/components/providers/PreferencesProvider"

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000, 50000]

const PAYMENT_METHODS = [
  { id: "card", icon: CreditCard, popular: true },
  { id: "crypto", icon: Bitcoin, popular: false },
  { id: "sbp", icon: QrCode, popular: true },
]

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
      <g fill="#94a3b8" style="color:#e5e7eb">
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

export default function DepositPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { t } = usePreferences()
  const [balance, setBalance] = useState<number>(0)
  const [amount, setAmount] = useState<number>(10000)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState("card")
  const [sbpQr, setSbpQr] = useState<string | null>(null)
  const [sbpOpen, setSbpOpen] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState<number>(1000)
  const [withdrawPhone, setWithdrawPhone] = useState<string>("")
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)

  const sbpSeed = useMemo(() => `${session?.user?.id || "guest"}-${amount}-${Date.now()}`, [session?.user?.id, amount])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    fetchBalance()
  }, [])

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/user")
      if (res.ok) {
        const data = await res.json()
        setBalance(data.balance)
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error)
    }
  }

  const handleDeposit = async () => {
    if (!session || amount <= 0) return

    // For SBP we show QR first; actual debit happens after user confirms in modal
    if (selectedMethod === "sbp" && !sbpOpen) {
      const qr = makeMockQrSvg(sbpSeed)
      setSbpQr(qr)
      setSbpOpen(true)
      return
    }

    setLoading(true)
    setSuccess(false)

    try {
      const res = await fetch("/api/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, method: selectedMethod }),
      })

      const data = await res.json()

      if (res.ok) {
        setBalance(data.newBalance)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (error) {
      console.error("Deposit error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!session || withdrawAmount <= 0) return
    setWithdrawLoading(true)
    setWithdrawSuccess(false)
    try {
      const res = await fetch("/api/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: withdrawAmount, phone: withdrawPhone }),
      })
      const data = await res.json()
      if (res.ok) {
        setBalance(data.newBalance)
        setWithdrawSuccess(true)
        setTimeout(() => setWithdrawSuccess(false), 3000)
      }
    } catch (error) {
      console.error("Withdraw error:", error)
    } finally {
      setWithdrawLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-amber-500/20">
          <Wallet className="h-6 w-6 text-amber-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t("deposit.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("deposit.subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main deposit form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {t("deposit.addFunds")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Current balance */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t("deposit.balance")}</p>
                    <p className="text-3xl font-bold text-foreground">{formatBalance(balance)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-amber-400/20 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-amber-300" />
                  </div>
                </div>
              </div>

              {/* Amount input */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">{t("deposit.amount")}</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  min={1}
                  max={100000}
                  className="text-2xl font-bold h-14"
                />
                <div className="flex flex-wrap gap-2">
                  {QUICK_AMOUNTS.map((amt) => (
                    <motion.button
                      key={amt}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setAmount(amt)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        amount === amt
                          ? "bg-primary text-white"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {formatBalance(amt)}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Payment method */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">{t("deposit.selectMethod")}</Label>
                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <motion.button
                      key={method.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedMethod(method.id)}
                      className={`relative p-4 rounded-xl border-2 transition-colors text-left ${
                        selectedMethod === method.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-border/80"
                      }`}
                    >
                      {method.popular && (
                        <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
                          {t("deposit.popular")}
                        </span>
                      )}
                      <method.icon className={`h-6 w-6 mb-2 ${selectedMethod === method.id ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="font-medium">
                        {method.id === "card" && t("deposit.method.card")}
                        {method.id === "crypto" && t("deposit.method.crypto")}
                        {method.id === "sbp" && t("deposit.method.sbp")}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Success message */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400"
                  >
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <span>{t("deposit.success")} {formatBalance(amount)}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Deposit button */}
              <Button
                className="w-full h-14 text-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleDeposit}
                disabled={loading || amount <= 0}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t("deposit.processing")}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {selectedMethod === "sbp" ? <QrCode className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                    {t("deposit.depositNow")} {formatBalance(amount)}
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Card form */}
          {selectedMethod === "card" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("deposit.cardDetails")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("deposit.cardNumber")}</Label>
                  <Input
                    placeholder="4242 4242 4242 4242"
                    defaultValue="4242 4242 4242 4242"
                    className="font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("deposit.expiryDate")}</Label>
                    <Input placeholder="MM/YY" defaultValue="12/28" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("deposit.cvc")}</Label>
                    <Input placeholder="123" defaultValue="123" type="password" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedMethod === "crypto" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t("deposit.bitcoinPayment")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground mb-2">{t("deposit.sendBtc")}</p>
                  <code className="text-xs break-all bg-background p-2 rounded block">
                    bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
                  </code>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Withdraw */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneOutgoing className="h-5 w-5 text-primary" />
                {t("deposit.withdraw")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("deposit.withdrawAmount")}</Label>
                  <Input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    min={1}
                    max={balance}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("deposit.withdrawPhone")}</Label>
                  <Input
                    value={withdrawPhone}
                    onChange={(e) => setWithdrawPhone(e.target.value)}
                    placeholder="+7 (999) 123-45-67"
                  />
                </div>
              </div>

              <AnimatePresence>
                {withdrawSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400"
                  >
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <span>{t("deposit.withdrawSuccess")}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                className="w-full h-12 font-bold bg-amber-500 text-white hover:bg-amber-600"
                onClick={handleWithdraw}
                disabled={withdrawLoading || withdrawAmount <= 0 || withdrawAmount > balance}
              >
                {withdrawLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t("deposit.processing")}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <PhoneOutgoing className="h-5 w-5" />
                    {t("deposit.withdrawNow")} {formatBalance(withdrawAmount)}
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">{t("deposit.securityTitle")}</p>
                  <p className="text-xs text-muted-foreground">{t("deposit.securityDesc")}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">{t("deposit.fastTitle")}</p>
                  <p className="text-xs text-muted-foreground">{t("deposit.fastDesc")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-5 w-5 text-primary" />
                <p className="font-bold">{t("deposit.firstDepositBonus")}</p>
              </div>
              <p className="text-3xl font-black text-primary mb-2">100%</p>
              <p className="text-sm text-muted-foreground">
                {t("deposit.firstDepositBonusDesc")}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SBP QR modal */}
      <AnimatePresence>
        {sbpOpen && sbpQr && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-2xl glass border border-border/60"
            >
              <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">{t("deposit.sbpTitle")}</h2>
              </div>
              <button
                onClick={() => {
                  setSbpOpen(false)
                  setSbpQr(null)
                }}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {t("deposit.sbpClose")}
              </button>
            </div>

              <div className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-2xl bg-background border border-border/60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sbpQr} alt="SBP QR" className="h-52 w-52" />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  {t("deposit.sbpDesc")}
                </p>
                <Button
                  className="w-full h-11 font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={async () => {
                    await handleDeposit()
                    setSbpOpen(false)
                    setSbpQr(null)
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("deposit.sbpConfirming")}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      {t("deposit.sbpConfirm")}
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
