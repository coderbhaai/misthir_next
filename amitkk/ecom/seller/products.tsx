"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { AdminDataTable, DataProps } from "@amitkk/product/admin/admin-product-table";
import { useAdminPage } from "hooks/useAdminPage";

export function SellerProducts(){
    const admin =   useAdminPage<DataProps>({ listEndpoint: "product/product", listFunction: "get_filtered_products", addRoute: "/admin/add-update-product" });

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-3", },
        { name: "ProductTypeFilter", grid: "col-span-3", },
        { name: "ProductBrandFilter", grid: "col-span-3", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    return (
        <AdminTableLayout admin={admin} title="Products" filters={FILTER_CONFIG} head={[]}
            rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i}/> ))}>
        </AdminTableLayout>
  );
}

export default SellerProducts;