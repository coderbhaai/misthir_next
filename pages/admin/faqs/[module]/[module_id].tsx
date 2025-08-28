import Faqs from "@amitkk/basic/faqs";
import { useRouter } from "next/router";

export default function AddUpdateFaq() {
  const router = useRouter();
  const { module, module_id } = router.query;

  return(
      // <AddUpdateFaqPage module={module as string } module_id={module_id as string }/>
      <Faqs module={module as string } module_id={module_id as string }/>
  );
}
