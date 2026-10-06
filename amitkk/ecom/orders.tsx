"use client";

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable } from "@amitkk/ecom/admin/admin-order-table";
import { useAdminPage } from "hooks/useAdminPage";
import { OrderProps } from "@amitkk/ecom/types";

export function AdminOrders() {
    const admin = useAdminPage<OrderProps>({ listEndpoint: "ecom/ecom", listFunction: "get_all_orders" });  

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "user", label: "User" },
                    { id: "total", label: "Payment" },
                    { id: "sku", label: "Products" },
                    { id: "charges", label: "Charges" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];

    return (
        <AdminTableLayout admin={admin} title="My Orders" viewMode="grid" showViewModeSwitch={true} filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: OrderProps) => ( <AdminDataTable key={String(i._id)} row={i}/> ))}>
        </AdminTableLayout>
    );
}

export default AdminOrders;