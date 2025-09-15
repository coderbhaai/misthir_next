import { useState, useEffect, useCallback } from "react";
import { useTable, AdminTableHead, emptyRows } from "@amitkk/basic/utils/AdminUtils";
import { apiRequest, clo, useTableFilter, Iconify, withAuth } from "@amitkk/basic/utils/utils";
import { AdminDataTable, DataProps } from "@amitkk/seller/admin/seller-product-table";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useRouter } from "next/router";
import { useVendorId } from "hooks/useVendorId";
import { Grid } from "@mui/material";

export function SellerProducts(){
    const vendor_id = useVendorId();
    const router = useRouter();
    const showCheckBox = false;
    const table = useTable();
    const setOpen = () =>{ router.push('/seller/add-update-product'); }
    const [data, setData] = useState<DataProps[]>([]);
    const [filterData, setFilterData] = useState("");
    const dataFiltered = useTableFilter<DataProps>( data, table.order, table.orderBy as keyof DataProps, filterData, ["name"] );

    const initData = useCallback(async () => {
        if (!vendor_id) return;

        try {
            const res = await apiRequest("get", `product/product?function=get_all_products&vendor_id=${vendor_id}`);
            setData(res?.data?? []);
        } catch (error) { clo( error ); }
    }, [vendor_id]);

    useEffect(() => { initData(); }, [initData]);
    
    return(
        <Grid container spacing={3}>
            {dataFiltered
                .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                .map((i) => (
                    <AdminDataTable key={i._id.toString()} row={i} showCheckBox={false}
                    selected={table.selected.includes(i._id.toString())}
                    onSelectRow={() => table.onSelectRow(i._id.toString())} />
                ))
            }
        </Grid>
    )
}

export default withAuth(SellerProducts);