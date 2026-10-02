"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import DataModal from "@amitkk/basic/admin/newsletter/newsletter-subscriber-modal";
import { AdminDataTable, DataProps } from "@amitkk/basic/admin/newsletter/admin-newsletter-subscriber-table";
import { useAdminPage } from "hooks/useAdminPage";

export function AdminNewsLetterSubscribers(){
    const admin = useAdminPage<DataProps>({ listEndpoint: "basic/basic", listFunction: "get_filtered_newsletter_subscribers", singleFunction: "get_single_newsletter_subscriber" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                        { id: "name", label: "User" },
                        { id: "status", label: "Status" },
                        { id: "", label: "" },
                    ];

    return(
        <>            
            <AdminTableLayout admin={admin} title="NewsLetterSubscribers" addButtonLabel="New NewsLetterSubscriber" filters={FILTER_CONFIG} head={head} 
                rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
                <DataModal {...admin.modal}/>
            </AdminTableLayout>
        </>
    )
}

export default AdminNewsLetterSubscribers;