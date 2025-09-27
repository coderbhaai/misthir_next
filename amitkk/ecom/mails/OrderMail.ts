import { AddressProps } from "@amitkk/address/types/address";
import { sendMail } from "@amitkk/basic/utils/mailer";
import { apiRequest, clo } from "@amitkk/basic/utils/utils";
import { OrderProps } from '@amitkk/ecom/types/ecom';

export async function OrderMail(order_id: string) {
    if (!order_id) throw new Error("order_id is required");

    let orderData: OrderProps | null = null;

    try {
        const res = await apiRequest("post", `ecom/ecom`, { function: "get_single_order", order_id });
        if (res?.data) {
            orderData = res.data as OrderProps;
        } else {
            throw new Error("Order not found");
        }
    } catch (error) {
        clo(error);
        throw error;
    }

    const billingAddress = orderData?.billing_address_id as AddressProps;

    // Prepare HTML
    const html = `
        <h2>Hello ${billingAddress.first_name},</h2>
        <p>Thanks for your order!</p>
        <p>Your Order ID is <strong>${orderData._id}</strong></p>
        <p>Total Amount: ₹${orderData.paid}</p>
    `;

    const subject = `Order Confirmation #${orderData._id}`;

    const to = [ billingAddress?.email ].filter( (e): e is string => Boolean(e) );
    if (to.length === 0) throw new Error("No recipient email found");

    const cc = ["admin@example.com"];
    const bcc = ["audit@example.com"];

    return sendMail({ to, subject, html, cc, bcc });
}
