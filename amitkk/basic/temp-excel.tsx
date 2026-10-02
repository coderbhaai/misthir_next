"use client"

import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { apiRequest, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import { AdminDataTable } from "@amitkk/basic/admin/excel/admin-temp-excel-table";
import { useAdminPage } from "hooks/useAdminPage";
import { useAdminModal } from "hooks/useAdminModal";
import ExcelModal from "./admin/excel/upload-excel-modal";
import { ExcelProps } from "@amitkk/basic/types/excel";

export  function AdminTempInvoiceSale(){
    const admin = useAdminPage<ExcelProps>({ listEndpoint: "basic/excel", listFunction: "get_filtered_temp_excel" });
    const excelModal = useAdminModal();

    const FILTER_CONFIG = [
        { name: "SearchFilter", grid: "col-span-12", },
    ] as const;

    const head: { id: string; label: string }[] = [
                    { id: "Type", label: "Type" },
                    { id: "Batch", label: "Batch" },
                    { id: "Total", label: "Total" },
                    { id: "Success", label: "Success" },
                    { id: "Failed", label: "Failed" },
                    { id: "Status", label: "Status" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ];

    const handleDelete = async (id: string, type: string) => {
        const res = await apiRequest("POST", "basic/excel", { function: "delete_temp", id, type });

        if (res?.data) {
            hitToastr("success", "Deleted successfully");
            admin.fetchData();
        }
    };

    return(
        <AdminTableLayout admin={admin} title="Excel" filters={FILTER_CONFIG} head={head}
            rows={admin.data.map((i) => ( <AdminDataTable key={String(i._id)} row={i} onDelete={handleDelete}/> ))}
            actionsAboveFilters={
                <button className="btn" onClick={() => excelModal.handleOpen() }>Upload Via Excel</button>
            }>
      <ExcelModal open={excelModal.open} handleClose={ excelModal.handleClose } onUpdate={async () => { excelModal.handleClose(); await admin.fetchData(); }}/>
    </AdminTableLayout>
    )
}

export default AdminTempInvoiceSale;