import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  return transporter;
}

/**
 * Sends an email using Nodemailer.
 * @param {{ to: string, subject: string, text?: string, html?: string }} options
 * @returns {Promise<{ success: boolean, messageId?: string }>}
 */
export async function sendMail({ to, subject, text = '', html = '' }) {
  try {
    const isMock = !process.env.SMTP_USER || process.env.SMTP_USER === 'test@ethereal.email';
    
    if (isMock) {
      console.log(`[EmailService - MOCK] Email would be sent to: ${to}`);
      console.log(`[EmailService - MOCK] Subject: ${subject}`);
      return { success: true, messageId: `mock-${Date.now()}` };
    }

    const info = await getTransporter().sendMail({
      from: process.env.FROM_EMAIL || '"Samadhan Setu" <noreply@samadhansetu.gov.in>',
      to,
      subject,
      text,
      html: html || text
    });

    console.log(`[EmailService] Email sent successfully to ${to}, id: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[EmailService] Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

export default {
  sendMail
};
