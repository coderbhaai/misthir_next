"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";
import DataModal from "@amitkk/product/admin/product-ingridient-modal";
import { AdminDataTable } from "@amitkk/product/admin/admin-product-ingridient-table";
import { IngridientProps } from "@amitkk/product/types";

export  function AdminIngridient(){
    const admin =   useAdminPage<IngridientProps>({ listEndpoint: "product/basic", listFunction: "get_filtered_product_ingridients", singleFunction: "get_single_product_ingridient" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "name", label: "Name" },
                    { id: "media", label: "Media" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Ingridients" addButtonLabel="New Ingridient" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: IngridientProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminIngridient;