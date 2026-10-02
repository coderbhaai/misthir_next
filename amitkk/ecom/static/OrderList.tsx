import ImageWithFallback from "@amitkk/basic/static/ImageWithFallback";
import { Card } from "@amitkk/components/ui/card";
import { OrderProps, OrderSkuProps } from "../types";
import CartCharges from "./CartCharges";
import CouponForm from "../../coupon/static/CouponForm";
import SkuItemList from "./SkuItemList";

interface OrderListProps {
  order: OrderProps;
}

export default function OrderList({ order }: OrderListProps) {
  const orderSkus = order?.orderSkus ?? [];

  return (
    <div className="col-span-12 md:col-span-4">
      <div className="rounded-2xl p-4 sticky top-5 space-y-4">
        <SkuItemList items={orderSkus} />

        {/* <CouponForm coupon_code={order?.orderCoupon?.code}/> */}
        <CartCharges cart={order} cart_status={false} />
      </div>
    </div>
  );
}