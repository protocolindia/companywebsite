import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ============ Admin user ============
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  // ============ Sample services ============
  const services = [
    {
      slug: 'pvt-ltd',
      name: 'Private Limited Company Registration',
      description: 'Register your business as a Private Limited Company. Includes DIN, DSC, name approval, MOA/AOA, and Certificate of Incorporation.',
      price: 999900, // ₹9,999
      durationDays: 15,
      requirements: [
        { name: 'PAN Card (all directors)', isRequired: true, order: 1 },
        { name: 'Aadhaar Card (all directors)', isRequired: true, order: 2 },
        { name: 'Passport-size Photograph', isRequired: true, order: 3 },
        { name: 'Address Proof (Bank Statement / Utility Bill)', isRequired: true, order: 4 },
        { name: 'Registered Office Proof', isRequired: true, order: 5 },
        { name: 'NOC from Property Owner', isRequired: false, order: 6 },
      ],
    },
    {
      slug: 'llp',
      name: 'LLP Registration',
      description: 'Limited Liability Partnership registration with MCA. Includes DPIN, DSC, name approval, and LLP agreement.',
      price: 799900,
      durationDays: 12,
      requirements: [
        { name: 'PAN Card (all partners)', isRequired: true, order: 1 },
        { name: 'Aadhaar Card (all partners)', isRequired: true, order: 2 },
        { name: 'Address Proof', isRequired: true, order: 3 },
        { name: 'Registered Office Proof', isRequired: true, order: 4 },
      ],
    },
    {
      slug: 'gst-registration',
      name: 'GST Registration',
      description: 'New GST registration for businesses with turnover above threshold or voluntary registration.',
      price: 199900,
      durationDays: 7,
      requirements: [
        { name: 'PAN Card', isRequired: true, order: 1 },
        { name: 'Aadhaar Card', isRequired: true, order: 2 },
        { name: 'Business Address Proof', isRequired: true, order: 3 },
        { name: 'Bank Account Details / Cancelled Cheque', isRequired: true, order: 4 },
      ],
    },
  ];

  for (const s of services) {
    const { requirements, ...serviceData } = s;
    const service = await prisma.service.upsert({
      where: { slug: serviceData.slug },
      update: {},
      create: serviceData,
    });
    for (const req of requirements) {
      await prisma.documentRequirement.create({
        data: { ...req, serviceId: service.id },
      });
    }
  }

  // ============ Email templates ============
  const templates = [
    {
      key: 'welcome',
      subject: 'Welcome to {{appName}}',
      bodyHtml: '<p>Hi {{name}},</p><p>Thanks for signing up. You can now apply for any of our services.</p>',
    },
    {
      key: 'application_submitted',
      subject: 'Application {{refNo}} received',
      bodyHtml: '<p>Hi {{name}},</p><p>We have received your application <b>{{refNo}}</b> for {{serviceName}}. Our team will review your documents and get back to you.</p>',
    },
    {
      key: 'document_rejected',
      subject: 'Action needed: Document on application {{refNo}}',
      bodyHtml: '<p>Hi {{name}},</p><p>The document <b>{{docName}}</b> on application <b>{{refNo}}</b> needs to be re-uploaded.</p><p><b>Reason:</b> {{reason}}</p><p><a href="{{appUrl}}/application/{{appId}}">Open application</a></p>',
    },
    {
      key: 'document_approved',
      subject: 'Document approved on {{refNo}}',
      bodyHtml: '<p>Hi {{name}},</p><p>Your document <b>{{docName}}</b> has been approved.</p>',
    },
    {
      key: 'application_approved',
      subject: 'Application {{refNo}} approved',
      bodyHtml: '<p>Hi {{name}},</p><p>Great news — your application <b>{{refNo}}</b> has been approved and is being filed.</p>',
    },
    {
      key: 'application_completed',
      subject: 'Application {{refNo}} completed',
      bodyHtml: '<p>Hi {{name}},</p><p>Your application <b>{{refNo}}</b> is complete. Documents are available in your dashboard.</p>',
    },
    {
      key: 'application_rejected',
      subject: 'Application {{refNo}} update',
      bodyHtml: '<p>Hi {{name}},</p><p>Your application <b>{{refNo}}</b> could not be processed.</p><p><b>Reason:</b> {{reason}}</p>',
    },
  ];

  for (const t of templates) {
    await prisma.emailTemplate.upsert({
      where: { key: t.key },
      update: {},
      create: t,
    });
  }

  // ============ Default settings (placeholders) ============
  const defaultSettings = [
    { key: 'storage.provider', value: 'local', isSecret: false },
    { key: 'storage.r2.accountId', value: '', isSecret: true },
    { key: 'storage.r2.accessKeyId', value: '', isSecret: true },
    { key: 'storage.r2.secretAccessKey', value: '', isSecret: true },
    { key: 'storage.r2.bucket', value: '', isSecret: false },
    { key: 'storage.r2.publicUrl', value: '', isSecret: false },
    { key: 'email.brevo.apiKey', value: '', isSecret: true },
    { key: 'email.brevo.senderEmail', value: 'no-reply@example.com', isSecret: false },
    { key: 'email.brevo.senderName', value: 'Company Registration', isSecret: false },
    { key: 'app.name', value: 'Company Registration Services', isSecret: false },
    { key: 'app.supportEmail', value: 'support@example.com', isSecret: false },
  ];

  for (const s of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log('✅ Seed complete. Admin: admin@example.com / admin123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
