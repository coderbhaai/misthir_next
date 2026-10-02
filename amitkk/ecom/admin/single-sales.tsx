"use client";
import React, { useEffect, useState } from "react";
import { SaleProps } from "@amitkk/ecom/types";
import StatusSelect from "@amitkk/components/admin/status-input";
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { Types } from "mongoose";
import { TextField } from "@amitkk/components/basic/TextField";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@amitkk/components/basic/table";

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
                const res = await apiRequest("GET", `ecom/sales?function=get_single_sale&id=${dataId}`);
                setData(res?.data);
                const discountApplied = res?.data.discount
                    ? parseFloat(res?.data.discount)
                    : res?.data.discount || 0;

                setDiscount(discountApplied)
            } catch (error) { clo(error); }
        };

        fetchSingleEntry();
    }, [dataId]);

    const formatDate = (d?: string | Date) => { if (!d) return ""; const date = new Date(d); return date.toISOString().split("T")[0]; };

    return (
        <div className="p-2">
            <h3>Sale By {typeof data?.seller_id === "object" && "name" in data.seller_id ? data.seller_id.name : ""}</h3>

            <div className="row">
                <div className="col-span-12">
                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        <TextField type="text" label="Name" value={data?.name} disabled/>
                        <TextField type="date" label="Valid From" value={formatDate(data?.valid_from)} disabled/>
                        <TextField type="date" label="Valid To" value={formatDate(data?.valid_to)} disabled/>
                        <TextField type="text" label="Discount Type" value={data?.type} disabled/>
                        <TextField type="number" label={`Discount (${data?.type === "Amount Based" ? "₹" : "%"})`} name="discount" value={discount} disabled/>
                        <StatusSelect value={data?.status ?? null} onChange={() => {}} />
                    </div>
                </div>
                <TextField label="Search Products" value=""/>

                <div className="col-span-12">
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
                                    <TextField type="number" value={s.quantity} sx={{ width: 80 }} disabled />
                                    </TableCell>
                                    <TableCell>
                                    <TextField
                                        value={
  s.discount && typeof s.discount === "object" 
    ? parseFloat((s.discount))
    : s.discount ?? ""
}

                                       
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
                </div>
            </div>
        </div>
    );
}

export default SingleSales;