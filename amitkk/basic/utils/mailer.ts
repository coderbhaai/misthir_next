import nodemailer from "nodemailer";

const isProd = process.env.NODE_ENV === "production";

const prefix = isProd ? "MAIL_PROD" : "MAIL_DEV";

export const transporter = nodemailer.createTransport({
  host: process.env[`${prefix}_HOST`]!,
  port: Number(process.env[`${prefix}_PORT`]) || 2525,
  secure: isProd,
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
}

export async function sendMail({ to, subject, html, cc, bcc }: MailProps) {
  return transporter.sendMail({ from: `"My App" <no-reply@myapp.com>`, to, subject, html, cc, bcc });
}