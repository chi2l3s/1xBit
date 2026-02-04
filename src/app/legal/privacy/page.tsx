import LegalDocument from "../LegalDocument"

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      updatedAt="2025-02-04"
      intro={[
        "This privacy policy is a template and must be adapted to your data processing activities.",
        "It does not constitute legal advice and should be reviewed by qualified counsel.",
      ]}
      sections={[
        {
          title: "1. Data we collect",
          body: [
            "Account data, identity verification details, transaction history, and technical metadata.",
            "We may also process device identifiers, IP addresses, and gameplay analytics.",
          ],
        },
        {
          title: "2. How we use data",
          body: [
            "To provide services, comply with legal obligations, prevent fraud, and improve gameplay.",
            "To communicate service updates and security notices.",
          ],
        },
        {
          title: "3. Legal basis",
          body: [
            "Processing is performed based on contractual necessity, legal obligations, and legitimate interests.",
            "You may withdraw consent where applicable, subject to legal constraints.",
          ],
        },
        {
          title: "4. Data retention",
          body: [
            "We retain data for as long as required by law or as necessary to provide services.",
            "Retention periods must be specified by legal counsel before publication.",
          ],
        },
        {
          title: "5. Your rights",
          body: [
            "You may request access, correction, deletion, or portability of your personal data.",
            "Contact support to exercise your rights in accordance with applicable law.",
          ],
        },
      ]}
    />
  )
}
