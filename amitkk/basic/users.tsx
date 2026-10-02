"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import UserModal from "@amitkk/basic/admin/spatie/user-modal";
import { AdminDataTable } from "@amitkk/basic/admin/spatie/admin-user-table";
import { useAdminPage } from "hooks/useAdminPage";
import type { UserProps } from '@amitkk/basic/types/user';

export function AdminUsers() {
  const admin = useAdminPage<UserProps>({ listEndpoint: "basic/spatie", listFunction: "get_filtered_users", singleFunction: "get_single_user" });

  const FILTER_CONFIG = [
    { name: "SearchFilter", grid: "col-span-4", },
    { name: "RoleFilter", grid: "col-span-3", },
    { name: "PermissionFilter", grid: "col-span-3", },
    { name: "StatusFilter", grid: "col-span-2", },
  ] as const;

  const head: { id: string; label: string }[] = [
              { id: "name", label: "Name" },
              { id: "email", label: "Email" },
              { id: "phone", label: "Phone" },
              { id: "role", label: "Role" },
              { id: "permission", label: "Permissions" },
              { id: "", label: "" },
          ];

  return (
    <AdminTableLayout admin={admin} title="Users" addButtonLabel="New User" filters={FILTER_CONFIG} head={head} 
        rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onEdit={(row) => admin.handleEdit(row?._id?.toString())}/> ))}>
        <UserModal {...admin.modal} handleUpdate={async () => { await admin.fetchData(); }} fixedRole={false}/>
    </AdminTableLayout>
  );
}

export default AdminUsers;