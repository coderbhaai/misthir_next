import { useState, useEffect, useCallback } from "react";
import { useTable, AdminTableHead, emptyRows } from "@amitkk/basic/utils/AdminUtils";
import { apiRequest, clo, useTableFilter, Iconify, withAuth } from "@amitkk/basic/utils/utils";
import { AdminDataTable, DataProps } from "@amitkk/product/seller/components/seller-product-table";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useRouter } from "next/router";
import { useVendorId } from "hooks/useVendorId";

export function SellerProducts(){
    const vendor_id = useVendorId();
    const router = useRouter();
    const showCheckBox = false;
    const table = useTable();
    const setOpen = () =>{
        router.push('/admin/seller/add-update-product');
    }
    const [data, setData] = useState<DataProps[]>([]);
    const [filterData, setFilterData] = useState("");
    const dataFiltered = useTableFilter<DataProps>( data, table.order, table.orderBy as keyof DataProps, filterData, ["name"] );

    const fetchData = useCallback(async () => {
        try {
            const res = await apiRequest("get", "product/product?function=get_all_products");
            setData(res?.data ?? []);
        } catch (error) { clo( error ); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);
    
    return(
        <AdminTableLayout<DataProps>
            title="Products" addButtonLabel="New Product" onAddNew={setOpen} filterData={filterData} onFilterData={setFilterData} table={{ ...table, emptyRows: (totalRows: number) => emptyRows(table.page, table.rowsPerPage, totalRows)  }} data={dataFiltered}
            head={
                <AdminTableHead showCheckBox={false} order={table.order} orderBy={table.orderBy} rowCount={dataFiltered.length} numSelected={table.selected.length} onSort={table.onSort} onSelectAllRows={(checked) => table.onSelectAllRows( checked, dataFiltered.map((i) => i._id.toString()) ) }
                headLabel={[
                    { id: "name", label: "Name" },
                    { id: "media", label: "Media" },
                    { id: "tags", label: "Tags" },
                    { id: "author", label: "Author" },
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

export default withAuth(SellerProducts);