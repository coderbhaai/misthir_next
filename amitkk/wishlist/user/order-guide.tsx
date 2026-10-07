"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable } from "@amitkk/wishlist/user/admin/admin-order-guide-table";
import { useAdminPage } from "hooks/useAdminPage";
import OrderGuideModal from "@amitkk/wishlist/static/OrderGuideModal";
import { OrderGuideProps } from "../types";

export  function AdminOrderGuide(){
    const admin =   useAdminPage<OrderGuideProps>({ listEndpoint: "ecom/wishlist", listFunction: "get_filtered_order_guides" });

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
        <AdminTableLayout admin={admin} title="Order Guides" viewMode="grid" showViewModeSwitch={true} filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: OrderGuideProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <OrderGuideModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminOrderGuide;