import PublicInfoPage from '@/components/public-info-page'

export default function PrivacyPage() {
  return (
    <PublicInfoPage eyebrow="Legal" title="Privacy policy">
      <p>
        KURUHU limits access to authorised personnel and applies role-based controls to case, person, and investigative
        information.
      </p>
      <h2>Information handling</h2>
      <p>
        Access, searches, record views, and material changes may be logged for security and accountability. Information
        should only be used for authorised operational purposes.
      </p>
      <h2>Your responsibility</h2>
      <p>
        Do not share credentials, export restricted information without approval, or rely on AI-generated findings
        without checking the cited source records.
      </p>
    </PublicInfoPage>
  )
}
