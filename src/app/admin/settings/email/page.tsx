import { SettingsForm } from '@/components/SettingsForm';

export default function EmailSettingsPage() {
  return (
    <div>
      <SettingsForm
        title="Email (Brevo)"
        description="Configure your Brevo (Sendinblue) account for transactional emails. Find your API key at brevo.com → SMTP & API → API Keys."
        fields={[
          {
            key: 'email.brevo.apiKey',
            label: 'Brevo API Key',
            type: 'password',
            placeholder: 'xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            help: 'v3 API key from your Brevo dashboard. Stored encrypted.',
          },
          {
            key: 'email.brevo.senderEmail',
            label: 'Sender Email',
            type: 'email',
            placeholder: 'no-reply@yourdomain.com',
            help: 'Must be a verified sender in Brevo, otherwise emails will be rejected.',
          },
          {
            key: 'email.brevo.senderName',
            label: 'Sender Name',
            placeholder: 'Your Company Name',
          },
        ]}
      />
      <div className="mt-6 max-w-2xl card bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2">Test your configuration</h3>
        <p className="text-sm text-slate-700 mb-3">
          After saving, send yourself a test email to verify Brevo is wired up correctly.
        </p>
        <button className="btn-secondary" disabled>Send test email (coming soon)</button>
      </div>
    </div>
  );
}
