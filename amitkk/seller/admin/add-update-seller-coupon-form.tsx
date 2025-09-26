"use client"
import React from "react";
import { useState, useEffect, useCallback } from "react";
import { Box, Button, FormControl, Grid, InputLabel, MenuItem, TextField, Typography } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import dynamic from "next/dynamic";
import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/utils";
import StatusSelect from "@amitkk/basic/components/static/status-input";
import { SubmitButton } from "@amitkk/basic/static/LoadingSubmit";
import { useUserAccess } from "hooks/useUserSpatie";
import { CouponProps } from "@amitkk/ecom/types/ecom";
import { useRouter } from "next/router";
import { MediaProps } from "@amitkk/basic/types/page";
import MediaImage from "@amitkk/basic/components/static/table-image";
import ImageUpload from "@amitkk/basic/components/static/file-input";

interface DataFormProps {
    dataId?: string;
    vendor_id?: string;
    coupon_by?: string;
}  

export const SellerCouponForm: React.FC<DataFormProps> = ({ dataId = "", vendor_id = "", coupon_by= "" }) => {
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const today = new Date();
    const plus30 = new Date();
    plus30.setDate(today.getDate() + 30);
    const formatDate = (d: string | Date) => { if (!d) return ""; const date = new Date(d); return date.toISOString().split("T")[0]; };

    const [formData, setFormData] = React.useState<CouponProps>({
        _id: '',
        coupon_by: coupon_by,
        coupon_type: '',
        vendor_id: vendor_id,
        usage_type: '',
        discount : 0,
        name: '',
        code: '',
        sales: '',
        status: true,
       valid_from: formatDate(today),
        valid_to: formatDate(plus30),
        buy_one: '',
        description: '',
        media: '',
        media_id: '',
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    const coupon_type_options = [ "Single Usage", "Multi Usage", "Specific Users", "Buy One Get One"];
    const [image, setImage] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const { hasAnyRole, hasPermission } = useUserAccess();
    const router = useRouter();

    const fetchSingleEntry = useCallback(async () => {
        if (!dataId || !vendor_id ) return;

        try {            
            const res = await apiRequest("get", `ecom/coupon?function=get_single_coupon&id=${dataId}&vendor_id=${vendor_id}`);
            
            if (res?.data) {
                setFormData({
                    _id: res?.data.id,
                    coupon_by: res?.data.coupon_by || "",
                    coupon_type: res?.data.coupon_type || "",
                    vendor_id: res?.data.vendor_id?._id || '',
                    usage_type: res?.data.usage_type || '',
                    discount: res?.data.discount || 0,
                    name: res?.data.name || "",
                    code: res?.data.code || "",
                    sales: res?.data.sales || "",
                    status: res?.data.status || true,
                    valid_from: formatDate(res?.data.valid_from),
                    valid_to: formatDate(res?.data.valid_to),
                    buy_one: res?.data.buy_one?._id || "",
                    media_id: res?.data.media_id?._id || "",
                    media: res?.data?.media_id,
                    description: res?.data.description || '',
                    createdAt: res?.data.createdAt,
                    updatedAt: res?.data.updatedAt,
                });
            }
        } catch (error) { clo( error ); }
    }, [dataId]);

    useEffect(() => { fetchSingleEntry(); }, [dataId, vendor_id]);

    const initData = useCallback(async () => {
        if (!vendor_id) return;
        
        try {
            const res_1 = await apiRequest("get", `product/product?function=get_sku_options&vendor_id=${vendor_id}`);
            setProducts(res_1?.data?? []);

        } catch (error) { clo( error ); }
    }, [vendor_id]);

    useEffect(() => { initData(); }, [initData]);
      
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("function", "create_update_coupon");
            formDataToSend.append("vendor_id", vendor_id as string);
            formDataToSend.append("path", "coupon");
            formDataToSend.append("_id", formData._id as string);
            formDataToSend.append("coupon_by", formData.coupon_by);
            formDataToSend.append("coupon_type", formData.coupon_type);
            formDataToSend.append("usage_type", formData.usage_type);
            formDataToSend.append("discount", String( formData.discount ));
            formDataToSend.append("name", formData.name);
            formDataToSend.append("code", formData.code);
            formDataToSend.append("sales", String(formData.sales));
            formDataToSend.append("status", String(formData.status));
            formDataToSend.append("valid_from", formatDate(formData.valid_from) );
            formDataToSend.append("valid_to", formatDate(formData.valid_to) );
            formDataToSend.append("buy_one", formData.buy_one as string);
            formDataToSend.append("description", String(formData.description));

            const mediaIdToSend = formData.media_id && typeof formData.media_id === "object" && "_id" in formData.media_id 
                               ? String((formData.media_id as MediaProps)._id) : typeof formData.media_id === "string" && formData.media_id !== "null" ? formData.media_id : "";
                             formDataToSend.append("media_id", mediaIdToSend);
                             
            if (image) { formDataToSend.append("image", image); }

            const res = await apiRequest("post", `ecom/coupon`, formDataToSend);
            hitToastr('success', 'Entry Done');

            if( hasAnyRole(["Vendor", "Staff"]) ){
                router.replace('/seller/coupon');
            }else{
                router.replace('/admin/coupon');
            }
            
        } catch (error) { clo( error ); } finally { setIsSubmitting(false); }
    };

    const handleChange = (e: SelectChangeEvent | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value === "true" ? true : value === "false" ? false : value })); 
    };

    const title = !dataId ? 'Add Coupon' : 'Update Coupon';

    return(
        <>
            <Box display="flex" alignItems="center" mb={5} sx={{ padding: "1em" }}>
                <Typography variant="h4" flexGrow={1}>{title}</Typography>
            </Box>
            
            <form onSubmit={handleSubmit} style={{ padding: "10px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", mb:3 }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2, width: "100%" }}>
                        <TextField variant="outlined" type="text" label="Name" name="name" value={formData.name} onChange={handleChange} required/>
                        <TextField variant="outlined" type="text" label="Code" name="code" value={formData.code} onChange={handleChange} required/>
                        <StatusSelect value={formData.status} onChange={handleChange}/>
                        <FormControl sx={{ width: "100%" }}>
                            <InputLabel id="coupon_type-label">Coupon Type <span style={{ color: "red" }}>*</span></InputLabel>
                            <Select labelId="coupon_type-label" id="coupon_type" name="coupon_type" value={formData.coupon_type} onChange={handleChange}>
                                <MenuItem value="">Select Coupon Type</MenuItem>
                                {coupon_type_options.map((i) => (<MenuItem key={i} value={i}>{i}</MenuItem>))}
                            </Select>
                        </FormControl>
                        <TextField variant="outlined" type="date" label="Valid From" name="valid_from" value={formData.valid_from} onChange={handleChange} slotProps={{ inputLabel: { shrink: true, }, }} fullWidth required/>
                        <TextField variant="outlined" type="date" label="Valid To" name="valid_to" value={formData.valid_to} onChange={handleChange} slotProps={{ inputLabel: { shrink: true, }, }} fullWidth required/>
                        <TextField select variant="outlined" label="Usage Type" name="usage_type" value={formData.usage_type} onChange={handleChange} required>
                            <MenuItem value="Amount Based">Amount Based</MenuItem>
                            <MenuItem value="Percent Based">Percent Based</MenuItem>
                        </TextField>
                        <TextField variant="outlined" type="Number" label="Sales" name="sales" value={formData.sales} onChange={handleChange} required/>
                        <TextField variant="outlined" type="number" label={`Discount (${formData.usage_type === "Amount Based" ? "₹" : "%"})`} name="discount" value={formData.discount} onChange={handleChange} required/>
                    </Box>
                    <TextField label="Description" variant="outlined" value={formData.description} name="description" fullWidth onChange={handleChange} multiline rows={2}/>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", gridColumn: "span 1" }}>
                        <MediaImage media={formData.media as MediaProps}/>
                        <ImageUpload name="image" required error={imageError} onChange={(name, file) => { setImage(file); }}/>
                    </div>
                </Box>

                <Button type="submit" variant="contained" color="primary">{title}</Button>
            </form>
        </>
    )
}

export default SellerCouponForm;