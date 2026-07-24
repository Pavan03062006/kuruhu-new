import PublicInfoPage from '@/components/public-info-page'

export default function SupportPage() {
  return (
    <PublicInfoPage eyebrow="Help centre" title="KURUHU support">
      <p>
        For account access, workflow, or permissions assistance, contact your workspace administrator or departmental
        technical support team.
      </p>
      <h2>Before requesting help</h2>
      <p>
        Record the page you were using, the approximate time, and any visible error message. Do not include passwords,
        OTPs, or restricted case information.
      </p>
      <h2>Urgent access issues</h2>
      <p>
        If an operational task is blocked, use your organisation’s approved escalation channel and reference your user
        role and station.
      </p>
    </PublicInfoPage>
  )
}
