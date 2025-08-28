import { useTable, emptyRows, AdminTableHead } from "@amitkk/basic/utils/AdminUtils";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useTableFilter, apiRequest, clo, withAuth } from "@amitkk/basic/utils/utils";
import { useRouter } from "next/router";
import { useState, useEffect, useCallback } from "react";
import { AdminDataTable, DataProps } from "@amitkk/basic/components/page/admin-page-table";

export function AdminPages(){
    const router = useRouter();
    const showCheckBox = false;
    const table = useTable();
    const setOpen = () =>{ router.push('/admin/add-update-page'); }
    const [data, setData] = useState<DataProps[]>([]);
    const [filterData, setFilterData] = useState("");
    const dataFiltered = useTableFilter<DataProps>( data, table.order, table.orderBy as keyof DataProps, filterData, ["name"] );

    const fetchData = useCallback(async () => {
        try {
            const res = await apiRequest("get", "basic/page?function=get_all_pages");
            setData(res?.data);
        } catch (error) { clo( error ); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);
    return(
        <AdminTableLayout<DataProps>
            title="Pages" addButtonLabel="New Page" onAddNew={setOpen} filterData={filterData} onFilterData={setFilterData} table={{ ...table, emptyRows: (totalRows: number) => emptyRows(table.page, table.rowsPerPage, totalRows)  }} data={dataFiltered}
            head={
                <AdminTableHead showCheckBox={false} order={table.order} orderBy={table.orderBy} rowCount={dataFiltered.length} numSelected={table.selected.length} onSort={table.onSort} onSelectAllRows={(checked) => table.onSelectAllRows( checked, dataFiltered.map((i) => i._id.toString()) ) }
                headLabel={[
                    { id: "name", label: "Name" },
                    { id: "media", label: "Media" },
                    { id: "status", label: "SSS" },
                    { id: "meta", label: "Meta" },
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
export default withAuth(AdminPages);