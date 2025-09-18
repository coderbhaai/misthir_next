"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Box, Grid, TextField, MenuItem, Button, Typography, Checkbox, FormControlLabel, Paper, Table, TableHead, TableRow, TableCell, TableBody, SelectChangeEvent, } from "@mui/material";
import { SaleProps } from "@amitkk/ecom/types/ecom";
import { useVendorId } from "hooks/useVendorId";
import StatusSelect from "@amitkk/basic/components/static/status-input";
import { SubmitButton } from "@amitkk/basic/static/LoadingSubmit";
import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/utils";
import { ProductRawDocument } from "lib/models/types";
import router from "next/router";

export interface DataProps extends SaleProps {
    _id: string;
}

interface DataFormProps {
    dataId?: string;
}  

export const SellerSalesForm: React.FC<DataFormProps> = ({ dataId = "" }) => {
    const vendor_id = useVendorId();
    const [formData, setFormData] = React.useState<DataProps>({
        _id: "",
        name: "",
        valid_from: "",
        valid_to: "",
        type: "",
        discount: 0,
        status: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const [data, setData] = useState<ProductRawDocument[]>([]);
    const [allProducts, setAllProducts] = useState(false);
    const [search, setSearch] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [selectedSkus, setSelectedSkus] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: SelectChangeEvent | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value === "true" ? true : value === "false" ? false : value }));
    };

    useEffect(() => {
        if (!dataId && vendor_id) {
            const fetchProducts = async () => {
                try {
                    const res = await apiRequest("get", `ecom/sales?function=get_all_sales&vendor_id=${vendor_id}`);
                    if (res?.data) {
                        const allProducts = res.data;
                        const skusMap: Record<string, any> = {};

                        allProducts.forEach((product: any) => {
                            product.saleSkus?.forEach((i: any) => {
                                console.log("i", i)
                                skusMap[i._id] = {
                                    checked: false,
                                    product_name: product.name,
                                    sku_name: i?.sku_id?.name,
                                    product_id: product._id,
                                    sku_id: i?.sku_id?._id,
                                    quantity: 1,
                                    discount: "",
                                    price: i?.sku_id?.price ?? 0,
                                };
                            });
                        });

                        setSelectedSkus(skusMap);
                    }
                } catch (err) { clo(err); }
            };

            fetchProducts();
        }
    }, [dataId, vendor_id]);
    
    const initSkus = (saleSkus: any[] = []) => {
        const skusMap: Record<string, any> = {};

        console.log("saleSkus", saleSkus)

        saleSkus.forEach((s) => {
            const sku = typeof s.sku_id === "string" ? { _id: s.sku_id } : s.sku_id;
            const product = typeof s.product_id === "string" ? { _id: s.product_id } : s.product_id;

            if (!sku?._id) return;

            skusMap[sku._id] = {
                checked: true,
                product_name: product?.name || "",
                sku_name: sku?.name || "",
                product_id: product?._id || "",
                sku_id: sku._id,
                quantity: s.quantity ?? 1,
                discount:
                    s.discount && "$numberDecimal" in s.discount
                    ? parseFloat(s.discount.$numberDecimal)
                    : s.discount ?? "",
                price: sku?.price ?? 0,
            };
        });

        setSelectedSkus(skusMap);
    };

    useEffect(() => {
        if (!data) return;
        initSkus(data);
    }, [data]);
    
    useEffect(() => { 
        if (!dataId || !vendor_id) return;

        const fetchSingleEntry = async () => {
            try {
                const res = await apiRequest("get", `ecom/sales?function=get_single_sale&id=${dataId}&vendor_id=${vendor_id}`);

                if (res?.data) {
                    const discount = res?.data.discount && "$numberDecimal" in res?.data.discount
                    ? parseFloat(res?.data.discount.$numberDecimal)
                    : res?.data.discount || 0;

                    const formatDate = (d: string | Date) => { if (!d) return ""; const date = new Date(d); return date.toISOString().split("T")[0]; };

                    setFormData({
                    _id: res?.data._id,
                    name: res?.data.name || "",
                    valid_from: formatDate(res?.data.valid_from),
                    valid_to: formatDate(res?.data.valid_to),
                    type: res?.data.type || "",
                    status: res?.data.status ?? true,
                    discount,
                    createdAt: res?.data.createdAt,
                    updatedAt: res?.data.updatedAt,
                    });

                    initSkus(res?.data.saleSkus);
                }
            } catch (error) { clo(error); }
        };

        fetchSingleEntry();
    }, [dataId, vendor_id, data]);

    const handleAllProductsToggle = (checked: boolean) => {
        if ( !formData.type || !formData.discount) {
            setAllProducts(false);
            hitToastr('error', "Please fill Type, and Discount before applying to all products."); return;
        }

        setAllProducts(checked);
    };

    const updateSkuQuantity = (sku_id: string, qty: number) => {
        setSelectedSkus((prev: any) => ({ ...prev, [sku_id]: { ...prev[sku_id], quantity: qty }, }));
    };

    const updateSkuDiscount = (sku_id: string, discount: number | "") => {
        if (discount === "") { setSelectedSkus((prev: any) => ({ ...prev, [sku_id]: { ...prev[sku_id], discount: "" } })); return; }
        if (!formData.type) { hitToastr("error", "Please select Discount Type first."); return; }


        setSelectedSkus((prev: any) => {
            const updated = { ...prev };
            const sku = updated[sku_id];
            if (!sku) return prev;

            let appliedDiscount = discount;

            if (formData.type === "Amount Based" && appliedDiscount > sku.price) {
                appliedDiscount = sku.price;
                hitToastr("error", `Amount discount cannot exceed price ₹${sku.price}`);
            }

            if (formData.type === "Percent Based" && appliedDiscount >= 100) {
                appliedDiscount = 0;
                hitToastr("error", "Percent Based discount cannot be 100 or more. Reset to 0.");
            }

            updated[sku_id] = { ...sku, discount: appliedDiscount };
            return updated;
        });

        if (allProducts && discount !== formData.discount) {
            setAllProducts(false);
        }
    };

    useEffect(() => {
        const applyDiscountRules = () => {
            if (!formData.type || formData.discount === undefined || formData.discount === null) { return; }

            let validDiscount = Number( formData.discount );            
            console.log("validDiscount", validDiscount)

            if (formData.type === "Percent Based" && validDiscount >= 100) {
                validDiscount = 0;
                setFormData((prev) => ({ ...prev, discount: 0 }));
                hitToastr("error", "Percent Based discount cannot be 100 or more. Reset to 0.");
            }

            if (allProducts) {
                console.log("allProducts", allProducts, validDiscount)
                setSelectedSkus((prev: any) => {
                    const updated = { ...prev };
                    Object.keys(updated).forEach((skuId) => {
                        const sku = updated[skuId];
                        let appliedDiscount = validDiscount;

                        if (formData.type === "Amount Based" && appliedDiscount > sku.price) {
                            console.log(1111)
                            appliedDiscount = sku.price;
                        }

                        if (formData.type === "Percent Based" && appliedDiscount >= 100) {
                            appliedDiscount = 0;
                        }

                        console.log("appliedDiscount", appliedDiscount)

                        updated[skuId] = { ...sku, discount: appliedDiscount };
                    });
                    return updated;
                });
            }
        };
        
        applyDiscountRules();
    }, [formData.discount, formData.type, allProducts, setFormData, setSelectedSkus]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        console.log("submit")
        if (!selectedSkus || Object.keys(selectedSkus).length === 0) { hitToastr("error", "SKUs are Required"); return; }

        const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => { formDataToSend.append(key, String(value)); });
        formDataToSend.append("function", "create_update_sale");
        formDataToSend.append("skus", JSON.stringify(Object.values(selectedSkus)));
        formDataToSend.append("vendor_id", vendor_id as string);
        const res = await apiRequest("post", "ecom/sales", formDataToSend);

        if( res?.data){
            router.replace('/seller/sales');
        }        
    };

    const title = !dataId ? 'Add Sale' : 'Update Sale';

    return (
        <Box p={4}>
            <Typography variant="h5" mb={3}>Create Sale</Typography>
            <form onSubmit={handleSubmit} style={{ padding: "10px" }}>
                <Grid container spacing={3}>
                    <Grid size={12}>
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, width: "100%" }}>
                            <TextField variant="outlined" type="text" label="Name" name="name" value={formData.name} onChange={handleChange} required/>
                           <TextField variant="outlined" type="date" label="Valid From" name="valid_from" value={formData.valid_from} onChange={handleChange} slotProps={{ inputLabel: { shrink: true, }, }} fullWidth required/>
                           <TextField variant="outlined" type="date" label="Valid To" name="valid_to" value={formData.valid_to} onChange={handleChange} slotProps={{ inputLabel: { shrink: true, }, }} fullWidth required/>
                            <TextField select variant="outlined" label="Type" name="type" value={formData.type} onChange={handleChange} required>
                                <MenuItem value="Amount Based">Amount Based</MenuItem>
                                <MenuItem value="Percent Based">Percent Based</MenuItem>
                            </TextField>
                            <TextField variant="outlined" type="number" label={`Discount (${formData.type === "Amount Based" ? "₹" : "%"})`} name="discount" value={formData.discount} onChange={handleChange} required/>
                            <StatusSelect value={formData.status} onChange={handleChange}/>
                            <FormControlLabel control={ <Checkbox checked={allProducts} onChange={(e) => handleAllProductsToggle(e.target.checked)}/> } label="Apply on All Products"/>
                        </Box>
                    </Grid>
                    <TextField fullWidth label="Search Products" value={search} onChange={(e) => setSearch(e.target.value)}/>

                    <Grid size={12}>
                        {Object.keys(selectedSkus).length > 0 && (
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
                                    {Object.values(selectedSkus).map((s: any, i) => (
                                        <TableRow key={s.sku_id}>
                                            <TableCell>{i + 1}</TableCell>
                                            <TableCell>{s.product_name}</TableCell>
                                            <TableCell>{s.sku_name} - ₹{s.price}</TableCell>
                                            <TableCell><TextField type="number" value={s.quantity} onChange={(e) => updateSkuQuantity(s.sku_id, Number(e.target.value)) } size="small" sx={{ width: 80 }} required/></TableCell>
                                            <TableCell>
                                                <TextField value={s.discount === "" ? "" : s.discount}
                                                    onChange={(e) => { 
                                                        const value = e.target.value;
                                                        updateSkuDiscount(s.sku_id, value === "" ? "" : Number(value));
                                                    }} size="small" sx={{ width: 80 }} required/>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    </TableBody>
                                </Table>
                            </Paper>
                        )}
                    </Grid>

                    <Button type="submit" variant="contained" color="primary">{title}</Button>
                </Grid>
            </form>
        </Box>
    );
}

export default SellerSalesForm;