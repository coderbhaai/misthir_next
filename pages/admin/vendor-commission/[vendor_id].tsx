import AdminVendorCommission from "@amitkk/product/seller-commission";
import { useRouter } from "next/router";

export default function AddUpdateVendorCommission() {
  const router = useRouter();
  if (!router.isReady) return null;
  const { seller_id } = router.query;

  return <AdminVendorCommission seller_id={seller_id as string} />;
}
