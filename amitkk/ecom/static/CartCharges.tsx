import { Separator } from "@amitkk/components/ui/separator";
import React from "react";
import ChargeRow from "./ChargeRow";
import { CartProps, OrderProps } from "../types";

interface CartChargesProps {
  cart?: CartProps | OrderProps;
  cart_status?: boolean;
}

const parseVal = (val: any): number => {
  if (val == null) return 0;
  if (typeof val === "object") {
    return Number(val) || 0;
  }
  return Number(val) || 0;
};

export default function CartCharges({ cart, cart_status = true }: CartChargesProps) {
  const data = cart as any;
  const skus = data?.cartSkus ?? data?.orderSkus ?? [];
  const itemCount = skus.reduce((acc: number, item: any) => acc + (parseVal(item?.quantity) || 0), 0);
  const total = parseVal(data?.total);
  const payableAmount = parseVal(data?.payable_amount ?? data?.paid); 
  const charges = data?.cartCharges ?? data?.orderCharges;
  const coupon = data?.cartCoupon;
  const totalCouponDiscount = parseVal(coupon?.admin_coupon_discount) + parseVal(coupon?.vendor_coupon_discount);
  const totalAdditionalDiscount = parseVal(charges?.admin_discount) + parseVal(charges?.total_vendor_discount);

  return (
    <>
      <Separator className="my-4" />
      <div className="flex justify-between mb-2 text-sm">
        <span>Subtotal · {itemCount} Items</span>
        <span>₹{total}</span>
      </div>

      {charges && (
        <>
          <ChargeRow label="Shipping Charges (Inc)" value={parseVal(charges?.shipping_charges)} />
          <ChargeRow label="COD Charges (Inc)" value={parseVal(charges?.cod_charges)} />
          <ChargeRow label="Sales Discount" value={parseVal(charges?.sales_discount)} />
          <ChargeRow label="Coupon Discount" value={totalCouponDiscount} />
          <ChargeRow label="Additional Discount" value={totalAdditionalDiscount} />
        </>
      )}

      <Separator className="my-4" />
      <div className="flex justify-between text-base font-bold">
        <span>{cart_status ? "Payable" : "Paid"}</span>
        <span>₹{payableAmount}</span>
      </div>
    </>
  );
}