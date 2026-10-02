"use client"

import DataModal from "@amitkk/basic/admin/review/review-modal";
import { AdminDataTable, DataProps } from "@amitkk/basic/admin/review/admin-review-table";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminReviews(){
    const admin = useAdminPage<DataProps>({ listEndpoint: "basic/review", listFunction: "get_filtered_reviews", singleFunction: "get_single_review" });

    const FILTER_CONFIG = [
      { name: "SearchFilter", grid: "col-span-5", },
      { name: "ModuleFilter", grid: "col-span-2", },
      { name: "ModuleIdFilter", grid: "col-span-3", },
      { name: "StatusFilter", grid: "col-span-2", },
  ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "module", label: "Module" },
                    { id: "module_id", label: "Module Id" },
                    { id: "review", label: "Review" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Reviews" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminReviews;