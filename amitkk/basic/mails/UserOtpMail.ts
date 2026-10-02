import { sendMail } from "@amitkk/basic/utils/mailer";

interface UserOtpMailProps {
  email: string;
  otp: string;
}


export async function UserOtpMail({ email, otp }: UserOtpMailProps) {
    if (!email || !otp) { throw new Error("Email and OTP are required"); }

  const html = `
    <h2>Hi,</h2>
    <p>Your OTP is <strong>${otp}</strong></p>
  `;

  return sendMail({
    to: [email],
    subject: "OTP Generated",
    html,
    cc: [],
    bcc: [],
  });
}