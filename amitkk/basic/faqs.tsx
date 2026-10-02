"use client";

import { useEffect, useState } from "react";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { getSelectedModuleInfo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { AdminDataTable, DataProps } from "@amitkk/basic/admin/faq/admin-faq-table";
import DataModal from "@amitkk/basic/admin/faq/faq-modal";
import { AdminModuleProps } from "./types";
import { useAdminPage } from "hooks/useAdminPage";

export default function AdminFaq({ module = "", module_id = "" }: AdminModuleProps) {
  const admin = useAdminPage<DataProps>({ listEndpoint: "basic/page", listFunction: "get_filtered_faqs", singleFunction: "get_single_faq" });

  const [targetAsset, setTargetAsset] = useState<{ name: string; url: string } | null>(null);
  useEffect(() => {
    let isMounted = true;
    
    getSelectedModuleInfo(module, module_id).then((res) => {
      if (isMounted && res) { setTargetAsset(res); }
    });

    return () => { isMounted = false; };
  }, [module, module_id]);
  const title = targetAsset ? ( <a href={targetAsset.url} target="_blank" rel="noreferrer">FAQs For {targetAsset.name}</a> ) : ( "All FAQs");

  const FILTER_CONFIG = [
    { name: "SearchFilter", grid: "col-span-5" },
    { name: "ModuleFilter", grid: "col-span-2" },
    { name: "ModuleIdFilter", grid: "col-span-3" },
    { name: "StatusFilter", grid: "col-span-2" },
  ] as const;

  const head = [
    { id: "model", label: "Module" },
    { id: "model_id", label: "Model" },
    { id: "question", label: "Question" },
    { id: "", label: "" },
  ];

  return (
    <AdminTableLayout<DataProps> admin={admin} title={title} addButtonLabel="New FAQ" filters={FILTER_CONFIG} head={head}rows={admin.data.map((row) => ( 
        <AdminDataTable key={row._id.toString()} row={row} onEdit={() => admin.handleEdit(row._id.toString())}/> ))}>
      <DataModal {...admin.modal} module={module} module_id={module_id}/>
    </AdminTableLayout>
  );
}