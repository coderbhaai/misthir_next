import { useState, type FormEvent, } from "react";
import { useRouter } from "next/router";
import type { NewsLetterFormProps } from "@amitkk/basic/types";
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/client-api";
import { useFormHandler } from "hooks/useFormHandler";

export default function Newsletter() {
  const router = useRouter();  
  const [formData, setFormData] = useState<NewsLetterFormProps>({
      _id: "",
      email: "",
      page_url: "",
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  const handleChange = useFormHandler(setFormData);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {

      const formDataToSend = new FormData();

      formDataToSend.append("function", "create_update_newsletter_subscriber");
      formDataToSend.append("email", formData.email);
      formDataToSend.append("page_url", formData.page_url ?? "");
      formDataToSend.append("status", String(formData.status));
       await apiRequest("POST", basic/basic", formDataToSend);

      if (res?.data) {
        router.push("/thank-you");
      }
    } catch (error) { clo(error); }
  };

  return (
    <section className="relative overflow-hidden bg-cover bg-center bg-fixed py-16 md:py-24"style={{backgroundImage: "url(/images/static/newsletter.jpg)"}}>
      <div className="absolute inset-0 bg-[#0a1628]/90"/>
      <div className="container relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-5 text-center text-sm font-bold uppercase tracking-widest text-white">Stay Connected</p>
          <h2 className="mb-3 text-3xl font-bold text-white md:text-5xl">Discover the magic of India</h2>
          <p className="mb-6 text-center text-white/80"> Subscribe for exclusive deals, hidden gems, and curated experiences across incredible India.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 md:flex-row">
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email" className="h-12 w-full rounded-xl border border-white/40 bg-white/10 px-4 text-white outline-none backdrop-blur-sm transition-all placeholder:text-white/60 focus:border-white focus:bg-white/15"/>
            <button type="submit" className="h-12 rounded-xl bg-white px-6 font-semibold text-black transition-all hover:scale-[1.02] hover:bg-white/90">Subscribe</button>
          </form>
          <p className="mt-4 text-center text-sm text-white">No spam, ever. Unsubscribe anytime.</p>
        </div>
      </div>
    </section>
  );
}