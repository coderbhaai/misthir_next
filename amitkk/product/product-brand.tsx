"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";
import DataModal from "@amitkk/product/admin/product-brand-modal";
import { AdminDataTable, DataProps } from "@amitkk/product/admin/admin-product-brand-table";

export  function AdminProductBrand(){
    const admin =   useAdminPage<DataProps>({ listEndpoint: "product/basic", listFunction: "get_filtered_product_brands", singleFunction: "get_single_product_brand" });

    const FILTER_CONFIG = [
        { name: "UserFilter", grid: "col-span-3", props: { role: ["Seller"] } },
        { name: "SearchFilter", grid: "col-span-6", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "name", label: "Name" },
                    { id: "Seller", label: "Seller" },
                    { id: "media", label: "Media" },
                    { id: "meta", label: "Meta" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Product Brands" addButtonLabel="New Brand" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminProductBrand;