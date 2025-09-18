"use client"

import { useState, useEffect, useCallback } from "react";
import { AdminDataTable, DataProps } from "@amitkk/ecom/admin/admin-sales-table";
import { useTable, emptyRows, AdminTableHead } from "@amitkk/basic/utils/AdminUtils";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useTableFilter, apiRequest, clo, withAuth } from "@amitkk/basic/utils/utils";
import router from "next/router";

export function AdminSales(){
    const showCheckBox = false;
    const table = useTable();
    const [data, setData] = useState<DataProps[]>([]);
    const [filterData, setFilterData] = useState("");
    const dataFiltered = useTableFilter<DataProps>( data, table.order, table.orderBy as keyof DataProps, filterData, ["name"] );

    const initData = useCallback(async () => {
        try {
            const res_1 = await apiRequest("get", `ecom/sales?function=get_all_sales`);
            setData(res_1?.data ?? []);

        } catch (error) { clo( error ); }
    }, []);

   useEffect(() => { initData(); }, []);
    
    return(
        <AdminTableLayout<DataProps>
            title="Sales" addButtonLabel="New Sale" onAddNew={() => router.push("/seller/add-update-sales")}  filterData={filterData} onFilterData={setFilterData} table={{ ...table, emptyRows: (totalRows: number) => emptyRows(table.page, table.rowsPerPage, totalRows)  }} data={dataFiltered}
            head={
                <AdminTableHead showCheckBox={false} order={table.order} orderBy={table.orderBy} rowCount={dataFiltered.length} numSelected={table.selected.length} onSort={table.onSort} onSelectAllRows={(checked) => table.onSelectAllRows( checked, dataFiltered.map((i) => i._id.toString()) ) }
                headLabel={[
                    { id: "vendor", label: "Vendor" },
                    { id: "name", label: "Name" },
                    { id: "validity", label: "Validity" },
                    { id: "discount", label: "Discount" },
                    { id: "product", label: "Products" },
                    { id: "status", label: "Status" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ]}/>
            }
            rows={dataFiltered.slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                .map((i) => (
                    <AdminDataTable key={i._id.toString()} row={i} selected={table.selected.includes(i._id.toString())} onSelectRow={() => table.onSelectRow(i._id.toString())} showCheckBox={false}/>
                ))}>
        </AdminTableLayout>
    )
}

export default withAuth(AdminSales);