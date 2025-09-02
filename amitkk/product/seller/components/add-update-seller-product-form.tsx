"use client"
import React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Button, Checkbox, Chip, FormControl, InputLabel, ListItemText, MenuItem, TextField, Typography } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import router, { useRouter } from 'next/navigation';
import dynamic from "next/dynamic";
import ImageUpload from "@amitkk/basic/components/static/file-input";
import MetaInput from "@amitkk/basic/components/static/meta-input";
import MultiSelectDropdown from "@amitkk/basic/components/static/multiselect-dropdown";
import MediaImage from "@amitkk/basic/components/static/table-image";
import { apiRequest, clo, hitToastr, handleMultiSelectChange } from "@amitkk/basic/utils/utils";
import { MediaProps } from "@amitkk/basic/types/page";
import { ProductProps } from "@amitkk/product/types/product";
import { useVendorId } from "hooks/useVendorId";
import StatusSelect from "@amitkk/basic/components/static/status-input";
import SkuModal from "@amitkk/product/admin/SkuModal";

const CkEditor = dynamic(() => import("@amitkk/basic/components/static/ckeditor-input"), { 
  ssr: false, loading: () => <p>Loading editor...</p>,
});

export interface DataProps extends ProductProps {
    _id: string;
    title: string, description: string,
}

interface DataFormProps {
    dataId?: string;
}  

