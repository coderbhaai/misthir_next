import AdminVendorCommission from "@amitkk/product/seller-commission";
import { useRouter } from "next/router";

export default function AddUpdateVendorCommission() {
  const router = useRouter();
  if (!router.isReady) return null;
  const { vendor_id } = router.query;

  return <AdminVendorCommission vendor_id={vendor_id as string} />;
}
