"use client";

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable, DataProps } from "@amitkk/sales/admin/admin-sales-table";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminSales() {
    const admin = useAdminPage<DataProps>({ listEndpoint: "ecom/sales", listFunction: "get_filtered_sales", addRoute: "/admin/add-update-sales" });  

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "Seller", label: "Seller" },
                    { id: "name", label: "Name" },
                    { id: "validity", label: "Validity" },
                    { id: "discount", label: "Discount" },
                    { id: "", label: "" },
                ];

    return (
        <AdminTableLayout admin={admin} title="Sales" addButtonLabel="New Sale" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i}/> ))}>
        </AdminTableLayout>
    );
}

export default AdminSales;