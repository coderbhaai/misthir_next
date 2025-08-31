import Faqs from "@amitkk/basic/faqs";
import AdminCommission from "@amitkk/product/commission";
import { useRouter } from "next/router";

export default function AddUpdateCommission() {
  const router = useRouter();
  if (!router.isReady) return null;
  const { vendor_id } = router.query;

  return(
      <AdminCommission vendor_id={vendor_id as string }/>
  );
}