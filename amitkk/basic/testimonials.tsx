import { useState, useEffect, useCallback } from "react";
import DataModal from "@amitkk/basic/components/testimonial/testimonial-modal";
import { AdminDataTable } from "@amitkk/basic/components/testimonial/admin-testimonial-table";
import { DataProps } from "@amitkk/basic/components/testimonial/admin-testimonial-table"
import { useTable, emptyRows, AdminTableHead } from "@amitkk/basic/utils/AdminUtils";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useTableFilter, apiRequest, clo, withAuth } from "@amitkk/basic/utils/utils";
import { AdminModuleProps } from "@amitkk/basic/utils/types";
import router from "next/router";

export default function AdminTestimonial({ module = "", module_id = "" }: AdminModuleProps) {
    const table = useTable();
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<DataProps[]>([]);
    const [selectedDataId, setSelectedDataId] = useState<string | number | null>(null);
    const [updatedDataId, setUpdatedDataId] = useState<string | number | null>(null);
    const [filterData, setFilterData] = useState("");
    const [title, setTitle] = useState<string>("All testimonials");

    const handleClose = () => {
    setOpen(false);
    setSelectedDataId(null);
    setUpdatedDataId(null);
    };

    const updateData = async (i: DataProps) => {
    setUpdatedDataId(i?._id?.toString());
    };

    const dataFiltered = useTableFilter<DataProps>( data, table.order, table.orderBy as keyof DataProps, filterData, ["name"] );
    const modalProps = { open, handleClose, selectedDataId, onUpdate: updateData, module, module_id };

    const getCleanHref = (url?: string) => {
        if (!url || url === '/') return '/';
        const cleanUrl = url.replace(/^\/+/, '');
        return `/${cleanUrl}`;
    };
    
    const handleEdit = (row: DataProps) => {
    setSelectedDataId(row?._id?.toString());
    setOpen(true);
    };

    // const fetchData = useCallback(async () => {
    //     try {
    //         const res = await apiRequest("get", `basic/page?function=get_all_testimonials`);
    //         setData(res?.data ?? []);
    //     } catch (error) { clo( error ); }
    // }, []);
    
    // useEffect(() => { fetchData(); }, [fetchData]);

    const fetchData = useCallback(async () => {
        try {
        let apiFunction = `get_all_testimonials`;
        if (module && module_id) {
            const isValidModule = typeof module === "string" && module.trim().length > 0;
            const isValidModuleId = typeof module_id === "string" && module_id.trim().length > 0;

            if (isValidModule && isValidModuleId) {
            apiFunction = `get_testimonial&module=${encodeURIComponent(module)}&module_id=${encodeURIComponent(
                module_id
            )}`;
            } else {
                // router.push('/404');
            }
        }
        
        const res = await apiRequest("get", `basic/page?function=${apiFunction}`);
        setData(res?.data ?? []);

        let route = '';
        if ( module === "Blog") {
            route      = `blog/blogs?function=get_single_blog_module&id=${module_id}`
        }

        if ( module === "Page") {
            route      = `basic/page?function=get_single_page_module&id=${module_id}`
        }

        if ( module === "Product") {
            route      = `product/product?function=get_single_product_module&id=${module_id}`
        }
        
        const res_2 = await apiRequest("get", route);
        
        if( res_2 && res_2.data){
            const href = getCleanHref(res_2?.data?.url);
            setTitle(`<a href="${href}" target="_blank">Testimonials For ${res_2?.data?.name}</a>`);
        }
        } catch (error) { clo(error); }
    }, [module, module_id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        if (updatedDataId) {
            const fetchData = async () => {
                try {
                    const res = await apiRequest("get", `basic/page?function=get_single_testimonial&id=${updatedDataId}`);
                    const data = res?.data;
                    if (!data || !data._id) { clo("Invalid data received:", data); await fetchData(); return; }
    
                    setData((prevData = []) => {
                        const exists = prevData.some(i => String(i._id) === String(data._id));
    
                        return exists 
                            ? prevData?.map((i) => 
                                String(i._id) === String(data._id) ? { ...i, ...data } : i
                            )
                            : [...prevData, data];
                    });

                    handleClose();
                } catch (error) { clo( error ); }
            };
            fetchData();
        }
    }, [updatedDataId]);
    
    return(
        <AdminTableLayout<DataProps>
            title={ <span dangerouslySetInnerHTML={{ __html: title }} /> } addButtonLabel="New testimonial" onAddNew={() => setOpen(true)} filterData={filterData} onFilterData={setFilterData} table={{ ...table, emptyRows: (totalRows: number) => emptyRows(table.page, table.rowsPerPage, totalRows)  }} data={dataFiltered}
            head={
                <AdminTableHead showCheckBox={false} order={table.order} orderBy={table.orderBy} rowCount={dataFiltered.length} numSelected={table.selected.length} onSort={table.onSort} onSelectAllRows={(checked) => table.onSelectAllRows( checked, dataFiltered.map((i) => i._id.toString()) ) }
                headLabel={[
                    { id: "model", label: "Module" },
                    { id: "model_id", label: "Model" },
                    { id: "media", label: "Media" },
                    { id: "client", label: "Client" },
                    { id: "testimonial", label: "Testimonial" },
                    { id: "status", label: "Status" },
                    { id: "date", label: "Date" },
                    { id: "", label: "" },
                ]}/>
            }
            rows={dataFiltered.slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                .map((i) => (
                    <AdminDataTable key={i._id.toString()} row={i} selected={table.selected.includes(i._id.toString())} onSelectRow={() => table.onSelectRow(i._id.toString())} onEdit={handleEdit} showCheckBox={false}/>
                ))}>
            <DataModal {...modalProps} />
        </AdminTableLayout>
    )
}