"use client"

import React, { useMemo } from "react";
import { useState, useEffect, useCallback } from "react";
import { apiRequest, clo, handleMultiSelectChange, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import StatusSelect from "@amitkk/components/admin/status-input";
import { useUserAccess } from "hooks/useUserSpatie";
import { CouponProps } from "@amitkk/coupon/types";
import { useRouter } from "next/router";
import { MediaProps } from "@amitkk/basic/types/media";
import MediaImage from "@amitkk/components/admin/table-image";
import ImageUpload from "@amitkk/components/admin/file-input";
import { useFormHandler } from "hooks/useFormHandler";
import { TextField } from "@amitkk/components/basic/TextField";
import { Button } from "@amitkk/components/button/button";
import { Textarea } from "@amitkk/components/basic/textarea";
import OpenSelect from "@amitkk/components/basic/OpenSelect";
import SingleUserDropdown from "@amitkk/basic/admin/spatie/SingleUserDropdown";
import MultiSelectDropdown from "@amitkk/components/admin/multiselect-dropdown";

interface DataFormProps {
    dataId?: string;
    seller_id?: string;
    coupon_by?: string;
}

const AddUpdateCouponForm: React.FC<DataFormProps> = ({ dataId = "", seller_id = "", coupon_by= "" }) => {
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const today = new Date();
    const plus30 = new Date();
    plus30.setDate(today.getDate() + 30);
    const formatDate = (d: string | Date) => { if (!d) return ""; const date = new Date(d); return date.toISOString().split("T")[0]; };

    const [formData, setFormData] = React.useState<CouponProps>({
        _id: '',
        seller_id: seller_id,
        coupon_by: coupon_by,
        usage_type: '',
        discount_type: '',
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

    const usage_type_options = [ "Single Usage", "Multi Usage", "Specific Users", "Buy One Get One"];
    const [image, setImage] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    const { hasAnyRole, hasPermission } = useUserAccess();
    const router = useRouter();
    const handleChange = useFormHandler(setFormData);

    const [applicableOn, setApplicableOn] = React.useState<string[]>([]);    
    const [targetOptions, setTargetOptions] = useState<{ label: string; value: string }[]>([]);
    const [selectedTargets, setSelectedTargets] = useState<string[]>([]);

    const [productsData, setProductsData] = useState<any[]>([]);
const [productBrandsData, setProductBrandsData] = useState<any[]>([]);
const [productTypesData, setProductTypesData] = useState<any[]>([]);

    useEffect(() => {
        const fetchTargetOptions = async () => {
            if (!applicableOn.length) { 
                setTargetOptions([]); 
                return; 
            }

            try {
                const res = await apiRequest("POST", `ecom/coupon`, {
                    function: "get_coupon_target_options",
                    module: applicableOn,
                    seller_id: formData.seller_id
                });

                console.log("RES", res)

                // const formatted = (res?.data || []).map((item: any) => ({ 
                //     label: item.name, 
                //     value: item._id || item.id 
                // }));
                // setTargetOptions(formatted);
            } catch (error) { clo(error); }
        };

        fetchTargetOptions();
    }, [applicableOn, formData.seller_id]);

    const fetchSingleEntry = useCallback(async () => {
        if (!dataId || !seller_id ) return;

        try {            
            const res = await apiRequest("GET", `ecom/coupon?function=get_single_coupon&id=${dataId}&seller_id=${seller_id}`);
            
            if (res?.data) {
                setFormData({
                    _id: res?.data.id,
                    seller_id: res?.data.seller_id?._id || '',
                    coupon_by: res?.data.coupon_by || "",
                    usage_type: res?.data.usage_type || "",
                    discount_type: res?.data.discount_type || '',
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
                if (res?.data.selected_targets) {
                    setSelectedTargets(res.data.selected_targets);
                }
            }
        } catch (error) { clo( error ); }
    }, [dataId, seller_id]);

    useEffect(() => { fetchSingleEntry(); }, [dataId, seller_id, fetchSingleEntry]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("function", "create_update_coupon");
            formDataToSend.append("seller_id", seller_id as string);
            formDataToSend.append("path", "coupon");
            formDataToSend.append("_id", formData._id as string);
            formDataToSend.append("coupon_by", formData.coupon_by);
            formDataToSend.append("usage_type", formData.usage_type);
            formDataToSend.append("discount_type", formData.discount_type);
            formDataToSend.append("discount", String( formData.discount ));
            formDataToSend.append("name", formData.name);
            formDataToSend.append("code", formData.code);
            formDataToSend.append("sales", String(formData.sales));
            formDataToSend.append("status", String(formData.status));
            formDataToSend.append("valid_from", formatDate(formData.valid_from) );
            formDataToSend.append("valid_to", formatDate(formData.valid_to) );
            formDataToSend.append("buy_one", formData.buy_one as string);
            formDataToSend.append("description", String(formData.description));
            formDataToSend.append("selected_targets", JSON.stringify(selectedTargets));

            const mediaIdToSend = formData.media_id && typeof formData.media_id === "object" && "_id" in formData.media_id 
                                       ? String((formData.media_id as MediaProps)._id) : typeof formData.media_id === "string" && formData.media_id !== "null" ? formData.media_id : "";
            formDataToSend.append("media_id", mediaIdToSend);
                           
            if (image) { formDataToSend.append("image", image); }

            await apiRequest("POST", `ecom/coupon`, formDataToSend);
            hitToastr('success', 'Entry Done');

            if( dataId ){ return; }

            if( hasAnyRole(["Seller", "Seller Staff"]) ){
                router.replace('/seller/coupon');
            }else{
                router.replace('/admin/coupon');
            }            
        } catch (error) { clo( error ); } finally { setIsSubmitting(false); }
    };

    const title = !dataId ? 'Add Coupon' : 'Update Coupon';
    return(
        <>
            <p>{title}</p>
            
            <form onSubmit={handleSubmit} style={{ padding: "10px" }} className="space-y-4">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
                    <SingleUserDropdown value={String(formData.seller_id)} onChange={(val) => handleChange("seller_id", val)} filters={{ role: ["Seller"] }}/>
                    <TextField type="text" label="Name" name="name" value={formData.name} onChange={handleChange} required/>
                    <TextField type="text" label="Code" name="code" value={formData.code} onChange={handleChange} required/>
                    <StatusSelect value={formData.status} onChange={(value) => handleChange("status", value)}/>
                    <OpenSelect name={String(formData.usage_type)} label="Usage Type" value={formData.usage_type} onChange={(value) => setFormData((prev) => ({...prev, usage_type: value}))} options={usage_type_options.map((mod) => ({ label: mod, value: mod }))}/>
                    <TextField type="date" label="Valid From" name="valid_from" value={String(formData.valid_from)} onChange={handleChange} required/>
                    <TextField type="date" label="Valid To" name="valid_to" value={String(formData.valid_to)} onChange={handleChange} required/>
                    <OpenSelect name={String(formData.discount_type)} label="Discount Type" value={formData.discount_type} onChange={(value) => setFormData((prev) => ({...prev, discount_type: value}))} options={["Amount Based", "Percent Based"].map((mod) => ({ label: mod, value: mod }))}/>
                    <MultiSelectDropdown label="Applicable On" selected={applicableOn} onChange={(selectedIds) => setApplicableOn(selectedIds)} options={[ { _id: "Product", name: "Product" }, { _id: "Product Brand", name: "Product Brand" }, { _id: "Product Type", name: "Product Type" } ]}/>
                    <TextField type="Number" label="Sales" name="sales" value={formData.sales} onChange={handleChange} required/>
                    <TextField type="number" label={`Discount (${formData.discount_type === "Amount Based" ? "₹" : "%"})`} name="discount" value={formData.discount} onChange={handleChange} required/>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", gridColumn: "span 1" }}>
                        <MediaImage media={formData.media as MediaProps}/>
                        <ImageUpload name="image" required={!formData.media_id} error={imageError} onChange={(_, file) => { setImage(file); }}/>
                    </div>
                </div>
                <Textarea label="Description" value={formData.description} name="description" onChange={handleChange} rows={2}/>
                <Button type="submit" color="primary" disabled={isSubmitting}>{title}</Button>
            </form>

{applicableOn.length > 0 && targetOptions.length > 0 && (
    <div className="mt-6 border rounded-xl p-4 bg-gray-50/50 space-y-4">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Select Target Products & SKUs</h3>
            <button
                type="button"
                onClick={() => {
                    // Collect all product IDs and SKU IDs to select everything
                    const allIds: string[] = [];
                    targetOptions.forEach((item: any) => {
                        allIds.push(item.value); // Product ID
                        if (item.sku && Array.isArray(item.sku)) {
                            item.sku.forEach((s: any) => allIds.push(s._id || s.id)); // SKU IDs
                        }
                    });
                    setSelectedTargets(allIds);
                }}
                className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:opacity-90"
            >
                Select All Products & SKUs
            </button>
        </div>

        <div className="max-h-96 overflow-y-auto rounded-lg border bg-white shadow-sm">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-100 text-xs uppercase text-gray-700 sticky top-0">
                    <tr>
                        <th className="p-3">Select</th>
                        <th className="p-3">Product / Target Name</th>
                        <th className="p-3">SKUs / Details</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {targetOptions.map((item: any) => {
                        const isProductSelected = selectedTargets.includes(item.value);
                        
                        return (
                            <React.Fragment key={item.value}>
                                <tr className="hover:bg-gray-50 font-medium">
                                    <td className="p-3">
                                        <input
                                            type="checkbox"
                                            checked={isProductSelected}
                                            onChange={() => {
                                                if (isProductSelected) {
                                                    // Deselect product and its SKUs
                                                    const skuIds = (item.sku || []).map((s: any) => s._id || s.id);
                                                    setSelectedTargets(prev => prev.filter(id => id !== item.value && !skuIds.includes(id)));
                                                } else {
                                                    // Select product and all its SKUs
                                                    const skuIds = (item.sku || []).map((s: any) => s._id || s.id);
                                                    setSelectedTargets(prev => Array.from(new Set([...prev, item.value, ...skuIds])));
                                                }
                                            }}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                    </td>
                                    <td className="p-3 text-gray-900">{item.label}</td>
                                    <td className="p-3 text-xs text-gray-500">
                                        {item.sku?.length ? `${item.sku.length} SKU(s) available` : 'N/A'}
                                    </td>
                                </tr>

                                {/* Render Nested SKUs if available */}
                                {item.sku && item.sku.length > 0 && item.sku.map((skuItem: any) => {
                                    const skuId = skuItem._id || skuItem.id;
                                    const isSkuSelected = selectedTargets.includes(skuId);

                                    return (
                                        <tr key={skuId} className="bg-gray-50/50 hover:bg-gray-100/50 text-xs">
                                            <td className="p-3 pl-8">
                                                <input
                                                    type="checkbox"
                                                    checked={isSkuSelected}
                                                    onChange={() => {
                                                        if (isSkuSelected) {
                                                            setSelectedTargets(prev => prev.filter(id => id !== skuId));
                                                        } else {
                                                            setSelectedTargets(prev => [...prev, skuId]);
                                                        }
                                                    }}
                                                    className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                            </td>
                                            <td className="p-3 text-gray-600 pl-6">└─ SKU: {skuItem.name || skuItem.sku || skuId}</td>
                                            <td className="p-3 text-gray-500">Price: ₹{skuItem.price || 0}</td>
                                        </tr>
                                    );
                                })}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
)}
        </>
    )
}

export default AddUpdateCouponForm;