import { sendMail } from "@amitkk/basic/utils/mailer";
import { apiRequest, clo } from "@amitkk/basic/utils/utils";

export interface DataProps{
    type: string;
    email?: string;
    phone?: string;
    otp: string;
    expiresAt: Date;
}

export async function UserOtpMail(data_id: string) {
    if (!data_id) throw new Error("data_id is required");

    let data: DataProps | null = null;

    try {
        const res = await apiRequest("post", `basic/auth`, { function: "get_single_otp", id:data_id });
        if ( !res?.data ) { throw new Error("Entry not found"); }

        data = res.data as DataProps;
    } catch (error) { clo(error); throw error; }

    // Prepare HTML
    const html = `
        <h2>Hi,</h2>
        <p>Your OTP is ${data.otp}</p>
    `;

    const subject = `OTP Generated`;

    const to = [ data?.email ].filter( (e): e is string => Boolean(e) );
    if (to.length === 0) throw new Error("No recipient email found");

    return sendMail({ to, subject, html, cc: [], bcc: [] });
}