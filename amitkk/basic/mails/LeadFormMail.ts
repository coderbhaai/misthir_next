import { sendMail } from "@amitkk/basic/utils/mailer";
import { apiRequest } from "@amitkk/basic/utils/my-utils/admin-utils";
import { MailSignature } from "./MailSignature";
import { logError } from "pages/api/utils";

interface LeadModuleMail {
  module: string;
  name?: string;
  url?: string;
}

interface LeadMailData {
  name: string;
  email: string;
  phone?: string;
  user_remarks?: string;
  admin_remarks?: string;
  page_url?: string;
  createdAt?: Date;
  modules?: LeadModuleMail[];
}

export async function LeadFormMail(lead_id: string) {
  if (!lead_id) throw new Error("lead_id is required");

  let data: LeadMailData | null = null;

  const subject = "📩 New Conultation Received";
  const cc = ["amit@amitkk.com"];

  try {
    await apiRequest("POST", basic/basic", {
      function: "get_single_lead_request",
      id: lead_id,
    });

    data = res?.data as LeadMailData;
  } catch (error) {
    await logError(error, { function: "LeadFormMail", payload: { lead_id } });
    throw error;
  }

  if (!data) {
    throw new Error("Lead data missing after API call");
  }

  const phoneWithCode = [data.phone].filter(Boolean).join(" - ");

  const modulesHtml =
    data.modules && data.modules.length
      ? `
        <div style="margin:24px 0;">
          <h3 style="font-size:16px;">Interested In</h3>
          <ul style="padding-left:16px; font-size:14px;">
            ${data.modules
              .map(
                (m) => `
                <li>
                  <strong>${m.module}</strong>
                  ${m.name ? ` - ${m.name}` : ""}
                  ${m.url ? ` (<a href="${m.url}" target="_blank">View</a>)` : ""}
                </li>
              `
              )
              .join("")}
          </ul>
        </div>
      `
      : "";

  const html = `
  <div style="font-family: Arial, Helvetica, sans-serif; background:#f4f6f8; padding:24px;">
    <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; overflow:hidden;">

      <div style="background:#111827; padding:16px 24px;">
        <h2 style="color:#ffffff; margin:0;">🚀 New Conusltation Request</h2>
      </div>

      <div style="padding:24px; color:#111827;">
        <div style="border:1px solid #e5e7eb; border-radius:6px; padding:16px;">
          <h3 style="margin-top:0; font-size:16px;">Lead Details</h3>

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
              data.page_url
                ? `<tr>
                    <td style="color:#6b7280;">Page URL</td>
                    <td><a href="${data.page_url}" target="_blank">${data.page_url}</a></td>
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
            <div style="margin-top:24px;">
              <h3 style="font-size:16px;">User Remarks</h3>
              <div style="background:#f9fafb; padding:12px; border-radius:6px;">
                ${data.user_remarks}
              </div>
            </div>`
            : ""
        }

        ${modulesHtml}

        ${MailSignature()}
      </div>
    </div>
  </div>
  `;

  const to = [data.email].filter(
    (e): e is string => Boolean(e)
  );

  if (!to.length) {
    throw new Error("No recipient email found");
  }

  await sendMail({ to, cc, bcc: [], subject, html });

  return { status: true };
}