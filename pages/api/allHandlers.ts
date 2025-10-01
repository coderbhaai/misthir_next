import { actionHandlers } from "./basic/action";
import { authHandlers } from "./basic/auth";
import { basicHandlers } from "./basic/basic";
import { commentHandlers } from "./basic/comment";
import { mediaHandlers } from "./basic/media";
import { metaHandlers } from "./basic/meta";
import { pageHandlers } from "./basic/page";
import { spatieHandlers } from "./basic/spatie";
import { authorHandlers } from "./blog/author";
import { blogmetaHandlers } from "./blog/blogmeta";
import { blogHandlers } from "./blog/blogs";
import { couponHandlers } from "./ecom/coupon";
import { ecomHandlers } from "./ecom/ecom";
import { salesHandlers } from "./ecom/sales";
import { paymentHandlers } from "./payment/payment";
import { productHandlers } from "./product/product";

export async function getAllHandlers(): Promise<Record<string, any>> {
  const { reviewHandlers } = await import("./basic/review");
  return { 
    ...reviewHandlers,
    ...actionHandlers,
    ...authHandlers,
    ...basicHandlers,
    ...commentHandlers,
    ...mediaHandlers,
    ...metaHandlers,
    ...pageHandlers,
    ...spatieHandlers,
    ...authorHandlers,
    ...blogmetaHandlers,
    ...blogHandlers,
    ...couponHandlers,
    ...ecomHandlers,
    ...salesHandlers,
    ...paymentHandlers,
    ...basicHandlers,
    ...productHandlers,    
  };
}