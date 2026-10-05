export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const smtpUser = (process.env.SMTP_USER || 'nam050105@gmail.com').trim();
  const smtpPass = (process.env.SMTP_PASS || 'ocvypsenoiazsbbp').trim();
  const adminEmail = (process.env.ADMIN_EMAIL || smtpUser).trim();

  const isConfigured = Boolean(
    smtpUser &&
    smtpPass &&
    !smtpUser.includes('your_email') &&
    !smtpPass.includes('your_16')
  );

  res.status(200).json({
    configured: isConfigured,
    host: smtpHost,
    port: smtpPort,
    userMasked: smtpUser ? smtpUser.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
    adminEmailMasked: adminEmail ? adminEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3') : null,
    sourceFile: 'Vercel Serverless',
  });
}
