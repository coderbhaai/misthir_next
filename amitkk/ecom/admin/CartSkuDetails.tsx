import React from "react";
import { ProductProps, SkuProps } from "@amitkk/product/types/product";
import { SkuItem } from "../types/ecom";

interface CartSkuDetailsProps {
  skus?: SkuItem[];
}

const CartSkuDetails: React.FC<CartSkuDetailsProps> = ({ skus }) => {
  if (!skus || skus.length === 0) return null;

  return (
    <div>
      {skus.map((i) => {
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