import React from "react";

interface CartCouponDetailsProps {
  coupon?: {
    coupon_code?: string;
    admin_coupon_discount?: number;
    vendor_coupon_discount?: number;
    coupon_id?: {
      name?: string;
      code?: string;
      discount_type?: string;
      discount_value?: number;
    };
  } | null;
}

export default function CartCouponDetails({ coupon }: CartCouponDetailsProps) {
  if (!coupon || (!coupon.coupon_code && !coupon.coupon_id)) {
    return <span className="text-muted-foreground text-sm">No Coupon Applied</span>;
  }

  const code = coupon.coupon_code || coupon.coupon_id?.code || "N/A";
  const adminDiscount = coupon.admin_coupon_discount ?? 0;
  const vendorDiscount = coupon.vendor_coupon_discount ?? 0;
  const totalDiscount = adminDiscount + vendorDiscount;

  return (
    <div className="space-y-1 text-xs">
      <div className="font-semibold text-primary">
        Code: <span className="uppercase tracking-wide">{code}</span>
      </div>
      {totalDiscount > 0 && (
        <div className="text-muted-foreground">
          Discount: <span className="font-medium text-foreground">₹{totalDiscount}</span>
          {adminDiscount > 0 && vendorDiscount > 0 && (
            <span className="block text-[10px] text-gray-500">
              (Admin: ₹{adminDiscount} | Vendor: ₹{vendorDiscount})
            </span>
          )}
        </div>
      )}
    </div>
  );
}