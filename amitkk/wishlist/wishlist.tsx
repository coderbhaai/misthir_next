"use client"

import { useState } from "react";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable, DataProps } from "@amitkk/wishlist/admin/admin-wishlist-table";
import { Button } from "@amitkk/components/button/button";
import { useAdminPage } from "hooks/useAdminPage";
import ExportModal from "@amitkk/basic/admin/excel/export-modal";

export function AdminWishlit(){
    const admin =   useAdminPage<DataProps>({ listEndpoint: "ecom/wishlist", listFunction: "get_filtered_wishlist" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "user", label: "User" },
                    { id: "Product", label: "Product" },
                    { id: "Remarks", label: "Remarks" },
                    { id: "date", label: "Date" },
                    { id: "Status", label: "Status" },
                ];

    const [openExport, setOpenExport] = useState(false);
    const handleExportClose = () => { setOpenExport(false); }
    const exportProps = { open: openExport, handleClose: handleExportClose, type: "Admin Wishlist", change_type: false };
    
    return(
        <AdminTableLayout admin={admin} title="Wishlists" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i}/> ))}actionsAboveFilters={
                <>
                    <Button className="w-fit" onClick={() => setOpenExport(true)}>Export</Button>
                </>
            }>
            <ExportModal {...exportProps}/>
        </AdminTableLayout>
    )
}

export default AdminWishlit;