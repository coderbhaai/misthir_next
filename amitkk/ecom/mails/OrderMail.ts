import { AddressProps } from "@amitkk/address/types";
import { sendMail } from "@amitkk/basic/utils/mailer";
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { OrderProps } from '@amitkk/ecom/types';

export async function OrderMail(data_id: string) {
    if (!data_id) throw new Error("data_id is required");

    let data: OrderProps | null = null;

    try {
        const res = await apiRequest("POST", `ecom/ecom`, { function: "get_single_order", data_id });
        if ( !res?.data ) { throw new Error("Entry not found"); }

        data = res.data as OrderProps;
    } catch (error) {
        clo(error);
        throw error;
    }

    const billingAddress = data?.billing_address_id as AddressProps;

    // Prepare HTML
    const html = `
        <h2>Hello ${billingAddress.name},</h2>
        <p>Thanks for your order!</p>
        <p>Your Order ID is <strong>${data._id}</strong></p>
        <p>Total Amount: ₹${data.paid}</p>
    `;

    const subject = `Order Confirmation #${data._id}`;

    const to = [ billingAddress?.email ].filter( (e): e is string => Boolean(e) );
    if (to.length === 0) throw new Error("No recipient email found");

    const cc = ["admin@example.com"];
    const bcc = ["audit@example.com"];

    return sendMail({ to, subject, html, cc, bcc });
}
