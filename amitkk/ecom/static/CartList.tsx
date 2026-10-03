import ImageWithFallback from "@amitkk/basic/static/ImageWithFallback";
import { useEcom } from "contexts/EcomContext";
import CartCharges from "./CartCharges";
import CouponForm from "../../coupon/static/CouponForm";
import { Button } from "@amitkk/components/button/button";
import { Card } from "@amitkk/components/ui/card";
import { Iconify } from "@amitkk/basic/utils/my-utils/admin-utils";

export default function CartList() {
    const { sendAction, cart } = useEcom();
    const handleIncrease = (id: any) => { sendAction('increment_cart', { action: 'increment_cart', cart_sku_id: id }); }
    const handleDecrease = (id: any) => { sendAction('decrement_cart', { action: 'decrement_cart', cart_sku_id: id }); }
    const handleDelete = (id: any) => { sendAction("delete_cart_item", { action: "delete_cart_item", cart_sku_id: id }); }

    return (
    <div className="rounded-2xl p-4 sticky top-5 space-y-4">
      <div className="flex-1 overflow-y-auto w-full space-y-3">
        {cart && (
          <ul className="space-y-3 p-0 m-0 list-none">
            {(cart?.cartSkus ?? []).map((item: any) => (
              <li key={item._id} className="">
                <Card className="w-full p-3 shadow-none border border-border bg-card flex flex-col space-y-3 relative mb-2">
                  <div className="flex items-center gap-3">
                    <ImageWithFallback img={item.product_id?.medias?.[0]} width={80} height={80}/>
                    <div className="flex-grow">
                      <p className="text-sm font-semibold">{item.product_id?.name}</p>
                      {item.product_id?.seller_id && ( <small>By {item.product_id?.seller_id?.name}</small> 
                      )}

                    </div>
                    <p className="text-sm font-bold">₹{item.sku_id.price}</p>
                  </div>

                  <div className="flex items-center justify-between bg-muted/40 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleDecrease(item._id)}>-</Button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleIncrease(item._id)}>+</Button>
                    </div>
                    <p className="text-sm font-bold">₹{item.quantity * item.sku_id.price}</p>
                  </div>
                  <Iconify icon="Trash" className="h-5 w-5 text-xs absolute top-2 right-2 cursor-pointer" onClick={() => handleDelete(item._id)}/>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CouponForm coupon_code={cart?.cartCoupon?.coupon_code}/>
      <CartCharges cart={cart}/>
    </div>
  );
}