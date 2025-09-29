import { AddressProps } from "@amitkk/address/types/address";
import { sendMail } from "@amitkk/basic/utils/mailer";
import { apiRequest, clo } from "@amitkk/basic/utils/utils";
import { OrderProps } from '@amitkk/ecom/types/ecom';

export async function BulkOrderUserMail(data_id: string) {
    if (!data_id) throw new Error("data_id is required");

    let data: OrderProps | null = null;

    try {
        const res = await apiRequest("post", `product/product`, { function: "get_single_bulk_order", data_id });
        if ( !res?.data ) { throw new Error("Entry not found"); }

        data = res.data as OrderProps;
    } catch (error) {
        clo(error);
        throw error;
    }

    // Prepare HTML
    const html = `
        <h2>Hi,</h2>
        <p>Thanks for your order!</p>
    `;

    const subject = `Order Confirmation #${data._id}`;

    const to = [ data?.email ].filter( (e): e is string => Boolean(e) );
    if (to.length === 0) throw new Error("No recipient email found");

    const cc = ["admin@example.com"];
    const bcc = ["audit@example.com"];

    return sendMail({ to, subject, html, cc, bcc });
}
