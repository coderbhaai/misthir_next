import { sendMail } from "@amitkk/basic/utils/mailer";
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { MailSignature } from "./MailSignature";
import { logError } from "pages/api/utils";

interface ContactMailData {
  name: string;
  email: string;
  phone?: string;
  user_remarks?: string;
  admin_remarks?: string;
  createdAt?: Date;
}

export async function ContactFormMail(contact_id: string) {
  if (!contact_id) throw new Error("contact_id is required");
  let data: ContactMailData | null = null;
  
  const subject = "Thank you for Connecting with AMITKK";
  const cc = ["amit@amitkk.com"];

  try {
    const res = await apiRequest("POST", "basic/basic", {
      function: "get_single_contact",
      id: contact_id,
    });

    data = res?.data as ContactMailData;
  } catch (error) { await logError(error, { function: "ContactFormMail", payload: {contact_id} }); }

  if (!data) { throw new Error("Contact data missing after API call"); }

  const phoneWithCode = [ data.phone ].filter(Boolean).join(" ");

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#f4f6f8; padding:24px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden;">

      <div style="background:#111827; padding:16px 24px;">
        <h2 style="color:#ffffff; margin:0;">📩 Contact Form Submission</h2>
      </div>

      <div style="padding:24px; color:#111827;">
        <p>Hi <strong>${data.name}</strong>,</p>
        <p>Thank you for contacting us. We've received your message and our team will get back to you shortly.</p>

        <div style="border:1px solid #e5e7eb; border-radius:6px; padding:16px; margin:24px 0;">
          <h3 style="margin-top:0; font-size:16px;">Submitted Details</h3>

          <table style="width:100%; font-size:14px;">
            <tr>
              <td style="color:#6b7280;">Name</td>
              <td><strong>${data.name}</strong></td>
            </tr>
            <tr>
              <td style="color:#6b7280;">Email</td>
              <td>${data.email}</td>
            </tr>
            ${
              phoneWithCode
                ? `<tr>
                    <td style="color:#6b7280;">Phone</td>
                    <td>${phoneWithCode}</td>
                  </tr>`
                : ""
            }
            ${
              data.createdAt
                ? `<tr>
                    <td style="color:#6b7280;">Submitted On</td>
                    <td>${new Date(data.createdAt).toLocaleString()}</td>
                  </tr>`
                : ""
            }
          </table>
        </div>

        ${
          data.user_remarks
            ? `
            <div style="margin-bottom:24px;">
              <h3 style="font-size:16px;">Your Message</h3>
              <div style="background:#f9fafb; padding:12px; border-radius:6px; font-size:14px;">${data.user_remarks}</div>
            </div>
          `
            : ""
        }

       ${MailSignature()}
      </div>
    </div>
  </div>
  `;

  const to = [data.email].filter( (e): e is string => Boolean(e) );
  if (to.length === 0) { throw new Error("No recipient email found"); }

  await sendMail({ to, cc, bcc: [], subject, html });

  return { status: true };
}
