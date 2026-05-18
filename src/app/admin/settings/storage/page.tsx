import { SettingsForm } from '@/components/SettingsForm';

export default function StorageSettingsPage() {
  return (
    <div>
      <SettingsForm
        title="File Storage"
        description="Choose where uploaded documents are stored. Local works for testing but is ephemeral on Railway — switch to Cloudflare R2 for production."
        fields={[
          {
            key: 'storage.provider',
            label: 'Active Provider',
            type: 'select',
            options: [
              { value: 'local', label: 'Local filesystem (testing only)' },
              { value: 'r2', label: 'Cloudflare R2' },
            ],
            help: 'Switching the provider only affects new uploads. Existing files keep working from their original location.',
          },
          {
            key: 'storage.r2.accountId',
            label: 'R2 Account ID',
            placeholder: 'e.g. abc123def456...',
            help: 'Cloudflare dashboard → R2 → top right corner.',
          },
          {
            key: 'storage.r2.accessKeyId',
            label: 'R2 Access Key ID',
            type: 'password',
            placeholder: 'xxxxxxxxxxxxxxxxxxxx',
          },
          {
            key: 'storage.r2.secretAccessKey',
            label: 'R2 Secret Access Key',
            type: 'password',
            placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            help: 'Create at: R2 → Manage R2 API Tokens → Create API Token.',
          },
          {
            key: 'storage.r2.bucket',
            label: 'R2 Bucket Name',
            placeholder: 'company-docs',
          },
          {
            key: 'storage.r2.publicUrl',
            label: 'Public URL (optional)',
            type: 'url',
            placeholder: 'https://pub-xxxxx.r2.dev or https://files.yourdomain.com',
            help: 'If your bucket has a public domain, paste it here. Leave blank to use signed URLs (more secure, expire after 1 hour).',
          },
        ]}
      />
      <div className="mt-6 max-w-2xl card bg-amber-50 border-amber-200">
        <h3 className="font-semibold mb-2">⚠️ Production note</h3>
        <p className="text-sm text-slate-700">
          Railway's filesystem is ephemeral — local files are lost on every redeploy.
          Always use R2 (or another object store) before going live.
        </p>
      </div>
    </div>
  );
}
