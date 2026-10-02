"use client";

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";
import { AdminDataTable, DataProps } from "@amitkk/blog/admin/admin-blog-table";
import { useAdminModal } from "hooks/useAdminModal";
import KeywordManager from "@amitkk/seo/admin/keyword/KeywordManager";

export function AdminBlog() {
    const admin = useAdminPage<DataProps>({ listEndpoint: "blog/blogs", listFunction: "get_filtered_blogs", addRoute: "/admin/add-update-blog" });    
    const keywordModal = useAdminModal({ onUpdate: admin.refreshSingle });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "name", label: "Name" },
                    { id: "media", label: "Media" },
                    { id: "tags", label: "Tags" },
                    { id: "author", label: "Author" },
                    { id: "meta", label: "Meta" },
                    { id: "", label: "" },
                ];

    return (
        <AdminTableLayout admin={admin} title="Blogs" addButtonLabel="New Blog" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i}/> ))}>
            <KeywordManager module="Blog" modal={keywordModal}/>
        </AdminTableLayout>
    );
}

export default AdminBlog;