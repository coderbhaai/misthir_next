"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import DataModal from "@amitkk/basic/admin/comment/comment-modal";
import { AdminDataTable } from "@amitkk/basic/admin/comment/admin-comment-table";
import { useAdminPage } from "hooks/useAdminPage";
import { SingleCommentProps } from "@amitkk/basic/types/shared";

export  function AdminComment(){
    const admin = useAdminPage<SingleCommentProps>({ listEndpoint: "basic/comment", listFunction: "get_filtered_comments", singleFunction: "get_single_comment" });
    
    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-5", },
        { name: "ModuleFilter", grid: "col-span-2", },
        { name: "ModuleIdFilter", grid: "col-span-3", },
        { name: "StatusFilter", grid: "col-span-2", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "model", label: "Module" },
                    { id: "model_id", label: "Model" },
                    { id: "user", label: "User" },
                    { id: "comment", label: "Comment" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Blogs" addButtonLabel="New Blog" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminComment;