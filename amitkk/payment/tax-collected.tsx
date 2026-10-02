"use client";

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useAdminPage } from "hooks/useAdminPage";
import { AdminDataTable, DataProps } from "@amitkk/payment/admin/admin-tax-collected-table";

export function AdminTaxCollected() {
    const admin = useAdminPage<DataProps>({ listEndpoint: "payment/payment", listFunction: "get_all_tax_collected" });    

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-9", },
        { name: "StatusFilter", grid: "col-span-3", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "module", label: "Module" },
                    { id: "cgst", label: "CGST" },
                    { id: "sgst", label: "SGST" },
                    { id: "sgst", label: "IGST" },
                    { id: "total", label: "Total" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];

    return (
        <AdminTableLayout admin={admin} title="Taxes" filters={FILTER_CONFIG} head={head} 
            rows={admin.data.map((i: DataProps) => ( <AdminDataTable key={String(i._id)} row={i}/> ))}>
        </AdminTableLayout>
    );
}

export default AdminTaxCollected;