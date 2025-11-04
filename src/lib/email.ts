import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Reusable branded HTML email template
function renderEmailTemplate(options: {
  heading: string;
  subheading?: string;
  body: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footnote?: string;
}): string {
  const { heading, subheading, body, ctaLabel, ctaUrl, footnote } = options;
  return `
    <div style="margin:0;padding:0;background:#0b1220">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#0b1220">
        <tr>
          <td>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:640px;margin:0 auto">
              <tr>
                <td style="padding:32px 24px 12px 24px;text-align:center">
                  <div style="display:inline-block;padding:10px 14px;border:1px solid rgba(255,255,255,0.12);border-radius:10px;background:linear-gradient(180deg,rgba(124,58,237,0.12),rgba(59,130,246,0.12))">
                    <span style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-weight:700;font-size:16px;letter-spacing:0.5px;color:#ffffff">DevLink</span>
                  </div>
                  <div style="margin-top:8px;color:#9aa4b2;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px">Roblox Developer Network</div>
                </td>
              </tr>
              <tr>
                <td style="padding:24px">
                  <div style="border:1px solid rgba(255,255,255,0.08);background:#0f172a;border-radius:16px;overflow:hidden">
                    <div style="height:4px;background:linear-gradient(90deg,#7c3aed,#3b82f6)"></div>
                    <div style="padding:28px">
                      <h1 style="margin:0 0 6px 0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:22px;line-height:1.25;color:#ffffff">${heading}</h1>
                      ${subheading ? `<div style=\"margin:0 0 16px 0;color:#9aa4b2;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px\">${subheading}</div>` : ''}
                      <div style="margin:12px 0 22px 0;color:#c7d2fe;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.6">${body}</div>
                      ${ctaLabel && ctaUrl ? `
                        <div style=\"margin:22px 0 4px 0\">
                          <a href=\"${ctaUrl}\" style=\"display:inline-block;background:linear-gradient(90deg,#7c3aed,#3b82f6);color:#ffffff;text-decoration:none;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-weight:700;font-size:14px;padding:12px 18px;border-radius:10px;border:1px solid rgba(255,255,255,0.12)\">${ctaLabel}</a>
                        </div>
                        <div style=\"margin-top:12px;color:#93a4c7;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,\'Liberation Mono\',\'Courier New\',monospace;font-size:12px;word-break:break-all\">
                          <a href=\"${ctaUrl}\" style=\"color:#93c5fd;text-decoration:none\">${ctaUrl}</a>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                  <div style="color:#6b7280;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px;margin-top:16px;text-align:center">
                    ${footnote || 'If you didn\'t request this, you can safely ignore this email.'}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:12px 24px 32px 24px;text-align:center">
                  <div style="color:#6b7280;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:12px">
                    © ${new Date().getFullYear()} DevLink • <a href="${process.env.APP_URL || 'http://localhost:3457'}" style="color:#9aa4b2;text-decoration:none">Visit site</a>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:3457'}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'DevLink <noreply@devlink.com>',
    to: email,
    subject: 'Reset Your DevLink Password',
    html: renderEmailTemplate({
      heading: 'Reset your password',
      subheading: 'Securely update your DevLink account access.',
      body: 'You requested a password reset for your DevLink account. Click the button below to set a new password.',
      ctaLabel: 'Reset Password',
      ctaUrl: resetUrl,
      footnote: 'This link expires in 1 hour. If you didn\'t request this, you can ignore this email.'
    }),
    text: `
      Reset Your DevLink Password
      
      You requested to reset your password for your DevLink account. 
      Click the link below to set a new password:
      
      ${resetUrl}
      
      This link will expire in 1 hour. If you didn't request this password reset, 
      you can safely ignore this email.
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Send email change verification email
export async function sendEmailChangeVerification(newEmail: string, token: string): Promise<void> {
  const verifyUrl = `${process.env.APP_URL || 'http://localhost:3457'}/verify-email-change?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'DevLink <noreply@devlink.com>',
    to: newEmail,
    subject: 'Verify Your New Email Address - DevLink',
    html: renderEmailTemplate({
      heading: 'Verify your new email',
      subheading: 'Confirm this change to keep your account secure.',
      body: `You requested to change your DevLink email address to <strong>${newEmail}</strong>. Click the button below to verify this change.`,
      ctaLabel: 'Verify Email Address',
      ctaUrl: verifyUrl,
      footnote: 'This link expires in 24 hours. If you didn\'t request this, you can ignore this email.'
    }),
    text: `
      Verify Your New Email Address - DevLink
      
      You requested to change your email address to ${newEmail}. 
      Click the link below to verify this new email address:
      
      ${verifyUrl}
      
      This link will expire in 24 hours. If you didn't request this email change, 
      you can safely ignore this email.
    `,
  };

  await transporter.sendMail(mailOptions);
}

// Test email configuration
export async function testEmailConfiguration(): Promise<boolean> {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    console.error('Email configuration test failed:', error);
    return false;
  }
}
