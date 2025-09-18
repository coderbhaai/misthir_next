"use client";
import React, { useEffect, useState } from "react";
import { Box, Grid, TextField, MenuItem, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, SelectChangeEvent, } from "@mui/material";
import { SaleProps, SaleSkuProps } from "@amitkk/ecom/types/ecom";
import StatusSelect from "@amitkk/basic/components/static/status-input";
import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/utils";
import { Types } from "mongoose";

interface DataFormProps {
    dataId?: string;
}  

export const SingleSales: React.FC<DataFormProps> = ({ dataId = "" }) => {
    const [data, setData] = useState<SaleProps | null>(null);
    const [discount, setDiscount] = useState("");
    
    useEffect(() => { 
        if (!dataId) return;

        const fetchSingleEntry = async () => {
            try {
                const res = await apiRequest("get", `ecom/sales?function=get_single_sale&id=${dataId}`);
                setData(res?.data);
                const discountApplied = res?.data.discount && "$numberDecimal" in res?.data.discount
                    ? parseFloat(res?.data.discount.$numberDecimal)
                    : res?.data.discount || 0;

                setDiscount(discountApplied)
            } catch (error) { clo(error); }
        };

        fetchSingleEntry();
    }, [dataId]);

    const formatDate = (d?: string | Date) => { if (!d) return ""; const date = new Date(d); return date.toISOString().split("T")[0]; };

    return (
        <Box p={4}>
            <Typography variant="h5" mb={3}>Sale By {typeof data?.vendor_id === "object" && "name" in data.vendor_id ? data.vendor_id.name : ""}</Typography>

            <Grid container spacing={3}>
                <Grid size={12}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, width: "100%" }}>
                        <TextField variant="outlined" type="text" label="Name" value={data?.name} slotProps={{ inputLabel: { shrink: true, }, }} disabled/>
                        <TextField variant="outlined" type="date" label="Valid From" slotProps={{ inputLabel: { shrink: true, }, }} value={formatDate(data?.valid_from)} disabled/>
                        <TextField variant="outlined" type="date" label="Valid To" slotProps={{ inputLabel: { shrink: true, }, }} value={formatDate(data?.valid_to)} disabled/>
                        <TextField variant="outlined" type="text" label="Discount Type" value={data?.type} slotProps={{ inputLabel: { shrink: true, }, }} disabled/>
                        <TextField variant="outlined" type="number" label={`Discount (${data?.type === "Amount Based" ? "₹" : "%"})`} name="discount" value={discount} disabled/>
                        <StatusSelect value={data?.status ?? null} onChange={() => {}} />
                    </Box>
                </Grid>
                <TextField fullWidth label="Search Products" value=""/>

                <Grid size={12}>
                    {data?.saleSkus && data.saleSkus.length > 0 && (
                        <Paper>
                        <Table>
                            <TableHead>
                            <TableRow>
                                <TableCell>Sl No.</TableCell>
                                <TableCell>Product</TableCell>
                                <TableCell>Sku</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Discount</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {data.saleSkus.map((s, i) => {
  const product =
    s.product_id instanceof Types.ObjectId ? null : s.product_id;
  const sku = s.sku_id instanceof Types.ObjectId ? null : s.sku_id;

  return (
    <TableRow key={i}>
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell>{product?.name || ""}</TableCell>
                                    <TableCell>
                                    {sku?.name || ""} {sku?.price ? `- ₹${sku.price}` : ""}
                                    </TableCell>
                                    <TableCell>
                                    <TextField type="number" value={s.quantity} size="small" sx={{ width: 80 }} disabled />
                                    </TableCell>
                                    <TableCell>
                                    <TextField
                                        value={
  s.discount && typeof s.discount === "object" && "$numberDecimal" in s.discount
    ? parseFloat((s.discount as { $numberDecimal: string }).$numberDecimal)
    : s.discount ?? ""
}

                                        size="small"
                                        sx={{ width: 80 }}
                                        disabled
                                    />
                                    </TableCell>
                                </TableRow>
                                );
                            })}
                            </TableBody>
                        </Table>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
}

export default SingleSales;