export const SellerProductForm: React.FC<DataFormProps> = ({ dataId = '' }) => {
    const vendor_id = useVendorId();
    const [formData, setFormData] = React.useState<DataProps>({
        name: '',
        url: '',
        gtin: '',
        short_desc: '',
        long_desc: '',
        vendor_id: '',
        adminApproval : true,
        status: true,
        dietary_type: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        _id: '',
        meta_id: '', title: '', description: ''
    });

    const router = useRouter();

    useEffect(() => {
        if (dataId) {
            const fetchSingleEntry = async () => {
                try {
                    const res = await apiRequest("get", `product/product?function=get_single_product&id=${dataId}`);
                    
                    if (res?.data) {
                        setFormData({
                            name: res?.data.name || "",
                            url: res?.data.url || "",
                            gtin: res?.data.gtin || "",
                            adminApproval: res?.data.adminApproval || 1,
                            status: res?.data.status || 1,
                            dietary_type: res?.data.dietary_type || "",
                            vendor_id: res?.data.vendor_id?._id || '',
                            short_desc: res?.data.short_desc || "",
                            long_desc: res?.data.long_desc || "",
                            createdAt: res?.data.createdAt,
                            updatedAt: res?.data.updatedAt,
                            _id: res?.data.id,
                            meta_id: res?.data.meta_id?._id || '',
                            title: res?.data.meta_id?.title || '',
                            description: res?.data.meta_id?.description || '',
                        });

                        const categoryIds = res?.data.productMeta ?.filter((m: any) => m.blogmeta_id?.type === "category") ?.map((m: any) => m.blogmeta_id?._id) || [];
                        setSelectedCategory(categoryIds);

                        const tagIds = res?.data.productMeta ?.filter((m: any) => m.blogmeta_id?.type === "tag") ?.map((m: any) => m.blogmeta_id?._id) || [];
                        setSelectedTag(tagIds);

                        const storageIds = res?.data.productFeature ?.filter((m: any) => m.productFeature_id?.module === "Storage") ?.map((m: any) => m.productFeature_id?._id) || [];
                        setSelectedStorage(storageIds);

                        const brandIds = res?.data.productBrand ?.map((m: any) => m.productBrand_id?._id) || [];
                        setSelectedBrand(brandIds);

                        const ingridientIds = res?.data.productIngridient ?.map((m: any) => m.ingridient_id?._id) || [];
                        setSelectedIngridient(ingridientIds);
                    }
                } catch (error) { clo( error ); }
            }
            fetchSingleEntry();
        }
    }, [dataId]);

    const [selectedCategory, setSelectedCategory] = React.useState<string[]>([]);
    const [category, setCategory] = React.useState<{_id: string; name: string}[]>([]);
    const [selectedTag, setSelectedTag] = React.useState<string[]>([]);
    const [tag, setTag] = React.useState<{_id: string; name: string}[]>([]);
    const [selectedProductTypes, setSelectedProductTypes] = React.useState<string[]>([]);
    const [productTypes, setProductTypes] = React.useState<{_id: string; name: string}[]>([]);
    const [selectedBrand, setSelectedBrand] = React.useState<string[]>([]);
    const [brand, setBrand] = React.useState<{_id: string; name: string}[]>([]);
    const [selectedIngridient, setSelectedIngridient] = React.useState<string[]>([]);
    const [ingridient, setIngridient] = React.useState<{_id: string; name: string}[]>([]);

    const [selectedFlavors, setSelectedFlavors] = React.useState<string[]>([]);
    const [flavors, setFlavors] = React.useState<{_id: string; name: string}[]>([]);
    const [selectedColors, setSelectedColors] = React.useState<string[]>([]);
    const [colors, setColors] = React.useState<{_id: string; name: string}[]>([]);
    const [selectedEggless, setSelectedEggless] = React.useState<string[]>([]);
    const [eggless, setEggless] = React.useState<{_id: string; name: string}[]>([]);
    const [selectedGlutten, setSelectedGlutten] = React.useState<string[]>([]);
    const [glutten, setGlutten] = React.useState<{_id: string; name: string}[]>([]);
    const [selectedSugar, setSelectedSugar] = React.useState<string[]>([]);
    const [sugar, setSugar] = React.useState<{_id: string; name: string}[]>([]);
    const [selectedStorage, setSelectedStorage] = React.useState<string[]>([]);
    const [storage, setStorage] = React.useState<{_id: string; name: string}[]>([]);

    const [skus, setSkus] = useState<any[]>([]);
    const [openSkuModal, setOpenSkuModal] = useState(false);
    const [editingSkuIndex, setEditingSkuIndex] = useState<number | null>(null);

    const initData = useCallback(async () => {
        try {
            console.log("vendor_id", vendor_id)
            const res_1 = await apiRequest("get", `product/product?function=get_product_modules&vendor_id=${vendor_id}`);
            setCategory(res_1?.data?.category ?? []);
            setTag(res_1?.data?.tag ?? []);
            setProductTypes(res_1?.data?.productTypes ?? []);
            setBrand(res_1?.data?.productBrand ?? []);
            setIngridient(res_1?.data?.ingridient ?? []);
            setFlavors(res_1?.data?.flavors ?? []);
            setColors(res_1?.data?.colors ?? []);
            setEggless(res_1?.data?.eggless ?? []);
            setGlutten(res_1?.data?.glutten ?? []);
            setSugar(res_1?.data?.sugar ?? []);
            setStorage(res_1?.data?.storage ?? []);

        } catch (error) { clo( error ); }
    }, []);

    useEffect(() => {
        if (!vendor_id) return;

        initData();
    }, [vendor_id]);
      
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("function", "create_update_blog");
            formDataToSend.append("vendor_id", vendor_id as string);
            formDataToSend.append("path", "product");
            formDataToSend.append("_id", formData._id);
            formDataToSend.append("name", formData.name);
            formDataToSend.append("url", formData.url);
            
            const productMeta = [...selectedCategory, ...selectedTag];
            formDataToSend.append("productMeta", JSON.stringify(productMeta));
            
            const productFeature = [...selectedFlavors, ...selectedColors, ...selectedEggless, ...selectedGlutten, ...selectedStorage ];
            formDataToSend.append("productFeature", JSON.stringify(productFeature));
            
            formDataToSend.append("meta_id", formData.meta_id as string || "");
            formDataToSend.append("title", formData.title);
            formDataToSend.append("description", formData.description);

            const result = await apiRequest("post", `product/product`, formDataToSend);
            hitToastr('success', 'Entry Done');

            // router.replace('/admin/seller/products');
            
        } catch (error) { clo( error ); }
    };

    // const handleAuthorChange = (e: SelectChangeEvent) => {
    //     const { value } = e.target;
    //     setFormData((prevData) => ({ ...prevData, author_id: value }));
    // };

    const handleChange = (e: SelectChangeEvent | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value === "true" ? true : value === "false" ? false : value })); 
    };

    const title = !dataId ? 'Add Product' : 'Update Product';
    
    console.log("flavors In Product", flavors)
    return(
        <>
            <Box display="flex" alignItems="center" mb={5} sx={{ padding: "1em" }}>
                <Typography variant="h4" flexGrow={1}>{title}</Typography>
            </Box>
            <form onSubmit={handleSubmit} style={{ padding: "10px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, width: "100%" }}>
                        <TextField label="Product Name" variant="outlined" value={formData.name} name="name" fullWidth onChange={handleChange} required sx={{ gridColumn: "span 1" }}/>
                        <TextField label="Product URL" variant="outlined" value={formData.url} name="url" fullWidth onChange={handleChange} required sx={{ gridColumn: "span 1" }}/>
                        <TextField label="Product GTIN" variant="outlined" value={formData.gtin} name="gtin" fullWidth onChange={handleChange} sx={{ gridColumn: "span 1" }}/>
                        <StatusSelect value={formData.status} onChange={handleChange}/>
                        <MultiSelectDropdown label="Types" options={productTypes} selected={selectedProductTypes} onChange={(e) => handleMultiSelectChange(e, setSelectedProductTypes)}/>
                        <MultiSelectDropdown label="Category" options={category} selected={selectedCategory} onChange={(e) => handleMultiSelectChange(e, setSelectedCategory)}/>
                        <MultiSelectDropdown label="Tags" options={tag} selected={selectedTag} onChange={(e) => handleMultiSelectChange(e, setSelectedTag)}/>
                        <MultiSelectDropdown label="Brands" options={brand} selected={selectedBrand} onChange={(e) => handleMultiSelectChange(e, setSelectedBrand)}/>
                        <MultiSelectDropdown label="Storage" options={storage} selected={selectedStorage} onChange={(e) => handleMultiSelectChange(e, setSelectedStorage)}/>
                        <MultiSelectDropdown label="Ingridients" options={ingridient} selected={selectedIngridient} onChange={(e) => handleMultiSelectChange(e, setSelectedIngridient)}/>
                    </Box>
                </Box>

                <Box>
                    <Button variant="outlined" sx={{ my: 5 }} onClick={() => { setEditingSkuIndex(null); setOpenSkuModal(true); }}>Add SKU</Button>

                    <Box mt={2}>
                        {skus.map((sku, index) => (
                            <Box key={index} display="flex" justifyContent="space-between" alignItems="center" mb={1} p={1} border="1px solid #ddd" borderRadius="8px">
                                <Typography>{sku.name} - ₹{sku.price} - Stock: {sku.inventory}</Typography>
                                <Box>
                                    <Button size="small" onClick={() => { setEditingSkuIndex(index); setOpenSkuModal(true); }}>Edit</Button>
                                    <Button size="small" color="error" onClick={() => setSkus(skus.filter((_, i) => i !== index))}>Delete</Button>
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    <SkuModal
                        open={openSkuModal}
                        handleCloseModal={() => setOpenSkuModal(false)}
                        initialData={editingSkuIndex !== null ? skus[editingSkuIndex] : null}
                        onSave={(data: any) => {
                            if (editingSkuIndex !== null) {
                                setSkus((prev) => prev.map((s, i) => (i === editingSkuIndex ? data : s)));
                            } else {
                                setSkus((prev) => [...prev, data]);
                            }
                        }}
                        eggless={eggless} sugar={sugar} flavors={flavors}
                    />
                </Box>

                <Button type="submit" variant="contained" color="primary">{title}</Button>
            </form>
        </>
    )
}

export default SellerProductForm;