"use client";

import { useEffect, useState } from "react";
import { CartProps } from '@amitkk/ecom/types';
import PaymentStatic from "@amitkk/ecom/static/PaymentStatic";
import { fullAddress } from "@amitkk/address/utils/addressUtils";
import CartCharges from "@amitkk/ecom/static/CartCharges";
import AdminAdditionalDiscountModal from "@amitkk/ecom/admin/admin-additional-discount-modal";
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { Button } from "@amitkk/components/button/button";
import { Textarea } from "@amitkk/components/basic/textarea";
import { AddressProps } from "@amitkk/address/types";
import CouponForm from "../../coupon/static/CouponForm";
import ContactInfoSection from "../static/ContactInfoSection";
import SkuItemList from "../static/SkuItemList";

interface DataFormProps {
    dataId?: string;
} 

export const SingleAbandoneCart: React.FC<DataFormProps> = ({ dataId = "" }) => {
  const [cart, setCart] = useState<CartProps | null>(null);
  const [openDiscountModal, setOpenDiscountModal] = useState(false);
  
  const fetchSingleEntry = async () => {
    if (!dataId) return;

    try {
      const res = await apiRequest("GET", `ecom/ecom?function=get_single_abdandoned_cart&id=${dataId}`);
      if (res?.data) {
        const cartData = res.data as CartProps;
        setCart(cartData);

        const itemCount = (cartData.cartSkus || []).reduce(
          (sum, sku: any) => sum + (sku?.quantity || 0),
          0
        );
      }
    } catch (error) { clo(error); }
  };

  useEffect(() => { fetchSingleEntry(); }, [dataId]);

  if( !cart ){ return null; }

  return (
    <div className="row p-4">
      <div className="col-span-12 md:col-span-7">
        <h2 className="text-2xl font-bold tracking-tight">Contact</h2>

        <ContactInfoSection email={cart?.cartConsent?.email} phone={cart?.cartConsent?.phone} emailConsent={cart?.cartConsent?.emailConsent} phoneConsent={cart?.cartConsent?.phoneConsent} editable={false} />
        { cart?.shipping_address_id && ( <p className="my-3"><strong>Shipping Address</strong> : {fullAddress(cart?.shipping_address_id as AddressProps)}</p>)}
        { cart?.billing_address_id && ( <p className="my-3"><strong>Billing Address</strong> : {fullAddress(cart?.billing_address_id as AddressProps)}</p>)}

        <div className="py-5 space-y-4">
          <PaymentStatic />
          <div className="col-span-12 space-y-4">
            <p><strong>Payment Method:</strong> {cart.paymode}</p>
            <Textarea label="Order Note" id="user-remarks" placeholder="Add a note" rows={3} value={cart?.user_remarks || ""} disabled/>
            <Button className="w-full bg-black text-white hover:bg-gray-800 py-6 my-3">Pay Now</Button>
          </div>
        </div>
      </div>


      <div className="col-span-12 md:col-span-5">
        <div className="rounded-2xl p-4 sticky top-5 space-y-4">
          <SkuItemList items={cart?.cartSkus ?? []} />
          <CouponForm coupon_code={cart?.cartCoupon?.coupon_code} allowed={false}/>
          <CartCharges cart={cart}/>
        </div>
      </div>

      <AdminAdditionalDiscountModal open={openDiscountModal} cart_id={cart._id as string} limit={Number(cart?.total || 0)} cartCharges={cart?.cartCharges} handleClose={() => { setOpenDiscountModal(false); fetchSingleEntry(); }}/>
    </div>
  );
}

export default SingleAbandoneCart;