import { cn } from "@/lib/utils"

type LegalSection = {
  title: string
  body: string[]
}

type LegalDocumentProps = {
  title: string
  updatedAt: string
  intro: string[]
  sections: LegalSection[]
}

export default function LegalDocument({ title, updatedAt, intro, sections }: LegalDocumentProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Legal documents</p>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">Last updated: {updatedAt}</p>
      </header>

      <section className="rounded-2xl border border-border/60 bg-muted/20 p-6 space-y-3">
        {intro.map((line, index) => (
          <p key={line} className={cn("text-sm text-muted-foreground", index === 0 && "text-foreground")}>
            {line}
          </p>
        ))}
      </section>

      <div className="space-y-6">
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
