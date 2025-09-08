import Testimonials from "@amitkk/basic/testimonials";
import { useRouter } from "next/router";

export default function AddUpdateFaq() {
  const router = useRouter();
  const { module, module_id } = router.query;

  return(
      <Testimonials module={module as string } module_id={module_id as string }/>
  );
}