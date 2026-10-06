"use client";

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable } from "@amitkk/wishlist/user/admin/admin-wishlist-table";
import { useAdminPage } from "hooks/useAdminPage";
import { WishlistProps } from "@amitkk/wishlist/types";

export function UserWishlist() {
    const admin =   useAdminPage<WishlistProps>({ listEndpoint: "ecom/wishlist", listFunction: "get_filtered_wishlist" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "Products", label: "Products" },
                    { id: "Remarks", label: "Remarks" },
                    { id: "Status", label: "Status" },
                    { id: "date", label: "Date" },
                ];

    return (
        <AdminTableLayout admin={admin} title="Wishlist" viewMode="grid" showViewModeSwitch={true} filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: WishlistProps) => ( <AdminDataTable key={String(i._id)} row={i}/> ))}>
        </AdminTableLayout>
    );
}

export default UserWishlist;