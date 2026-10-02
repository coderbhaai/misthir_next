import React from "react";
import { useRouter } from "next/router";
import {usePrefillForm} from "@amitkk/basic/utils/my-utils/client-utils";
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/client-api";
import type { ContactProps } from "@amitkk/basic/types";
import PhoneCountry from "@amitkk/components/basic/PhoneCountry";
import { TextField } from "@amitkk/components/basic/TextField";
import { Textarea } from "@amitkk/components/basic/textarea";
import { Button } from "@amitkk/components/button/button";
import { useMenu } from "contexts/MenuContext";

interface ContactFormProps {
  handleClose?: () => void;
  sourceUrl?: string;
}

export default function ContactForm({handleClose, sourceUrl}: ContactFormProps) {
  const router = useRouter();

  const [formData, setFormData] =
    React.useState<ContactProps>({
      name: "",
      email: "",
      phone: "",
      country_id: "",
      page_url: "",
      user_remarks: "",
      admin_remarks: "",
      status: "Requested",
    });

  usePrefillForm({ setFormData, sourceUrl });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({ ...prevData, [name]: name === "status" || name === "major" ? value === "true" : value, }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_contact");
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("country_id", String(formData.country_id));
      formDataToSend.append("user_remarks", formData.user_remarks ?? "");
      formDataToSend.append("admin_remarks", formData.admin_remarks ?? "");
      formDataToSend.append("page_url", formData.page_url ?? "");
      formDataToSend.append("status", formData.status);
      const res = await apiRequest("POST", "basic/basic", formDataToSend);

      if (res?.data) {
        handleClose?.();
        router.push("/thank-you");
      }
    } catch (error) { clo(error); }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-4">
        <TextField label="Name"  name="name" value={formData.name} onChange={handleChange} required/>
        <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required/>
        {/* <PhoneCountry onChange={({ country, phone }) => { setFormData((prev: any) => ({ ...prev, phone: phone, country_id: country?._id || "" })); }}/> */}
        <Textarea label="Your Message" name="user_remarks" value={formData.user_remarks} onChange={handleChange} rows={3} required/>
        <Button type="submit" className="w-full">"Connect Now"</Button>
      </div>
    </form>
  );
}