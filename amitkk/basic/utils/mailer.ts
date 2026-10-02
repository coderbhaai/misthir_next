import nodemailer, { SendMailOptions } from "nodemailer";

const prefix = "MAIL_PROD";
const port = Number(process.env[`${prefix}_PORT`]) || 2525;

export const transporter = nodemailer.createTransport({
  host: process.env[`${prefix}_HOST`]!,
  port,
  secure: port === 465,
  auth: {
    user: process.env[`${prefix}_USER`]!,
    pass: process.env[`${prefix}_PASS`]!,
  },
});

export interface MailProps{
    to: string[]; 
    subject: string;
    html: string;
    cc?: string[];
    bcc?: string[];
    attachments?: MailAttachment | MailAttachment[] | null;
}

export interface MailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

export async function sendMail({ to, subject, html, cc, bcc, attachments = null }: MailProps) {
  let normalizedAttachments: SendMailOptions["attachments"] | undefined;
  if (attachments) {
    normalizedAttachments = Array.isArray(attachments) ? attachments : [attachments];
  }

  return transporter.sendMail({ 
    from: `"AMITKK"<amit@amitkk.com>`, 
    to,
    subject,
    html,
    cc: cc && cc.length > 0 ? cc : undefined,
    bcc: bcc && bcc.length > 0 ? bcc : undefined,
    attachments: normalizedAttachments,
  });
}

export async function testSMTPConnection() {
  try {
    const host = process.env[`${prefix}_HOST`];
    const port = process.env[`${prefix}_PORT`];
    const user = process.env[`${prefix}_USER`];
    const pass = process.env[`${prefix}_PASS`];

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user,
        pass,
      },
      logger: true,
      debug: true,
    });
    await transporter.verify();

    return {
      success: true,
      message: "SMTP connection successful",
    };
  } catch (error: any) {
    console.error("❌ SMTP connection failed", error);

    return {
      success: false,
      error: error.message,
      fullError: error,
    };
  }
}