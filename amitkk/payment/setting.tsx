"use Client"

import { useState, useEffect, useCallback } from "react";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useTable, emptyRows, AdminTableHead } from "@amitkk/basic/utils/AdminUtils";
import { apiRequest, clo, useTableFilter, withAuth } from "@amitkk/basic/utils/utils";
import DataModal from "@amitkk/payment/admin/setting-modal";
import { AdminDataTable, DataProps } from "@amitkk/payment/admin/admin-setting-table";

export  function AdminSetting(){
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

    const fetchData = useCallback(async () => {
        try {
            const res = await apiRequest("get", `basic/basic?function=get_all_settings`);
            setData(res?.data ?? []);
        } catch (error) { clo( error ); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const updateData = async (i: DataProps) => { setUpdatedDataId(i?._id?.toString()); };

    useEffect(() => {
        if (updatedDataId) {
            const fetchData = async () => {
                try {
                    const res = await apiRequest("get", `basic/basic?function=get_single_setting&id=${updatedDataId}`);
                    const data = res?.data;
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
            };
            fetchData();
        }
    }, [updatedDataId]);

    const dataFiltered = useTableFilter<DataProps>( data, table.order, table.orderBy as keyof DataProps, filterData, ["module"] );
    const handleEdit = (row: DataProps) => { setSelectedDataId(row._id.toString()); setOpen(true); };
    const modalProps = { open, handleClose, selectedDataId, onUpdate: updateData };

    return(
        <AdminTableLayout<DataProps>
            title="Settings" addButtonLabel="New Setting" onAddNew={() => setOpen(true)} filterData={filterData} onFilterData={setFilterData} table={{ ...table, emptyRows: (totalRows: number) => emptyRows(table.page, table.rowsPerPage, totalRows)  }} data={dataFiltered}
            head={
                <AdminTableHead showCheckBox={false} order={table.order} orderBy={table.orderBy} rowCount={dataFiltered.length} numSelected={table.selected.length} onSort={table.onSort} onSelectAllRows={(checked) => table.onSelectAllRows( checked, dataFiltered.map((i) => i._id.toString()) ) }
                headLabel={[
                    { id: "name", label: "Name" },
                    { id: "module", label: "Module" },
                    { id: "module_value", label: "Value" },
                    { id: "status", label: "Status" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ]}/>
            }
            rows={dataFiltered.slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                .map((i) => (
                    <AdminDataTable key={i._id.toString()} row={i} selected={table.selected.includes(i._id.toString())} onSelectRow={() => table.onSelectRow(i._id.toString())} onEdit={handleEdit} showCheckBox={false}/>
                ))}>
            <DataModal {...modalProps} />
        </AdminTableLayout>
    )
}

export default withAuth(AdminSetting);