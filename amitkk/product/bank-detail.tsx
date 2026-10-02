"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";
import DataModal from "@amitkk/product/admin/bank-detail-modal";
import { AdminDataTable, DataProps } from "@amitkk/product/admin/admin-bank-detail-table";

export  function AdminBankDetail(){
    const admin =   useAdminPage<DataProps>({ listEndpoint: "payment/document", listFunction: "get_filtered_bank_details", singleFunction: "get_single_bank_detail" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "vendor", label: "Vendor" },
                    { id: "account", label: "Account" },
                    { id: "ifsc", label: "IFSC" },
                    { id: "branch", label: "Branch" },
                    { id: "bank", label: "Bank" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Bank Details" addButtonLabel="New Bank Detail" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminBankDetail;