"use client"

import { useState } from "react";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable, DataProps } from "@amitkk/wishlist/admin/admin-grievance-table";
import DataModal from "@amitkk/wishlist/admin/update-grievance-modal";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminGrievance(){
    const admin =   useAdminPage<DataProps>({
                        listEndpoint: "ecom/ecom", 
                        listFunction: "get_filtered_grievance", singleFunction: "get_single_grievance_by_id",
                    });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-6", },
        { name: "BuyerFilter", grid: "col-span-3", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "Buyer", label: "Buyer" },
                    { id: "Remarks", label: "Remarks" },
                    { id: "Status", label: "Status" },
                    { id: "date", label: "Date" },
                ];

    const [openExport, setOpenExport] = useState(false);
    const handleExportClose = () => { setOpenExport(false); }
    const exportProps = { open: openExport, handleClose: handleExportClose, type: "Admin Wishlist", change_type: false };
    
    return(
        <AdminTableLayout admin={admin} title="Grievances" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminGrievance;