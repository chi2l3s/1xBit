import LegalDocument from "../LegalDocument"

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms & Conditions"
      updatedAt="2025-02-04"
      intro={[
        "This document is a template and must be reviewed by qualified legal counsel before use.",
        "It does not constitute legal advice and may require updates to be legally enforceable in your jurisdiction.",
      ]}
      sections={[
        {
          title: "1. Scope of the agreement",
          body: [
            "These Terms govern access to and use of the 1xBit platform, including account registration, gameplay, deposits, and withdrawals.",
            "By accessing the platform, you agree to comply with all applicable laws and the terms outlined herein.",
          ],
        },
        {
          title: "2. Eligibility",
          body: [
            "Users must be of legal age for online gaming in their jurisdiction.",
            "You are responsible for ensuring that online gaming is lawful where you reside.",
          ],
        },
        {
          title: "3. Account responsibilities",
          body: [
            "You must provide accurate information and keep your account credentials secure.",
            "We may suspend accounts for suspected fraud, abuse, or violation of these Terms.",
          ],
        },
        {
          title: "4. Payments, bonuses, and withdrawals",
          body: [
            "All deposits and withdrawals are subject to verification and anti-fraud checks.",
            "Bonus eligibility and wagering requirements are defined in promotional rules.",
          ],
        },
        {
          title: "5. Dispute resolution",
          body: [
            "Disputes should be submitted to support for investigation and resolution.",
            "Governing law and venue must be defined by legal counsel before publication.",
          ],
        },
      ]}
    />
  )
}
