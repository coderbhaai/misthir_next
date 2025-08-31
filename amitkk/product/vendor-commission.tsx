"use client"

import { useState, useEffect, useCallback } from "react";
import { useTable, emptyRows, AdminTableHead } from "@amitkk/basic/utils/AdminUtils";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { useTableFilter, apiRequest, clo, withAuth } from "@amitkk/basic/utils/utils";
import router from "next/router";
import DataModal from "@amitkk/product/admin/commission-modal";
import { AdminDataTable } from "@amitkk/product/admin/admin-commission-table";
import { OptionProps } from "@amitkk/basic/types/page";
import { Button, Grid, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import { Types } from "mongoose";

interface DataProps {
  _id: string;
  productmeta_id: string | OptionProps;
  vendor_id: string | OptionProps;
  name?: string;
  percentage: number | string;
}

interface AdminCommissionProps {
  vendor_id: string;
}

interface PercentageEntry {
  productmeta_id: string;
  name: string;
  percentage: number | "";
}

export default function AdminVendorCommission({ vendor_id }: AdminCommissionProps) {
    const [data, setData] = useState<DataProps[]>([]);
    const [productmetaOptions, setProductmetaOptions] = useState<OptionProps[]>([]);
    const [percentages, setPercentages] = useState<PercentageEntry[]>([]);
    const [title, setTitle] = useState<string>("All Commissions");
    const [vendor, setVendor] = useState("");

    const fetchData = useCallback(async () => {
        try {
            const res_1 = await apiRequest("get", `product/basic?function=get_all_commissions&vendor_id=${encodeURIComponent(vendor_id)}`);
            const commissionData: DataProps[] = res_1?.data ?? [];
            setData(commissionData);

            const res_2 = await apiRequest("get", `product/basic?function=get_product_meta_by_module&module=Type`);
            const productmetaData: OptionProps[] = res_2?.data ?? [];
            setProductmetaOptions(productmetaData);

            const merged = productmetaData.map((pm) => {
            const existing = commissionData.find((c) => {
                const pmId = typeof c.productmeta_id === "object" ? c.productmeta_id._id : c.productmeta_id;
                const vId  = typeof c.vendor_id === "object" ? c.vendor_id._id : c.vendor_id;

                return (
                    pmId?.toString() === pm._id.toString() &&
                    vId?.toString() === vendor_id?.toString()
                );
            });

            return {
                productmeta_id: pm._id,
                name: pm.name,
                vendor_id,
                percentage: existing ? Number(existing.percentage) : 0,
                _id: existing ? existing._id : "",
            };
            });
            setPercentages(merged);

            const res_3 = await apiRequest("get", `basic/spatie?function=get_single_user&id=${encodeURIComponent(vendor_id)}`);
            setVendor(res_3?.data);

            if( res_2?.data ){ setTitle(`Commission For ${res_3?.data?.name}`); }else{
                router.push('/404');
            }
        } catch (error) { clo( error ); }
    }, []);

    useEffect(() => {
        if (vendor_id && vendor_id.trim().length > 0) {
            fetchData();
        }
    }, [vendor_id]);

    const handlePercentageChange = (id: string, value: string) => {
        setPercentages((prev) =>
            prev.map((entry) => entry.productmeta_id === id ? { ...entry, percentage: value === "" ? "" : Number(value) } : entry )
        );
    };
    
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const payload = percentages.filter((p) => p.percentage !== "");
        const updatedData = {
            function: "create_update_vendor_commission",
            data: payload,
        };
        try {
          const res = await apiRequest("post", `product/basic`, updatedData);
          
        }catch (error) { clo( error ); }
    }
    
    return(       
       <>
            <Typography variant="h4" flexGrow={1}>{title}</Typography>
            
            <form onSubmit={handleSubmit}>
                <Grid container spacing={3} mt={5}>
                    {percentages.map((item) => (
                        <Grid size={4} key={item.productmeta_id}>
                            <Typography variant="body1" gutterBottom>{item.name}</Typography>
                            <TextField type="number" fullWidth placeholder="Enter percentage" value={item.percentage} 
                                onChange={(e) => handlePercentageChange(item.productmeta_id, e.target.value) }
                                slotProps={{ input: { inputProps: { min: 0, max: 100 } } }}/>
                        </Grid>
                    ))}
                </Grid>

                <Button type="submit" variant="contained" sx={{ mt: 2 }}>Save</Button>
            </form>
        </>
    )
}