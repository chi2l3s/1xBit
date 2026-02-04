import LegalDocument from "../LegalDocument"

export default function ResponsibleGamingPage() {
  return (
    <LegalDocument
      title="Responsible Gaming"
      updatedAt="2025-02-04"
      intro={[
        "This document is a template and must be reviewed by legal and responsible gaming specialists.",
        "It does not constitute legal advice or regulatory guidance.",
      ]}
      sections={[
        {
          title: "1. Our commitment",
          body: [
            "We promote responsible gaming and provide tools to help players manage their activity.",
            "Support resources and self-exclusion options are available upon request.",
          ],
        },
        {
          title: "2. Player tools",
          body: [
            "Deposit limits, cooling-off periods, and self-exclusion mechanisms can be configured.",
            "Account checks may be applied to prevent underage access.",
          ],
        },
        {
          title: "3. Support",
          body: [
            "We recommend contacting professional support organizations if gambling becomes problematic.",
            "Local resources should be listed here by compliance counsel.",
          ],
        },
      ]}
    />
  )
}
