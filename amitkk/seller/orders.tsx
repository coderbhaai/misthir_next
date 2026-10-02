"use client";

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";
import { AdminDataTable, DataProps } from "@amitkk/ecom/admin/admin-order-table";

export function SellerOrders() {
    const admin = useAdminPage<DataProps>({ listEndpoint: "ecom/ecom", listFunction: "get_seller_orders" });   

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "name", label: "Name" },
                    { id: "media", label: "Media" },
                    { id: "tags", label: "Tags" },
                    { id: "author", label: "Author" },
                    { id: "meta", label: "Meta" },
                    { id: "", label: "" },
                ];

    return (
        <AdminTableLayout admin={admin} title="Orders" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i}/> ))}>
        </AdminTableLayout>
    );
}

export default SellerOrders;