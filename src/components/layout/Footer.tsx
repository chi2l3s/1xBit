import Link from "next/link"
import { Shield, Mail, Globe, Award, FileText, Scale } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-gradient-dark mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-blue flex items-center justify-center">
                <span className="text-sm font-black text-white">1x</span>
              </div>
              <span className="font-bold">1xBit</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              1xBit Entertainment Sp. z o.o. is a registered company operating under Polish law, providing premium online gaming services to customers worldwide.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span>Licensed & Regulated</span>
            </div>
          </div>

          {/* Legal Documents */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Legal Documents
            </h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  AML/KYC Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Responsible Gaming
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Licensing */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Scale className="h-4 w-4 text-primary" />
              Licensing & Compliance
            </h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="font-medium text-foreground mb-1">Gaming License</p>
                <p>License No: MGA/B2C/394/2024</p>
                <p>Issued by: Malta Gaming Authority</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <p className="font-medium text-foreground mb-1">Registration</p>
                <p>KRS: 0000892451</p>
                <p>NIP: 5272987634</p>
                <p>REGON: 388654219</p>
              </div>
            </div>
          </div>

          {/* Contact & Certifications */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Certifications
            </h3>
            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-muted/30 border border-border/50 text-xs">
                <span className="text-green-400">✓</span> SSL Secured
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-muted/30 border border-border/50 text-xs">
                <span className="text-green-400">✓</span> RNG Certified
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-muted/30 border border-border/50 text-xs">
                <span className="text-green-400">✓</span> eCOGRA
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-muted/30 border border-border/50 text-xs">
                <span className="text-green-400">✓</span> iTech Labs
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <h4 className="text-xs font-medium">Contact</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>support@1xbit.com</span>
              </div>
              <p className="text-xs text-muted-foreground">
                ul. Grzybowska 87, 00-844 Warsaw, Poland
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>© {new Date().getFullYear()} 1xBit Entertainment Sp. z o.o.</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">All rights reserved</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-xs">
                <Shield className="h-3 w-3 text-green-400" />
                <span className="text-green-400 font-medium">Verified Operator</span>
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-mono">v2.4.1</span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-[10px] text-muted-foreground/60 text-center md:text-left leading-relaxed">
            Gambling can be addictive. Play responsibly. Players must be 18+ years of age.
            1xBit promotes responsible gambling and provides tools for self-exclusion and deposit limits.
            If you or someone you know has a gambling problem, please contact your local support services.
          </p>
        </div>
      </div>
    </footer>
  )
}
