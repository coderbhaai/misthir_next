"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import DataModal from "@amitkk/basic/admin/contact/contact-modal";
import { AdminDataTable, DataProps } from "@amitkk/basic/admin/contact/admin-contact-table";
import { useAdminPage } from "hooks/useAdminPage";
import { AdminTableActions } from "./static/AdminTableActions";

export function AdminContact(){
    const admin = useAdminPage<DataProps>({ listEndpoint: "basic/basic", listFunction: "get_filtered_contacts", singleFunction: "get_single_contact" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                        { id: "name", label: "User" },
                        { id: "status", label: "Status" },
                        { id: "remarks", label: "Remarks" },
                        { id: "date", label: "Date" },
                        { id: "", label: "" },
                    ];
    return(
        <>            
            <AdminTableLayout admin={admin} title="Contacts" filters={FILTER_CONFIG} head={head} 
                rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}
                actionsAboveFilters={
                    <AdminTableActions admin={admin} module="Contact"/>
                }>
                <DataModal {...admin.modal}/>
            </AdminTableLayout>
        </>
    )
}

export default AdminContact;