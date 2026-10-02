"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable, DataProps } from "@amitkk/coupon/admin/admin-coupon-table";
import { useAdminPage } from "hooks/useAdminPage";

export  function AdminCoupon(){
    const admin =   useAdminPage<DataProps>({ listEndpoint: "ecom/coupon", listFunction: "get_filtered_coupon", addRoute: "/admin/add-update-coupon" });

    const FILTER_CONFIG = [
        { name: "UserFilter", grid: "col-span-3", props: { role: ["Seller"] } },
        { name: "SearchFilter", grid: "col-span-6", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "Seller", label: "Seller" },
                    { id: "type", label: "Type" },
                    { id: "name", label: "Name" },
                    { id: "url", label: "URL" },
                    { id: "meta", label: "Meta" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Coupons" addButtonLabel="New Coupon" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
        </AdminTableLayout>
    )
}

export default AdminCoupon;