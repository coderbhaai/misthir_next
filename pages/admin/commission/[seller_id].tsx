import AdminSellerCommission from "@amitkk/product/seller-commission";
import { useRouter } from "next/router";

export default function AddUpdateCommission() {
  const router = useRouter();
  if (!router.isReady) return null;
  const { seller_id } = router.query;

  return(
      <AdminSellerCommission seller_id={seller_id as string }/>
  );
}