"use client";

import { useEffect, useState, } from "react";
import { AdminTableLayout, } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { getSelectedModuleInfo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { AdminDataTable, } from "@amitkk/basic/admin/testimonial/admin-testimonial-table";
import DataModal from "@amitkk/basic/admin/testimonial/testimonial-modal";
import { useAdminPage, } from "hooks/useAdminPage";
import type { AdminModuleProps, SingleTestimonialProps, } from '@amitkk/basic/types';
import { useFilterContext } from "contexts/FilterContext";

export default function AdminTestimonial({ module = "", module_id = "" }: AdminModuleProps) {
    const admin = useAdminPage<SingleTestimonialProps>({ listEndpoint: "basic/page", listFunction: "get_filtered_testimonials", singleFunction: "get_single_testimonial" });
    const { setFilter } = useFilterContext();
    useEffect(() => {
        if (module) setFilter("ModuleFilter", module);
        if (module_id) setFilter("ModuleIdFilter", module_id);
    }, [module, module_id, setFilter]);
        
    const [targetAsset, setTargetAsset] = useState<{ name: string; url: string } | null>(null);
      useEffect(() => {
        let isMounted = true;
        
        getSelectedModuleInfo(module, module_id).then((res) => {
          if (isMounted && res) { setTargetAsset(res); }
        });
    
        return () => { isMounted = false; };
      }, [module, module_id]);
      const title = targetAsset ? ( <a href={targetAsset.url} target="_blank" rel="noreferrer">Testimonials For {targetAsset.name}</a> ) : ( "All Testimonials");

  const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-5", },
        { name: "ModuleFilter", grid: "col-span-2", },
        { name: "ModuleIdFilter", grid: "col-span-3", },
        { name: "StatusFilter", grid: "col-span-2", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "model", label: "Module" },
                    { id: "client", label: "Client" },
                    { id: "testimonial", label: "Testimonial" },
                    { id: "", label: "" },
                ];

  return (
    <AdminTableLayout<SingleTestimonialProps> admin={admin} title={title} addButtonLabel="New Testimonial" filters={FILTER_CONFIG} head={head}rows={admin.data.map((row) => ( 
        <AdminDataTable key={row._id.toString()} row={row} onEdit={() => admin.handleEdit(row._id.toString())}/> ))}>
        <DataModal {...admin.modal} module={module} module_id={module_id}/>
    </AdminTableLayout>
  );
}