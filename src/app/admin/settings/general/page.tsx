import { SettingsForm } from '@/components/SettingsForm';

export default function GeneralSettingsPage() {
  return (
    <SettingsForm
      title="General Settings"
      description="Basic application information displayed across the site and in emails."
      fields={[
        { key: 'app.name', label: 'Application Name', placeholder: 'e.g. Acme Compliance Services' },
        { key: 'app.url', label: 'Public Site URL', type: 'url', placeholder: 'https://yourdomain.com' },
        { key: 'app.supportEmail', label: 'Support Email', type: 'email', placeholder: 'support@yourdomain.com' },
      ]}
    />
  );
}
