/**
 * Cloudflare Pages Function — POST /api/contact
 *
 * Receives contact-form submissions and forwards them to Telegram (preferred,
 * matches our ops setup) or Resend, depending on which env vars are set.
 *
 * Configure in the Cloudflare Pages project (Settings → Variables):
 *   TELEGRAM_BOT_TOKEN   + TELEGRAM_CHAT_ID     → deliver to Telegram
 *   RESEND_API_KEY       + CONTACT_TO_EMAIL     → deliver by email (fallback)
 *   (optional) CONTACT_FROM_EMAIL              → verified Resend sender
 *
 * If none are set the endpoint accepts the message and returns 200 so the site
 * still works in preview; it just logs that delivery was skipped.
 */

interface Env {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
  RESEND_API_KEY?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_FROM_EMAIL?: string;
}

type PagesContext = {
  request: Request;
  env: Env;
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const clean = (v: unknown, max = 4000) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const emailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  const { request, env } = context;

  // guard against oversized bodies
  const len = Number(request.headers.get('content-length') ?? '0');
  if (len > 20_000) return json({ error: 'Payload too large' }, 413);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  // honeypot: real users leave this empty
  if (clean(body.company_url)) return json({ ok: true });

  const name = clean(body.name, 200);
  const email = clean(body.email, 320);
  const message = clean(body.message, 4000);

  if (!name || !email || !message || !emailValid(email)) {
    return json({ error: 'Missing or invalid fields' }, 422);
  }

  const lines = [
    '💼 New bekhruz.info message',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    '',
    message,
  ].join('\n');

  try {
    // Preferred: Telegram
    if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID) {
      const tg = await fetch(
        `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: env.TELEGRAM_CHAT_ID,
            text: lines,
            disable_web_page_preview: true,
          }),
        }
      );
      if (!tg.ok) throw new Error(`Telegram ${tg.status}`);
      return json({ ok: true });
    }

    // Fallback: Resend
    if (env.RESEND_API_KEY && env.CONTACT_TO_EMAIL) {
      const rs = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.CONTACT_FROM_EMAIL || 'bekhruz.info <onboarding@resend.dev>',
          to: [env.CONTACT_TO_EMAIL],
          reply_to: email,
          subject: `New message from ${name}`,
          html: `<div style="font-family:system-ui,sans-serif;line-height:1.6">
            <h2 style="margin:0 0 12px">New bekhruz.info message</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}<br/>
            <strong>Email:</strong> ${escapeHtml(email)}</p>
            <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
          </div>`,
        }),
      });
      if (!rs.ok) throw new Error(`Resend ${rs.status}`);
      return json({ ok: true });
    }

    // Nothing configured yet — accept so the UI works, but flag it in logs.
    console.log('[contact] no delivery configured; message dropped:', lines);
    return json({ ok: true, delivered: false });
  } catch (err) {
    console.error('[contact] delivery failed:', err);
    return json({ error: 'Delivery failed' }, 502);
  }
};
