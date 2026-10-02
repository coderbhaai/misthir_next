export function MailSignature() {
    const companyName = "AMITKK";
    const supportEmail = "metreeva@gmail.com";
    const website = "https://www.metreeva.com/";
    const phone = "+91  83840 97145";
    const address = null;
    const logoUrl = "https://demo301.amitkkdev.com/images/logo.svg";

  return `
  <div style="margin-top:24px; font-family: Arial, Helvetica, sans-serif; font-size:14px; color:#111827;">
    <p style="margin:0 0 8px 0;">
      Regards,<br/>
      <strong>${companyName} Team</strong>
    </p>
    <div style="margin-top:16px;">
      <img src="${logoUrl}" alt="${companyName} Logo" style="height:60px; width:auto; display:block;"/>
    </div>

    <p style="margin:0; font-size:13px; color:#6b7280; line-height:1.6;">
      ${supportEmail ? `📧 <a href="mailto:${supportEmail}" style="color:#2563eb; text-decoration:none;">${supportEmail}</a><br/>` : ""}
      ${phone ? `📞 <a href="tel:${phone}" style="color:#2563eb; text-decoration:none;">${phone}</a><br/>` : ""}
      ${website ? `🌐 <a href="${website}" target="_blank" style="color:#2563eb; text-decoration:none;">${website.replace(/^https?:\/\//, "</a><br/>` : ""}
      ${address ? `📍 <span style="color:#6b7280;">${address}</span>` : ""}
    </p>

    <hr style="margin:16px 0; border:none; border-top:1px solid #e5e7eb;" />

    <p style="margin:0; font-size:11px; color:#9ca3af; line-height:1.5;">This email and any attachments are confidential and intended solely for the individual or entity to whom they are addressed. If you have received this email in error, please notify the sender and delete it immediately.
    </p>
  </div>
  `;
}
