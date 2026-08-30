import sgMail from '@sendgrid/mail';
import twilio from 'twilio';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export async function sendEmail({ to, subject, text, html }) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`[NotificationService] Email to ${to} skipped: SendGrid provider not configured.`);
    return { success: false, status: 'Provider not configured', provider: 'SendGrid' };
  }

  try {
    const msg = {
      to,
      from: 'no-reply@cartrescue.io',
      subject,
      text,
      html: html || `<p>${text}</p>`
    };
    await sgMail.send(msg);
    return { success: true, status: 'Sent', provider: 'SendGrid' };
  } catch (error) {
    console.error('[NotificationService] SendGrid Error:', error);
    return { success: false, status: `SendGrid Error: ${error.message}`, provider: 'SendGrid' };
  }
}

export async function sendSMS({ to, body }) {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.log(`[NotificationService] SMS to ${to} skipped: Twilio provider not configured.`);
    return { success: false, status: 'Provider not configured', provider: 'Twilio SMS' };
  }

  try {
    const res = await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    });
    return { success: true, status: 'Sent', sid: res.sid, provider: 'Twilio SMS' };
  } catch (error) {
    console.error('[NotificationService] Twilio SMS Error:', error);
    return { success: false, status: `Twilio Error: ${error.message}`, provider: 'Twilio SMS' };
  }
}

export async function sendWhatsApp({ to, body }) {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.log(`[NotificationService] WhatsApp to ${to} skipped: Twilio provider not configured.`);
    return { success: false, status: 'Provider not configured', provider: 'Twilio WhatsApp' };
  }

  try {
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const formattedFrom = process.env.TWILIO_PHONE_NUMBER.startsWith('whatsapp:')
      ? process.env.TWILIO_PHONE_NUMBER
      : `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;

    const res = await twilioClient.messages.create({
      body,
      from: formattedFrom,
      to: formattedTo
    });
    return { success: true, status: 'Sent', sid: res.sid, provider: 'Twilio WhatsApp' };
  } catch (error) {
    console.error('[NotificationService] Twilio WhatsApp Error:', error);
    return { success: false, status: `Twilio Error: ${error.message}`, provider: 'Twilio WhatsApp' };
  }
}
