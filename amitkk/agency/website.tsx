"use client"
import { useState, useEffect, useCallback } from "react";
import { useTable, emptyRows, AdminTableHead } from "@amitkk/basic/utils/AdminUtils";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useTableFilter, apiRequest, clo, withAuth } from "@amitkk/basic/utils/utils";
import DataModal from "@amitkk/agency/admin/website-modal";
import { AdminDataTable, DataProps } from "@amitkk/agency/admin/admin-website-table";

export function AdminWebsite(){
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
    const [clientOptions, setClientOptions] = useState<{_id: string; name: string}[]>([]);

    const updateData = async (i: DataProps) => { setUpdatedDataId(i?._id?.toString()); };
    const dataFiltered = useTableFilter<DataProps>( data, table.order, table.orderBy as keyof DataProps, filterData, ["url"] );
    const modalProps = { open, handleClose, selectedDataId, onUpdate: updateData, clientOptions };
    const handleEdit = (row: DataProps) => { setSelectedDataId(row._id.toString()); setOpen(true); };

    const fetchData = useCallback(async () => {
        try {
            const res_1 = await apiRequest("get", "agency/portfolio?function=get_all_websites");
            setData(res_1?.data);

            const res_2 = await apiRequest("get", "basic/basic?function=get_all_client_options");
            setClientOptions(res_2?.data);
        } catch (error) { clo( error ); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (updatedDataId) {
            const fetchData = async () => {
                try {
                    const res = await apiRequest("get", `agency/portfolio?function=get_single_website&id=${updatedDataId}`);
                    const data = res?.data;

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
    
    return(
        <AdminTableLayout<DataProps>
            title="Websites" addButtonLabel="New Website" onAddNew={() => setOpen(true)} filterData={filterData} onFilterData={setFilterData} table={{ ...table, emptyRows: (totalRows: number) => emptyRows(table.page, table.rowsPerPage, totalRows)  }} data={dataFiltered}
            head={
                <AdminTableHead showCheckBox={false} order={table.order} orderBy={table.orderBy} rowCount={dataFiltered.length} numSelected={table.selected.length} onSort={table.onSort} onSelectAllRows={(checked) => table.onSelectAllRows( checked, dataFiltered.map((i) => i._id.toString()) ) }
                headLabel={[
                    { id: "client", label: "Client" },
                    { id: "url", label: "URL" },
                    { id: "media", label: "Media" },
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

export default withAuth(AdminWebsite);