"use client";

import * as React from "react";
import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import CustomModal from "@amitkk/basic/static/CustomModal";
import { FileField } from "@amitkk/components/basic/FileField";
import { EXCEL_MANAGER, getExcelConfig } from "lib/excel/excel-manager";
import StickyFormFooter from "@amitkk/components/ui/StickyFormFooter";
import OpenSelect from "@amitkk/components/basic/OpenSelect";

type ExcelModalProps = {
  open: boolean;
  handleClose: () => void;
  onUpdate: (id: string, selectedType: string) => void;
  pageKey?: string;
};

export default function ExcelModal({ open, handleClose, onUpdate, pageKey }: ExcelModalProps) {
  const [excelFile, setExcelFile] = React.useState<File | null>(null);
  const [selectedDmc, setSelectedDmc] = React.useState<string>("");
  const [activeModuleKey, setActiveModuleKey] = React.useState<string>("");
  const [isSynced, setIsSynced] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (open) {
      const targetConfig = getExcelConfig(pageKey);
      setActiveModuleKey(targetConfig.key);
      setExcelFile(null);
      setSelectedDmc("");
      setIsSynced(true);
    } else {
      setIsSynced(false);
    }
  }, [open, pageKey]);
  
  React.useEffect(() => {
    setSelectedDmc("");
  }, [activeModuleKey]);

  const activeConfig = getExcelConfig(activeModuleKey);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowed.includes(file.type)) {
      hitToastr("error", "Only Excel files allowed");
      return;
    }
    setExcelFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile) return hitToastr("error", "Upload file");
    if (activeConfig?.requiresDmcImport && !selectedDmc) return hitToastr("error", "Select DMC");

    try {
      const form = new FormData();
      form.append("function", "upload_via_excel");
      form.append("file", excelFile);
      form.append("type", activeConfig.backendType);
      form.append("dmc_id", selectedDmc);

      const res = await apiRequest("POST", "basic/excel", form);
      if (res?.data) {
        hitToastr("success", res.message || "Uploaded");
        onUpdate(res.data, activeModuleKey);
        handleClose();
      }
    } catch (err) { clo(err); }
  };

  const dropdownOptions = Object.values(EXCEL_MANAGER).map((item) => ({ label: item.label, value: item.key }));
  if (!open || !isSynced || !activeModuleKey) return null;

  return (
    <CustomModal open={open} handleClose={handleClose} title={`Upload ${activeConfig.label}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <OpenSelect key={`select-sync-lock-${activeModuleKey}`} name="type" label="Type" options={dropdownOptions} value={activeModuleKey} onChange={(value) => setActiveModuleKey(value as string)} required/>
        
        {/* {activeConfig.requiresDmcImport && (
          <DmcDropdown value={selectedDmc} onChange={(val) => setSelectedDmc(val)} required/>
        )} */}
        
        <FileField name="excel_file" label="Excel File" selectedFile={excelFile} onChange={handleFileChange} required/>
        <StickyFormFooter title="Upload"/>
      </form>
    </CustomModal>
  );
}