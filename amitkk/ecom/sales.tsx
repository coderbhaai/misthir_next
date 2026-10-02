"use client";

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable, DataProps } from "@amitkk/ecom/admin/admin-abandoned-cart-table";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminSales() {
    const admin = useAdminPage<DataProps>({ listEndpoint: "ecom/sales", listFunction: "get_all_sales", addRoute: "/seller/add-update-sales" });  

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "vendor", label: "Vendor" },
                    { id: "name", label: "Name" },
                    { id: "validity", label: "Validity" },
                    { id: "discount", label: "Discount" },
                    { id: "product", label: "Products" },
                    { id: "status", label: "Status" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];

    return (
        <AdminTableLayout admin={admin} title="Sales" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i}/> ))}>
        </AdminTableLayout>
    );
}

export default AdminSales;