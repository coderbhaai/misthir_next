"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable, DataProps } from "@amitkk/wishlist/admin/admin-order-guide-table";
import { useAdminPage } from "hooks/useAdminPage";

export  function AdminOrderGuide(){
    const admin =   useAdminPage<DataProps>({ listEndpoint: "ecom/wishlist", listFunction: "get_filtered_order_guides" });

   const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "BuyerFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "name", label: "Name" },
                    { id: "Items", label: "Items" },
                    { id: "Date", label: "Date" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Order Guides" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
        </AdminTableLayout>
    )
}

export default AdminOrderGuide;