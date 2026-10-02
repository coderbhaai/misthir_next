"use client";

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";
import { AdminDataTable, DataProps } from "@amitkk/ecom/admin/admin-bulk-order-table";
import DataModal from "@amitkk/ecom/admin/bulk-order-update-modal";

export function AdminBulkOrders() {
    const admin = useAdminPage<DataProps>({ listEndpoint: "product/product", listFunction: "get_all_bulk_orders", singleFunction: "get_single_bulk_order" });  

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "user", label: "User" },
                    { id: "vendor", label: "Vendor" },
                    { id: "product", label: "Product" },
                    { id: "quantity", label: "Quantity" },
                    { id: "remarks", label: "Remarks" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];

    return (
        <AdminTableLayout admin={admin} title="Bulk Orders" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    );
}

export default AdminBulkOrders;