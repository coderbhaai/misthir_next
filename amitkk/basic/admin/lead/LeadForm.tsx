// amitkk/basic/admin/lead/LeadForm.tsx

"use client";

import React, { useCallback, useEffect, useState } from "react";
import MultiSelectDropdownModule from "@amitkk/basic/static/MultiSelectDropdownModule";
import { LeadProps } from "@amitkk/basic/types";
import { usePrefillForm } from "@amitkk/basic/utils/my-utils/client-utils";
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/client-api";
import { useFormHandler } from "hooks/useFormHandler";
import { TextField } from "@amitkk/components/basic/TextField";
import StickyFormFooter from "@amitkk/components/ui/StickyFormFooter";
import { Textarea } from "@amitkk/components/basic/textarea";

interface LeadFormProps {
  module?: string;
  module_id: string | null;
  handleClose: () => void;
  sourceUrl?: string;
}

const normalizeSlug = (url: string) => {
  return url
    .toLowerCase()
    .replace(/^\/(tehnology|tehnologyType|service|serviceType)\//, "")
    .replace(/^\/+|\/+$/g, "");
};

const initialFormData: LeadProps = {
  _id: "",
  name: "",
  email: "",
  phone: "",
  user_remarks: "",
  page_url: "",
  status: "Requested",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function LeadForm({
  module = "",
  module_id = "",
  handleClose,
  sourceUrl,
}: LeadFormProps) {
  const [formData, setFormData] = React.useState<LeadProps>(initialFormData);
  usePrefillForm({ setFormData, sourceUrl });
  const handleChange = useFormHandler(setFormData);
  const [selectedModule, setSelectedModule] = useState<any[]>([]);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [moduleOptions, setModuleOptions] = useState<{
      _id: string;
      name: string;
      module: string;
      url?: string;
    }[]>([]);

  const init_data = useCallback(async () => {
    try {
      const res = await apiRequest("GET", "basic/basic?function=get_all_lead_options");
      const options = res?.data ?? [];
      setModuleOptions(options);
      setOptionsLoaded(true);
    } catch (error) {
      clo(error);
    }
  }, []);

  useEffect(() => {
    init_data();
  }, [init_data]);

  useEffect(() => {
    if (!optionsLoaded || moduleOptions.length === 0) return;

    const pathSlug = normalizeSlug(window.location.pathname);

    const matched = moduleOptions.find((opt: any) => {
      if (!opt.url) return false;

      return normalizeSlug(opt.url) === pathSlug;
    });

    if (matched) {
      setSelectedModule([matched]);
      return;
    }

    if (module_id) {
      const selected = moduleOptions.filter(
        (opt) => opt._id === module_id
      );

      setSelectedModule(selected);
    }
  }, [
    optionsLoaded,
    moduleOptions,
    module_id,
  ]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      const activeModule =
        module ||
        selectedModule[0]?.module ||
        "";

      const formDataToSend = new FormData();

      formDataToSend.append(
        "function",
        "create_update_lead_request"
      );

      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("module", activeModule);

      formDataToSend.append(
        "user_remarks",
        formData.user_remarks ?? ""
      );

      formDataToSend.append(
        "selectedModule",
        JSON.stringify(selectedModule)
      );

      formDataToSend.append(
        "page_url",
        formData.page_url
      );

      const res = await apiRequest(
        "POST",
        "basic/basic",
        formDataToSend
      );

      if (res?.data) {
        setSelectedModule([]);
        setFormData(initialFormData);
        handleClose();
      }
    } catch (error) {
      clo(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <TextField label="Name" value={formData.name} name="name" onChange={handleChange} required/>
      <TextField label="Email" value={formData.email} name="email" onChange={handleChange} required/>
      <TextField label="Phone" value={formData.phone} name="phone" onChange={handleChange} required/>
      <MultiSelectDropdownModule label="Service" options={moduleOptions} selected={selectedModule} onChange={setSelectedModule}/>
      <Textarea label="Your Message" value={formData.user_remarks} rows={4} name="user_remarks" onChange={handleChange} />
      <StickyFormFooter title="Contact Us" />
    </form>
  );
}