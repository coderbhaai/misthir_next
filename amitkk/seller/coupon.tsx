"use client";

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";
import { AdminDataTable, DataProps } from "@amitkk/seller/admin/seller-coupon-table";

export function SellerCoupons() {
    const admin = useAdminPage<DataProps>({ listEndpoint: "ecom/coupon", listFunction: "get_all_coupons", addRoute: "/seller/add-update-coupon" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "coupon", label: "Coupon" },
                    { id: "validity", label: "Validity" },
                    { id: "media", label: "Media" },
                    { id: "discount", label: "Discount" },
                    { id: "status", label: "Status" },
                    { id: "remarks", label: "Remarks" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];

    return (
        <AdminTableLayout admin={admin} title="Coupons" addButtonLabel="New Coupon" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
        </AdminTableLayout>
    );
}

export default SellerCoupons;