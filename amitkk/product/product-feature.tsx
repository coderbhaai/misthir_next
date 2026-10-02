"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";
import DataModal from "@amitkk/product/admin/product-feature-modal";
import { AdminDataTable, DataProps } from "@amitkk/product/admin/admin-product-feature-table";

export  function AdminProductFeature(){
    const admin =   useAdminPage<DataProps>({ listEndpoint: "product/basic", listFunction: "get_filtered_product_features", singleFunction: "get_single_product_feature" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "Module", label: "Module" },
                    { id: "name", label: "Name" },
                    { id: "url", label: "URL" },
                    { id: "meta", label: "Meta" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Features" addButtonLabel="New Feature" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminProductFeature;