// pages > order > [id].tsx

import { useRouter } from "next/router";
import { useEffect } from "react";

export default function OrderPage() {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;
    const orderId = Array.isArray(id) ? id[0] : id;
    localStorage.setItem("order_id", orderId);
    router.replace("/order");
  }, [id, router]);

  if (!id) return <p>Loading order...</p>;
  return <p>Loading order {Array.isArray(id) ? id[0] : id}...</p>;
}