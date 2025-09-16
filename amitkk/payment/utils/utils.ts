import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/utils";
import { setCookie } from "hooks/CookieHook";
import router from "next/router";

export type PaymentData = {
  amount: number; // in paise for Razorpay
  currency?: string; // default INR
  description: string;
  name: string;
  email: string;
  phone: string;
  callbackUrl: string;
};

export type PaymentGatewayName = 'razorpay' | 'phonepe' | 'mpesa';

export const makePayment = async ({ module, module_id }: { module: string; module_id: string }) => {
  try{

    const res = await apiRequest("get", `basic/basic?function=get_all_settings`);
    if( !res?.data ){ hitToastr('errors', "Site Setting not found"); return; }

    const modeSetting = res.data.find((item: { module: string; }) => item.module === "Mode");
    const mode = modeSetting?.module_value;
    if (!mode){ hitToastr('errors', "Site Mode not found"); return; }

    const paymentGatewaySetting = res.data.find((item: { module: string; }) => item.module === "Payment Gateway");
    const paymentGateway = paymentGatewaySetting?.module_value;
    if (!paymentGateway){ hitToastr('errors', "Payment Gateway not found"); return; }

    switch (paymentGateway) {
      case "Razorpay":
        await hitRazorpay(module, module_id);
        break;
      case "PhonePe":
    //     await payWithPhonePe(module, module_id);
        break;
      default:
        throw new Error("Selected payment gateway is not supported");
    }
  }catch (err) { clo(err); }
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const hitRazorpay = async (module: string, module_id: string) => {
  try {
    const res = await apiRequest("post", "payment/payment", { module, module_id, payment_gateway: "Razorpay", function: "get_payment_data" });
    if( !res?.data ){ hitToastr('errors', "Module Data not found"); return; }

    const { key_id, } = getPaymentConfig();

    await loadRazorpayScript();
    let options = {};

    if( module == "Cart"){
      options = {
        key: key_id,
        amount: res.data.payable_amount?.$numberDecimal * 100,
        currency: 'INR',
        name: res.data.billing_address_id?.first_name,
        description: "Order on Misthir",
        order_id: res?.data?.response?.order_id,
        prefill: {
          name: res.data.billing_address_id?.first_name,
          email: res.data.billing_address_id?.email,
          contact: res.data.billing_address_id?.phone,
        },
        theme: { color: '#f19f40' },
        handler: async (response: any) => {
          const res = await apiRequest("post", "payment/payment", { response, module, module_id, payment_gateway: "Razorpay", source: "Website", function: "payment_response" });
          
          if( res?.data?.order_id ){
            router.push(`/order/${res?.data?.order_id}`);
          }
        },
      };
    }

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) { clo(err); }
};

const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => reject(false);
    document.body.appendChild(script);
  });
};

export function getPaymentConfig() {
  const isProd = process.env.MODE === "Prod";
  const key_id = isProd ? process.env.NEXT_PUBLIC_RAZORPAY_KEY_PROD_ID : process.env.NEXT_PUBLIC_RAZORPAY_KEY_TEST_ID;
  return { isProd, key_id };
}
