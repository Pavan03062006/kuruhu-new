import PublicInfoPage from '@/components/public-info-page'

export default function TermsPage() {
  return (
    <PublicInfoPage eyebrow="Legal" title="Terms and conditions">
      <p>
        Use of KURUHU is restricted to authorised users performing approved duties. Your assigned role determines which
        modules, records, and actions are available.
      </p>
      <h2>Acceptable use</h2>
      <p>
        Users must keep records accurate, respect access restrictions, and verify consequential conclusions against
        original evidence and source documents.
      </p>
      <h2>Accountability</h2>
      <p>
        Actions within the workspace may be recorded in the audit trail. Unauthorised access, disclosure, or
        modification is prohibited.
      </p>
    </PublicInfoPage>
  )
}
