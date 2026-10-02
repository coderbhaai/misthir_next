"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";
import DataModal from "@amitkk/seller/admin/seller-brand-modal";
import { AdminDataTable } from "@amitkk/seller/admin/seller-product-brand-table";
import { DataProps } from "@amitkk/product/admin/admin-product-brand-table";

export  function AdminProductBrand(){
    const admin =   useAdminPage<DataProps>({ listEndpoint: "product/basic", listFunction: "get_filtered_product_brands", singleFunction: "get_single_product_brand" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "name", label: "Name" },
                    { id: "media", label: "Media" },
                    { id: "status", label: "Status" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Brands" addButtonLabel="New Brand" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminProductBrand;