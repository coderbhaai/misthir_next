"use client";

import * as React from "react";
import { useState } from "react";
import dayjs from "dayjs";
import CustomModal from "@amitkk/basic/static/CustomModal";
import { apiRequest, clo, downloadExcel, handleMultiSelectChange, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import { OptionProps } from "@amitkk/basic/types/generic";
import StickyFormFooter from "@amitkk/components/ui/StickyFormFooter";
import MultiSelectDropdown from "@amitkk/components/admin/multiselect-dropdown";

export type ExportModalProps = {
  open: boolean;
  handleClose: () => void;
  type?: string;
  change_type?: boolean;
};

export type DataProps = {
  function: string;
  type: string;
  dateFrom: string;
  dateTo: string;
};

export default function ExportModal({open, handleClose, type, change_type = true}: ExportModalProps) {
  const initialFormData: DataProps = {
    function: "export_excel",
    type: "",
    dateFrom: "",
    dateTo: "",
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  React.useEffect(() => {
    if (type) {
      setFormData((prev) => ({ ...prev, type }));
    }
  }, [type, open]);

  const [serviceOptions, setServiceOptions] = React.useState<OptionProps[]>([]);
  const [selectedService, setSelectedService] = useState<string[]>([]);
  const [technologyOptions, setTechnologyOptions] = React.useState<OptionProps[]>([]);
  const [selectedTechnology, setSelectedTechnology] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value === "true" ? true : value === "false" ? false : value}));
  };

  const handleDateChange = (key: "dateFrom" | "dateTo", value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value ? new Date(value).toISOString() : ""}));
  };

  const initData = React.useCallback(async () => {
    try {
      const res_1 = await apiRequest("GET", `basic/excel?function=get_options_for_excel_export`);
      setServiceOptions(res_1?.data?.services ?? []);
      setTechnologyOptions(res_1?.data?.technology ?? []);
    } catch (error) { clo(error); }
  }, []);
  React.useEffect(() => { initData(); }, [initData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });
      formDataToSend.append("selectedService", JSON.stringify(selectedService));
      formDataToSend.append("selectedTechnology", JSON.stringify(selectedTechnology));

      await downloadExcel({
        url: "/api/basic/excel",
        payload: formDataToSend,
        filename: `export_${formData.type}_${dayjs().format("YYYY-MM-DD")}.xlsx`,
      });
    } catch (error) { clo(error); }
  };

  return (
    <CustomModal open={open} handleClose={handleClose} title="Export in CSV">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-medium text-muted-foreground">Type <span className="text-destructive">*</span></label>
            <select name="type" value={formData.type} onChange={handleChange} disabled className="w-full h-10 rounded-md border border-input bg-muted px-3 py-2 text-sm focus:outline-none opacity-80 cursor-not-allowed" >
              <option value="Admin Wishlist">Admin Wishlist</option>
              <option value="Meta">Meta</option>
            </select>
          </div>

          <MultiSelectDropdown label="Services" options={serviceOptions} selected={selectedService} onChange={(e) => handleMultiSelectChange(e, setSelectedService)}/>
          <MultiSelectDropdown label="Technology" options={technologyOptions} selected={selectedTechnology} onChange={(e) => handleMultiSelectChange(e, setSelectedTechnology)}/>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-medium text-muted-foreground">Date From</label>
            <input type="date" value={ formData.dateFrom ? dayjs(formData.dateFrom).format("YYYY-MM-DD") : "" } onChange={(e) => handleDateChange("dateFrom", e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"/>
          </div>

          <div className="flex flex-col gap-1 w-full">
            <label className="text-xs font-medium text-muted-foreground">Date To</label>
            <input type="date" value={ formData.dateTo ? dayjs(formData.dateTo).format("YYYY-MM-DD") : "" } onChange={(e) => handleDateChange("dateTo", e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"/>
          </div>
          <StickyFormFooter title="Download Excel" />
        </div>
      </form>
    </CustomModal>
  );
}