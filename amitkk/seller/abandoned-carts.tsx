import { useState, useEffect, useCallback } from "react";
import { useTable, AdminTableHead, emptyRows } from "@amitkk/basic/utils/AdminUtils";
import { apiRequest, clo, useTableFilter, withAuth } from "@amitkk/basic/utils/utils";
import { AdminDataTable, DataProps } from "@amitkk/seller/admin/seller-abandoned-cart-table";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useRouter } from "next/router";
import { useVendorId } from "hooks/useVendorId";

export function SellerAbandonedCart(){
    const vendor_id = useVendorId();
    const router = useRouter();
    const showCheckBox = false;
    const table = useTable();
    const setOpen = () =>{
        router.push('/shop');
    }
    const [data, setData] = useState<DataProps[]>([]);
    const [filterData, setFilterData] = useState("");
    const dataFiltered = useTableFilter<DataProps>( data, table.order, table.orderBy as keyof DataProps, filterData, ["total"] );

    const initData = useCallback(async () => {
        try {
            const res = await apiRequest("get", `ecom/ecom?function=get_vendor_abandoned_carts&vendor_id=${vendor_id}`);
            setData(res?.data ?? []);
        } catch (error) { clo( error ); }
    }, []);
    useEffect(() => { if (!vendor_id) return; initData(); }, [vendor_id]);
    
    return(
        <AdminTableLayout<DataProps>
            title="Abandoned Cart" addButtonLabel="Shop Page" onAddNew={setOpen} filterData={filterData} onFilterData={setFilterData} table={{ ...table, emptyRows: (totalRows: number) => emptyRows(table.page, table.rowsPerPage, totalRows)  }} data={dataFiltered}
            head={
                <AdminTableHead showCheckBox={false} order={table.order} orderBy={table.orderBy} rowCount={dataFiltered.length} numSelected={table.selected.length} onSort={table.onSort} onSelectAllRows={(checked) => table.onSelectAllRows( checked, dataFiltered.map((i) => i._id.toString()) ) }
                headLabel={[
                    { id: "user", label: "User" },
                    { id: "total", label: "Payment" },
                    { id: "sku", label: "Products" },
                    { id: "charges", label: "Charges" },
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

export default withAuth(SellerAbandonedCart);