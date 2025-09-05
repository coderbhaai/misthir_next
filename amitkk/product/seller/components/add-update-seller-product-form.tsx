"use client"
import React, { useRef } from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Button, Checkbox, Chip, FormControl, Grid, InputLabel, ListItemText, MenuItem, TextField, Typography } from "@mui/material";
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
import MediaPanel, { MediaPanelHandle } from "@amitkk/basic/components/media/media-panel";
import { SubmitButton } from "@amitkk/basic/static/LoadingSubmit";

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
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const vendor_id = useVendorId();
    const mediaPanelRef = useRef<MediaPanelHandle>(null);
    
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
    const [selectedStorage, setSelectedStorage] = React.useState<string[]>([]);
    const [storage, setStorage] = React.useState<{_id: string; name: string}[]>([]);

    const [flavors, setFlavors] = React.useState<{_id: string; name: string}[]>([]);
    const [colors, setColors] = React.useState<{_id: string; name: string}[]>([]);
    const [eggless, setEggless] = React.useState<{_id: string; name: string}[]>([]);
    const [glutten, setGlutten] = React.useState<{_id: string; name: string}[]>([]);
    const [sugar, setSugar] = React.useState<{_id: string; name: string}[]>([]);

    const [skus, setSkus] = useState<any[]>([]);
    const [openSkuModal, setOpenSkuModal] = useState(false);
    const [editingSkuIndex, setEditingSkuIndex] = useState<number | null>(null);

    const [selectedMediaIds, setSelectedMediaIds] = useState<any[]>([]);
    const handleSelect = (mediaIds: string[]) => {
        setSelectedMediaIds(mediaIds);
    };

    const fetchSingleEntry = useCallback(async () => {
        if (!dataId || !vendor_id ) return;

        try {
            const res = await apiRequest("get", `product/product?function=get_single_product&id=${dataId}&vendor_id=${vendor_id}`);
            
            if (res?.data) {
                setFormData({
                    name: res?.data.name || "",
                    url: res?.data.url || "",
                    gtin: res?.data.gtin || "",
                    adminApproval: res?.data.adminApproval || 1,
                    status: res?.data.status || true,
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

                const metas = res?.data?.metas || [];
                const categoryIds = metas.filter((m: any) => m.module === "Category").map((m: any) => m._id);
                const tagIds = metas.filter((m: any) => m.module === "Tag").map((m: any) => m._id);
                const typeIds = metas.filter((m: any) => m.module === "Type").map((m: any) => m._id);
                
                setSelectedCategory(categoryIds);
                setSelectedTag(tagIds);
                setSelectedProductTypes(typeIds);

                const brandIds = res?.data?.brands?.map((m: any) => m._id)|| [];
                setSelectedBrand(brandIds);

                const features = res?.data?.features || [];
                const storageIds = features.filter((m: any) => m.module === "Storage").map((m: any) => m._id)|| [];
                setSelectedStorage(storageIds);

                const ingirdientIds = res?.data?.ingridients?.map((m: any) => m._id)|| [];
                setSelectedIngridient(ingirdientIds);

                const mediaIds = res?.data?.medias?.map((m: any) => m._id)|| [];
                setSelectedMediaIds(mediaIds);

                const transformedSkus = (res?.data?.skus || []).map((sku: any) => ({
                    ...sku,
                    weight: sku.details?.weight ?? 0,
                    length: sku.details?.length ?? 0,
                    width: sku.details?.width ?? 0,
                    height: sku.details?.height ?? 0,
                    preparationTime: sku.details?.preparationTime ?? 0,
                    eggless_id: sku.eggless_id?._id || "",
                    sugarfree_id: sku.sugarfree_id?._id || "",
                    gluttenfree_id: sku.gluttenfree_id?._id || "",
                    flavors: (sku.flavors || []).map((f: any) => f._id),
                    colors: (sku.colors || []).map((c: any) => c._id),
                }));
                setSkus(transformedSkus);
            }
        } catch (error) { clo( error ); }
    }, [dataId]);

    useEffect(() => { fetchSingleEntry(); }, [dataId, vendor_id]);

    const initData = useCallback(async () => {
        if (!vendor_id) return;
        
        try {
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
    }, [vendor_id]);

    useEffect(() => { initData(); }, [initData]);
      
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if( !skus || !skus.length ){ hitToastr('success', 'SKUs are Required'); setOpenSkuModal(true); return; }
        if( !selectedMediaIds || !selectedMediaIds.length ){ hitToastr('success', 'Images are Required'); mediaPanelRef.current?.open(); return; }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("function", "create_update_product");
            formDataToSend.append("vendor_id", vendor_id as string);
            formDataToSend.append("path", "product");
            formDataToSend.append("module", "Product");
            formDataToSend.append("_id", formData._id);
            formDataToSend.append("name", formData.name);
            formDataToSend.append("url", formData.url);
            formDataToSend.append("short_desc", formData.short_desc as string);
            formDataToSend.append("long_desc", formData.long_desc as string);
            formDataToSend.append("dietary_type", formData.dietary_type);
            formDataToSend.append("gtin", formData.gtin as string);
            formDataToSend.append("status", String(formData.status));
            formDataToSend.append("skus", JSON.stringify(skus));
            formDataToSend.append("selectedMediaIds", JSON.stringify(selectedMediaIds));
            
            const productMeta = [...selectedCategory, ...selectedTag, ...selectedProductTypes];
            formDataToSend.append("productMeta", JSON.stringify(productMeta));
            formDataToSend.append("brands", JSON.stringify(selectedBrand));
            formDataToSend.append("storage", JSON.stringify(selectedStorage));
            formDataToSend.append("ingridients", JSON.stringify(selectedIngridient));
            
            formDataToSend.append("meta_id", formData.meta_id as string || "");
            formDataToSend.append("title", formData.title);
            formDataToSend.append("description", formData.description);

            const result = await apiRequest("post", `product/product`, formDataToSend);
            hitToastr('success', 'Entry Done');

            router.replace('/admin/seller/products');
            
        } catch (error) { clo( error ); } finally { setIsSubmitting(false); }
    };

    const handleChange = (e: SelectChangeEvent | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value === "true" ? true : value === "false" ? false : value })); 
    };

    const title = !dataId ? 'Add Product' : 'Update Product';

    return(
        <>
            <Box display="flex" alignItems="center" mb={5} sx={{ padding: "1em" }}>
                <Typography variant="h4" flexGrow={1}>{title}</Typography>
            </Box>
            
            <form onSubmit={handleSubmit} style={{ padding: "10px" }}>
                <Grid container spacing={4} justifyContent="center">
                    <Grid size={9}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, width: "100%" }}>
                                <TextField label="Product Name" variant="outlined" value={formData.name} name="name" fullWidth onChange={handleChange} required sx={{ gridColumn: "span 1" }}/>
                                <TextField label="Product URL" variant="outlined" value={formData.url} name="url" fullWidth onChange={handleChange} required sx={{ gridColumn: "span 1" }}/>
                                <TextField label="Product GTIN" variant="outlined" value={formData.gtin} name="gtin" fullWidth onChange={handleChange} sx={{ gridColumn: "span 1" }}/>
                                <FormControl sx={{ width: "100%" }}>
                                    <InputLabel id="dietary_type-label">Dietary Type <span style={{ color: "red" }}>*</span></InputLabel>
                                    <Select labelId="dietary_type-label" id="dietary_type" name="dietary_type" value={formData.dietary_type} onChange={handleChange}>
                                        <MenuItem value="Veg">Veg</MenuItem>
                                        <MenuItem value="Non-Veg">Non-Veg</MenuItem>
                                    </Select>
                                </FormControl>
                                <StatusSelect value={formData.status} onChange={handleChange}/>
                                <MultiSelectDropdown label="Types" options={productTypes} selected={selectedProductTypes} onChange={(e) => handleMultiSelectChange(e, setSelectedProductTypes)}/>
                                <MultiSelectDropdown label="Category" options={category} selected={selectedCategory} onChange={(e) => handleMultiSelectChange(e, setSelectedCategory)}/>
                                <MultiSelectDropdown label="Tags" options={tag} selected={selectedTag} onChange={(e) => handleMultiSelectChange(e, setSelectedTag)}/>
                                <MultiSelectDropdown label="Brands" options={brand} selected={selectedBrand} onChange={(e) => handleMultiSelectChange(e, setSelectedBrand)}/>
                                <MultiSelectDropdown label="Storage" options={storage} selected={selectedStorage} onChange={(e) => handleMultiSelectChange(e, setSelectedStorage)}/>
                                <MultiSelectDropdown label="Ingridients" options={ingridient} selected={selectedIngridient} onChange={(e) => handleMultiSelectChange(e, setSelectedIngridient)}/>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid size={3}>
                        <MediaPanel ref={mediaPanelRef} user_id={vendor_id} module="Product" onSelect={handleSelect} selectedMediaIds={selectedMediaIds}/>
                    </Grid>
                </Grid>

                <Box mt={2}>
                    <Button variant="outlined" sx={{ my: 5 }} onClick={() => { setEditingSkuIndex(null); setOpenSkuModal(true); }}>Add SKU</Button>
                    {skus.map((sku, index) => {
                        const flavorNames = sku.flavors ? flavors.filter((f: any) => sku.flavors.includes(f._id)).map((f: any) => f.name).join(', ') : '';
                        const colorNames = sku.colors ? colors.filter((f: any) => sku.colors.includes(f._id)).map((f: any) => f.name).join(', ') : '';
                        return (
                            <Box key={index} p={2} border="1px solid #ddd" borderRadius="8px" mb={2} sx={{ backgroundColor: 'background.paper', '&:hover': { backgroundColor: 'action.hover',} }}>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                    <Box flexGrow={1}>
                                        <Typography variant="h6" gutterBottom>{sku.name}</Typography>
                                        <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={1}>
                                            <Typography variant="body2"><strong>Price:</strong> ₹{sku.price}</Typography>
                                            <Typography variant="body2"><strong>Inventory:</strong> {sku.inventory}</Typography>
                                            <Typography variant="body2"><strong>Weight:</strong> {sku.weight || 0} units</Typography>
                                            <Typography variant="body2"><strong>Dimensions:</strong> {sku.length || 0}L × {sku.width || 0}W × {sku.height || 0}H</Typography>
                                            <Typography variant="body2"><strong>Prep Time:</strong> {sku.preparationTime || 0} mins</Typography>
                                            <Typography variant="body2"><strong>Display Order:</strong> {sku.displayOrder || 0}</Typography>
                                            {sku.eggless_id && ( <Typography variant="body2"><strong>Eggless:</strong> {eggless.find((e: any) => e._id === sku.eggless_id)?.name || 'N/A'}</Typography> )}
                                            {sku.sugarfree_id && ( <Typography variant="body2"><strong>Sugar Free:</strong> {sugar.find((s: any) => s._id === sku.sugarfree_id)?.name || 'N/A'}</Typography>)}
                                            {flavorNames && ( <Typography variant="body2"><strong>Flavors:</strong> {flavorNames}</Typography> )}
                                            {colorNames && ( <Typography variant="body2"><strong>Colors:</strong> {colorNames}</Typography> )}
                                        </Box>
                                    </Box>                                
                                    <Box display="flex" flexDirection="column" gap={1} ml={2}>
                                        <Button size="small" variant="outlined" onClick={() => { setEditingSkuIndex(index); setOpenSkuModal(true); }}>Edit</Button>
                                        <Button size="small" color="error" variant="outlined" onClick={() => setSkus(skus.filter((_, i) => i !== index))}>Delete</Button>
                                    </Box>
                                </Box>
                                {sku.status === false && ( <Typography variant="caption" color="error">Inactive</Typography> )}
                            </Box>
                        )})}

                    {skus.length === 0 && (
                        <Box my={3} p={3} textAlign="center" border="1px dashed #ddd" borderRadius="8px" sx={{ backgroundColor: 'grey.50' }}>
                        <Typography variant="body2" color="text.secondary">No SKUs added yet. Click "Add SKU" to get started.</Typography>
                            <Button variant="outlined" sx={{ my: 5 }} onClick={() => { setEditingSkuIndex(null); setOpenSkuModal(true); }}>Add SKU</Button>
                        </Box>
                    )}
                </Box>

                <SubmitButton loading={isSubmitting} title={title}/>
            </form>

            <SkuModal open={openSkuModal} eggless={eggless} sugar={sugar} flavors={flavors} colors={colors} glutten={glutten}
                handleCloseModal={() => { setOpenSkuModal(false); setEditingSkuIndex(null); }} 
                initialData={editingSkuIndex !== null ? skus[editingSkuIndex] : null}
                onSave={(data: any) => {
                    const payload = {
                        ...data,
                        details: {
                        weight: data.weight,
                        length: data.length,
                        width: data.width,
                        height: data.height,
                        preparationTime: data.preparationTime,
                        },
                    };

                    if (editingSkuIndex !== null) {
                        setSkus((prev) => prev.map((s, i) => (i === editingSkuIndex ? payload : s)));
                    } else {
                        setSkus((prev) => [...prev, payload]);
                    }

                    setEditingSkuIndex(null);
                    setOpenSkuModal(false);
                    }}/>
        </>
    )
}

export default SellerProductForm;