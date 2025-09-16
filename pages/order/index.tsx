// pages > order > index.tsx

import { useEffect, useState } from "react";

export default function OrderPage() {
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const storedOrderId = localStorage.getItem("order_id");
    setOrderId(storedOrderId);
  }, []);

  if (!orderId) return <p>No order found</p>;
  return <p>Loading order {orderId}...</p>;
}
