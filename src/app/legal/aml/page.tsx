import LegalDocument from "../LegalDocument"

export default function AmlPage() {
  return (
    <LegalDocument
      title="AML & KYC Policy"
      updatedAt="2025-02-04"
      intro={[
        "This AML/KYC policy template must be tailored to your licensing and regulatory obligations.",
        "It does not constitute legal advice and should be validated by compliance counsel.",
      ]}
      sections={[
        {
          title: "1. Purpose",
          body: [
            "We are committed to preventing money laundering, terrorism financing, and fraud.",
            "We apply risk-based controls aligned with regulatory expectations.",
          ],
        },
        {
          title: "2. Customer verification",
          body: [
            "We may request identity documents and proof of address before processing withdrawals.",
            "Enhanced due diligence may be required for higher-risk cases.",
          ],
        },
        {
          title: "3. Monitoring",
          body: [
            "We monitor transactions for suspicious patterns and may request source-of-funds information.",
            "Suspicious activity reports are handled according to legal requirements.",
          ],
        },
        {
          title: "4. Restrictions",
          body: [
            "We may suspend or close accounts that fail verification or breach AML rules.",
            "Jurisdictional restrictions must be defined by legal counsel.",
          ],
        },
      ]}
    />
  )
}
