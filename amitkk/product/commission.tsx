"use client"

import { useState, useEffect, useCallback } from "react";
import { useTable, emptyRows, AdminTableHead } from "@amitkk/basic/utils/AdminUtils";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useTableFilter, apiRequest, clo, withAuth } from "@amitkk/basic/utils/utils";
import router from "next/router";
import DataModal from "@amitkk/product/admin/commission-modal";
import { AdminDataTable, DataProps } from "@amitkk/product/admin/admin-commission-table";

interface AdminCommissionProps {
  vendor_id?: string;
}

export default function AdminCommission({ vendor_id = "" }: AdminCommissionProps) {
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
    const [title, setTitle] = useState<string>("All Commissions");
    const [vendor, setVendor] = useState("");

    const updateData = async (i: DataProps) => { setUpdatedDataId(i?._id?.toString()); };
    const dataFiltered = useTableFilter<DataProps>( data, table.order, table.orderBy as keyof DataProps, filterData, ["percentage"] );
    const modalProps = { open, handleClose, selectedDataId, onUpdate: updateData, vendor_id };
    const handleEdit = (row: DataProps) => { setSelectedDataId(row._id.toString()); setOpen(true); };

    const fetchData = useCallback(async () => {
        try {
            let apiFunction = `get_all_commissions`;
            if (vendor_id) {
                const isValidModuleId = typeof vendor_id === "string" && vendor_id.trim().length > 0;

                if (isValidModuleId) {
                    apiFunction = `get_all_commissions&vendor_id=${encodeURIComponent(vendor_id)}`;
                } else {
                    router.push('/404');
                }
                             
                const res_2 = await apiRequest("get", `basic/spatie?function=get_single_user&id=${encodeURIComponent(vendor_id)}`);
                setVendor(res_2?.data);
                if( res_2?.data ){
                    setTitle(`Commission For ${res_2?.data?.name}`);
                }
            }

            const res_1 = await apiRequest("get", `product/basic?function=${apiFunction}`);
            setData(res_1?.data ?? []);


        } catch (error) { clo( error ); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (updatedDataId) {
            const fetchSingleData = async () => {
                try {
                    const res = await apiRequest("get", `product/basic?function=get_single_commission&id=${updatedDataId}`);
                    const data = res?.data;
                    if (!data || !data._id) { clo("Invalid data received:", data); await fetchSingleData(); return; }

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
            
            fetchSingleData();
        }
    }, [updatedDataId]);
    
    return(
        <AdminTableLayout<DataProps>
            title={title} addButtonLabel="New Commission" onAddNew={() => setOpen(true)} filterData={filterData} onFilterData={setFilterData} table={{ ...table, emptyRows: (totalRows: number) => emptyRows(table.page, table.rowsPerPage, totalRows)  }} data={dataFiltered}
            head={
                <AdminTableHead showCheckBox={false} order={table.order} orderBy={table.orderBy} rowCount={dataFiltered.length} numSelected={table.selected.length} onSort={table.onSort} onSelectAllRows={(checked) => table.onSelectAllRows( checked, dataFiltered.map((i) => i._id.toString()) ) }
                headLabel={[
                    { id: "type", label: "Type" },
                    { id: "vendor", label: "Vendor" },
                    { id: "commission", label: "commission" },
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