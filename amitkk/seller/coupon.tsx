"use client"

import { useState, useEffect, useCallback } from "react";
import { AdminDataTable, DataProps } from "@amitkk/seller/admin/seller-coupon-table";
import { useTable, emptyRows, AdminTableHead } from "@amitkk/basic/utils/AdminUtils";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useTableFilter, apiRequest, clo, withAuth } from "@amitkk/basic/utils/utils";
import { useVendorId } from "hooks/useVendorId";
import router from "next/router";

export function SellerCoupons(){
    const vendor_id = useVendorId();
    const showCheckBox = false;
    const table = useTable();
    const [data, setData] = useState<DataProps[]>([]);
    const [filterData, setFilterData] = useState("");
    const dataFiltered = useTableFilter<DataProps>( data, table.order, table.orderBy as keyof DataProps, filterData, ["name"] );

    const initData = useCallback(async () => {
        try {
            const res = await apiRequest("get", `ecom/coupon?function=get_all_coupons&vendor_id=${vendor_id}`);
            setData(res?.data ?? []);

        } catch (error) { clo( error ); }
    }, []);

   useEffect(() => { if (!vendor_id) return; initData(); }, [vendor_id]);
    
    return(
        <AdminTableLayout<DataProps>
            title="Coupons" addButtonLabel="New Coupon" onAddNew={() => router.push("/seller/add-update-coupon")}  filterData={filterData} onFilterData={setFilterData} table={{ ...table, emptyRows: (totalRows: number) => emptyRows(table.page, table.rowsPerPage, totalRows)  }} data={dataFiltered}
            head={
                <AdminTableHead showCheckBox={false} order={table.order} orderBy={table.orderBy} rowCount={dataFiltered.length} numSelected={table.selected.length} onSort={table.onSort} onSelectAllRows={(checked) => table.onSelectAllRows( checked, dataFiltered.map((i) => i._id.toString()) ) }
                headLabel={[
                    { id: "coupon", label: "Coupon" },
                    { id: "validity", label: "Validity" },
                    { id: "media", label: "Media" },
                    { id: "discount", label: "Discount" },
                    { id: "status", label: "Status" },
                    { id: "remarks", label: "Remarks" },
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

export default withAuth(SellerCoupons);