import nodemailer from "nodemailer";

import type { EmailDeliveryDraft, RuntimeSmtpConfig } from "@threads/web-schema";
import { getRuntimeConfigSnapshot } from "./runtime-config";

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

function normalizeSmtpConfig(raw: RuntimeSmtpConfig): SmtpConfig | null {
  const host = raw.host.trim();
  const user = raw.user.trim();
  const pass = raw.pass.trim();
  const from = raw.from.trim();

  if (!host || !user || !pass || !from) {
    return null;
  }

  const port = Number.isInteger(raw.port) && raw.port > 0 ? raw.port : 587;
  const secure = raw.secure === true;

  return { host, port, secure, user, pass, from };
}

function readSmtpConfig(): SmtpConfig | null {
  return normalizeSmtpConfig(getRuntimeConfigSnapshot().smtp);
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

export async function testDeliveryEmailConfig(rawConfig: RuntimeSmtpConfig): Promise<void> {
  const config = normalizeSmtpConfig(rawConfig);
  if (!config) {
    throw new Error(
      "SMTP is not configured. Set host, user, pass, and from before testing the connection."
    );
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass }
  });

  await transporter.verify();
}
