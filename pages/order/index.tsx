// pages > order > index.tsx

import UserSingleOrder from "@amitkk/ecom/user/admin/user-single-order";
import { useEffect, useState } from "react";

export default function OrderPage() {
  const [order_id, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const storedOrderId = localStorage.getItem("order_id");
    setOrderId(storedOrderId);
  }, []);

  if (!order_id) return <p>No order found</p>;

  return <UserSingleOrder order_id={order_id} />;
}