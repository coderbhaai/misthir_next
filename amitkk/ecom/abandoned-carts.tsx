"use client";

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable, DataProps } from "@amitkk/ecom/admin/admin-abandoned-cart-table";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminAbandonedCart() {
    const admin = useAdminPage<DataProps>({ listEndpoint: "ecom/ecom", listFunction: "get_filtered_abandoned_carts" });   

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "user", label: "User" },
                    { id: "total", label: "Payment" },
                    { id: "sku", label: "Products" },
                    { id: "charges", label: "Charges" },
                    { id: "Coupon", label: "Coupon" },
                    { id: "", label: "" },
                ];

    return (
        <AdminTableLayout admin={admin} title="Abandoned Cart" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i}/> ))}>
        </AdminTableLayout>
    );
}

export default AdminAbandonedCart;