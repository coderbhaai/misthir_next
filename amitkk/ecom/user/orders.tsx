"use client";

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";
import { AdminDataTable } from "@amitkk/ecom/user/admin/user-order-table";
import { OrderProps } from "../types";

export function UserOrders() {
    const admin = useAdminPage<OrderProps>({ listEndpoint: "ecom/ecom", listFunction: "get_user_orders" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "sku", label: "Products" },
                    { id: "total", label: "Payment" },
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

export default UserOrders;