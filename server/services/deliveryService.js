const sendEmail = async ({ to, subject, text }) => {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM || !to) return { channel: 'email', status: 'skipped' };
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject, text }),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
  return { channel: 'email', status: 'sent' };
};

const sendSms = async ({ to, text }) => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER || !to) return { channel: 'sms', status: 'skipped' };
  const body = new URLSearchParams({ To: to, From: TWILIO_FROM_NUMBER, Body: text });
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
  if (!response.ok) throw new Error(`SMS provider returned ${response.status}`);
  return { channel: 'sms', status: 'sent' };
};

const deliverReminder = async ({ email, phone, subject, text }) => {
  const results = await Promise.allSettled([
    sendEmail({ to: email, subject, text }),
    sendSms({ to: phone, text }),
  ]);
  return results.map((result) => result.status === 'fulfilled'
    ? result.value
    : ({ status: 'failed', error: result.reason.message }));
};

module.exports = { sendEmail, sendSms, deliverReminder };
