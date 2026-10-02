"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import DataModal from "@amitkk/product/admin/product-meta-modal";
import { AdminDataTable, DataProps } from "@amitkk/product/admin/admin-product-meta-table";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminProductMeta(){
    const admin =   useAdminPage<DataProps>({
                        listEndpoint: "product/basic", listFunction: "get_filtered_product_meta", singleFunction: "get_single_product_meta" });

    const FILTER_CONFIG = [
        { name: "GenericFilter", grid: "col-span-3", props: { preset: "product_meta_filter" } },
        { name: "SearchFilter", grid: "col-span-6", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "Module", label: "Module" },
                    { id: "name", label: "Name" },
                    { id: "parent", label: "Parent" },
                    { id: "media", label: "Media" },
                    { id: "meta", label: "Meta" },
                    { id: "Highlight", label: "Highlight" },
                    { id: "status", label: "Status" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Product Metas" addButtonLabel="New Product Meta" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminProductMeta;