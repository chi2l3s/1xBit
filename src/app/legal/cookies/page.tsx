import LegalDocument from "../LegalDocument"

export default function CookiesPage() {
  return (
    <LegalDocument
      title="Cookie Policy"
      updatedAt="2025-02-04"
      intro={[
        "This cookie policy template must be tailored to your tracking technologies.",
        "It does not constitute legal advice and requires review by counsel.",
      ]}
      sections={[
        {
          title: "1. What are cookies",
          body: [
            "Cookies are small text files stored on your device to enable functionality and analytics.",
            "We may also use similar technologies such as pixels or SDKs.",
          ],
        },
        {
          title: "2. Categories",
          body: [
            "Strictly necessary cookies enable core site features.",
            "Performance, analytics, and marketing cookies are optional and require consent where applicable.",
          ],
        },
        {
          title: "3. Managing preferences",
          body: [
            "You can manage cookie preferences via your browser settings.",
            "Consent management tools should be integrated as required by law.",
          ],
        },
      ]}
    />
  )
}
