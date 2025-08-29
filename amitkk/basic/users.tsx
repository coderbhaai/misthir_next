import { useState, useEffect, useCallback } from "react";
import { useTable, emptyRows, AdminTableHead } from "@amitkk/basic/utils/AdminUtils";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useTableFilter, apiRequest, clo } from "@amitkk/basic/utils/utils";
import DataModal from "@amitkk/basic/components/spatie/user-modal";
import { AdminDataTable, DataProps } from "@amitkk/basic/components/spatie/admin-user-table";

export function AdminUsers() {
  const [roles, setRoles] = useState<{_id: string; name: string}[]>([]);
  const [permissions, setPermissions] = useState<{_id: string; name: string}[]>([]);
  
  const showCheckBox = false;
  const table = useTable();
  const [open, setOpen] = useState(false);

  const handleClose = () => {
      setOpen(false);
      setSelectedDataId(null);
      setUpdatedDataId(null);
  }
  const [data, setData] = useState<DataProps[]>([]);
  const [selectedDataId, setSelectedDataId] = useState<string | number | null>(null);
  const [updatedDataId, setUpdatedDataId] = useState<string | number | null>(null);
  const [filterData, setFilterData] = useState("");
  const updateData = async (i: DataProps) => { setUpdatedDataId(i?._id?.toString()); };
  const dataFiltered = useTableFilter<DataProps>( data, table.order, table.orderBy as keyof DataProps, filterData, ["name"] );
  const modalProps = { open, handleClose, selectedDataId, onUpdate: updateData, roles, permissions };
  const handleEdit = (row: DataProps) => { setSelectedDataId(row._id.toString()); setOpen(true); };

  const fetchData = useCallback(async () => {
    try {
      const res_1 = await apiRequest("get", `basic/spatie?function=get_all_users`);
      setData(res_1?.data ?? []);

      const res_2 = await apiRequest("get", `basic/spatie?function=get_all_roles`);
      setRoles(res_2?.data ?? []);

      const res_3 = await apiRequest("get", `basic/spatie?function=get_all_permissions`);
      setPermissions(res_3?.data ?? []);
    } catch (error) { clo( error ); }
  }, []);  

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    if (updatedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("get", `basic/spatie?function=get_single_user&id=${updatedDataId}`);
          const data    = res?.data
          if (!data || !data._id) { clo("Invalid data received:", data); await fetchData(); return; }

          setData((prevData = []) => {
              const exists = prevData.some(i => String(i._id) === String(data._id));

              return exists 
                  ? prevData?.map((i) => 
                      String(i._id) === String(data._id) ? { ...i, ...data } : i
                  )
                  : [...prevData, data];
          });
          handleClose();
        } catch (error) { clo( error ); }

        setUpdatedDataId(null);
      };

      fetchData();
    }
  }, [updatedDataId]);

  return (
    <AdminTableLayout<DataProps>
      title="Roles" addButtonLabel="New Role" onAddNew={() => setOpen(true)} filterData={filterData} onFilterData={setFilterData} table={{ ...table, emptyRows: (totalRows: number) => emptyRows(table.page, table.rowsPerPage, totalRows)  }} data={dataFiltered}
      head={
          <AdminTableHead showCheckBox={false} order={table.order} orderBy={table.orderBy} rowCount={dataFiltered.length} numSelected={table.selected.length} onSort={table.onSort} onSelectAllRows={(checked) => table.onSelectAllRows( checked, dataFiltered.map((i) => i._id.toString()) ) }
          headLabel={[
              { id: "name", label: "Name" },
              { id: "email", label: "Email" },
              { id: "phone", label: "Phone" },
              { id: "role", label: "Role" },
              { id: "permission", label: "Permissions" },
              { id: "date", label: "Date" },
              { id: "status", label: "Status" },
              { id: "", label: "" },
          ]}/>
      }
      rows={dataFiltered.slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
          .map((i) => (
              <AdminDataTable key={i._id.toString()} row={i} selected={table.selected.includes(i._id.toString())} onSelectRow={() => table.onSelectRow(i._id.toString())} onEdit={handleEdit} showCheckBox={false}/>
          ))}>
      <DataModal {...modalProps} />
  </AdminTableLayout>
  );
}

export default AdminUsers;
// export default withAuth(AdminUsers);