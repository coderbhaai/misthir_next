"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import DataModal from "@amitkk/blocks/admin/generic-block-modal";
import { AdminDataTable } from "@amitkk/blocks/admin/admin-generic-block-table";
import { useAdminPage } from "hooks/useAdminPage";
import type { SingleGenericBlockProps } from '@amitkk/blocks/types';

export function AdminGenericBlock(){
    const admin = useAdminPage<SingleGenericBlockProps>({ listEndpoint: "block/genericBlock", listFunction: "get_filtered_generic_blocks", singleFunction: "get_single_generic_block" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-4", },
        { name: "ModuleFilter", grid: "col-span-2", },
        { name: "ModuleIdFilter", grid: "col-span-2", },
        { name: "BlockFilter", grid: "col-span-2", },
        { name: "StatusFilter", grid: "col-span-2", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "module", label: "Module" },
                    { id: "name", label: "Name" },
                    { id: "block_id", label: "Block" },
                    { id: "heading", label: "Heading" },
                    { id: "media", label: "Media" },
                    { id: "", label: "" },
                ];
    
    return(
        <AdminTableLayout admin={admin} title="Generic Bock" addButtonLabel="New Generic Block" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
            <DataModal {...admin.modal}/>
        </AdminTableLayout>
    )
}

export default AdminGenericBlock;