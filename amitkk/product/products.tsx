import { useState, useEffect, useCallback } from "react";
import { useTable, AdminTableHead, emptyRows } from "@amitkk/basic/utils/AdminUtils";
import { apiRequest, clo, useTableFilter, Iconify, withAuth, hitToastr } from "@amitkk/basic/utils/utils";
import { AdminDataTable, DataProps } from "amitkk/seller/components/seller-product-table";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useRouter } from "next/router";
import { useVendorId } from "hooks/useVendorId";
import { Grid } from "@mui/material";

export function AdminProducts(){
    const router = useRouter();
    const showCheckBox = false;
    const table = useTable();
    const setOpen = () =>{  hitToastr('error', "Admin can only Edit Product"); }
    const [data, setData] = useState<DataProps[]>([]);
    const [filterData, setFilterData] = useState("");
    const dataFiltered = useTableFilter<DataProps>( data, table.order, table.orderBy as keyof DataProps, filterData, ["name"] );

    const initData = useCallback(async () => {
        try {
            const res = await apiRequest("get", `product/product?function=get_all_products`);
            setData(res?.data?? []);
        } catch (error) { clo( error ); }
    }, []);

    useEffect(() => { initData(); }, [initData]);
    
    return(
        <Grid container spacing={3}>
            {dataFiltered
                .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                .map((i) => (
                    <AdminDataTable
                    row={i}
                    selected={table.selected.includes(i._id.toString())}
                    onSelectRow={() => table.onSelectRow(i._id.toString())}
                    showCheckBox={false}
                    />
                ))
            }
        </Grid>
    )
}

export default withAuth(AdminProducts);