"use Client"

import { useState, useEffect, useCallback } from "react";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useTable, emptyRows, AdminTableHead } from "@amitkk/basic/utils/AdminUtils";
import { apiRequest, clo, useTableFilter, withAuth } from "@amitkk/basic/utils/utils";
import { AdminDataTable, DataProps } from "@amitkk/payment/admin/admin-tax-collected-table";
import router from "next/router";

export  function AdminTaxCollected(){
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
            const res = await apiRequest("get", `payment/payment?function=get_all_tax_collected`);
            setData(res?.data ?? []);
        } catch (error) { clo( error ); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const updateData = async (i: DataProps) => { setUpdatedDataId(i?._id?.toString()); };

    const dataFiltered = useTableFilter<DataProps>( data, table.order, table.orderBy as keyof DataProps, filterData, ["module"] );
    const handleEdit = (row: DataProps) => { 
        localStorage.setItem("order_id", row?._id as string);
        window.open("/order", "_blank");
    };

    const modalProps = { open, handleClose, selectedDataId, onUpdate: updateData };

    return(
        <AdminTableLayout<DataProps>
            title="Taxes" addButtonLabel="New Tax" onAddNew={() => setOpen(true)} filterData={filterData} onFilterData={setFilterData} table={{ ...table, emptyRows: (totalRows: number) => emptyRows(table.page, table.rowsPerPage, totalRows)  }} data={dataFiltered}
            head={
                <AdminTableHead showCheckBox={false} order={table.order} orderBy={table.orderBy} rowCount={dataFiltered.length} numSelected={table.selected.length} onSort={table.onSort} onSelectAllRows={(checked) => table.onSelectAllRows( checked, dataFiltered.map((i) => i._id.toString()) ) }
                headLabel={[
                    { id: "module", label: "Module" },
                    { id: "cgst", label: "CGST" },
                    { id: "sgst", label: "SGST" },
                    { id: "sgst", label: "IGST" },
                    { id: "total", label: "Total" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ]}/>
            }
            rows={dataFiltered.slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                .map((i) => (
                    <AdminDataTable key={i._id.toString()} row={i} selected={table.selected.includes(i._id.toString())} onSelectRow={() => table.onSelectRow(i._id.toString())} onEdit={handleEdit} showCheckBox={false}/>
                ))}>
        </AdminTableLayout>
    )
}

export default withAuth(AdminTaxCollected);