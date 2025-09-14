import React from "react";
import { CartSkuProps } from "@amitkk/ecom/types/ecom";
import { ProductProps, SkuProps } from "@amitkk/product/types/product";

interface CartSkuDetailsProps {
  cartSkus?: CartSkuProps[];
}

const CartSkuDetails: React.FC<CartSkuDetailsProps> = ({ cartSkus }) => {
  if (!cartSkus || cartSkus.length === 0) return null;

  return (
    <div>
      {cartSkus.map((i) => {
        const product = i.product_id as ProductProps;
        const sku = i.sku_id as SkuProps;
        const totalPrice = sku?.price ? i.quantity * Number(sku.price) : 0;

        return (
          <div key={i._id?.toString()}>
            {product?.name || "Product"} : {i.quantity} X ₹{sku?.price || 0} = ₹{totalPrice}
          </div>
        );
      })}
    </div>
  );
};

export default CartSkuDetails;
