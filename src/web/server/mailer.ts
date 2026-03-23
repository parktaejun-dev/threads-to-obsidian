import nodemailer from "nodemailer";

import type { EmailDeliveryDraft } from "../lib/schema";

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

function readSmtpConfig(): SmtpConfig | null {
  const host = process.env.THREADS_SMTP_HOST?.trim();
  const user = process.env.THREADS_SMTP_USER?.trim();
  const pass = process.env.THREADS_SMTP_PASS?.trim();
  const from = process.env.THREADS_SMTP_FROM?.trim();

  if (!host || !user || !pass || !from) {
    return null;
  }

  const portRaw = process.env.THREADS_SMTP_PORT?.trim();
  const port = portRaw ? Number.parseInt(portRaw, 10) : 587;
  const secure = process.env.THREADS_SMTP_SECURE?.trim().toLowerCase() === "true";

  return { host, port, secure, user, pass, from };
}

export function isMailerConfigured(): boolean {
  return readSmtpConfig() !== null;
}

export async function sendDeliveryEmail(draft: EmailDeliveryDraft): Promise<void> {
  const config = readSmtpConfig();
  if (!config) {
    throw new Error(
      "SMTP is not configured. Set THREADS_SMTP_HOST, THREADS_SMTP_USER, THREADS_SMTP_PASS, THREADS_SMTP_FROM."
    );
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass }
  });

  await transporter.sendMail({
    from: config.from,
    to: draft.to,
    subject: draft.subject,
    text: draft.body
  });
}
