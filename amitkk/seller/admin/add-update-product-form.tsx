"use client"
import React, { useRef } from "react";
import { useState, useEffect, useCallback, } from "react";
import router, { useRouter } from 'next/navigation';
import dynamic from "next/dynamic";
import MetaInput from "@amitkk/components/admin/meta-input";
import MultiSelectDropdown from "@amitkk/components/admin/multiselect-dropdown";
import { apiRequest, clo, handleMultiSelectChange, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import { SingleProductItemProps } from "@amitkk/product/types";
import { useVendorId } from "hooks/useVendorId";
import StatusSelect from "@amitkk/components/admin/status-input";
import SkuModal from "@amitkk/product/admin/SkuModal";
import GenericSelect from "@amitkk/components/admin/generic-select";
import { useFormHandler } from "hooks/useFormHandler";
import { TextField } from "@amitkk/components/basic/TextField";
import OpenSelect from "@amitkk/components/basic/OpenSelect";
import { Button } from "@amitkk/components/button/button";
import MediaPanel, { MediaPanelHandle } from "@amitkk/basic/admin/media/media-panel";
import { SubmitButton } from "@amitkk/components/button/LoadingSubmit";
import { useAuth } from "contexts/AuthContext";
import SingleUserDropdown from "@amitkk/basic/admin/spatie/SingleUserDropdown";
import SkuCardList from "@amitkk/product/static/SkuCardList";

const CkEditor = dynamic(() => import("@amitkk/components/admin/ckeditor-input"), { 
  ssr: false, loading: () => <p>Loading editor...</p>,
});

export interface DataProps extends SingleProductItemProps {
    _id: string;
    title: string, description: string,
}

interface DataFormProps {
    dataId?: string;
}  

export const SellerProductForm: React.FC<DataFormProps> = ({ dataId = "" }) => {
  const { can } = useAuth();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const seller_id = useVendorId();
    const mediaPanelRef = useRef<MediaPanelHandle>(null);
    
    const [formData, setFormData] = React.useState<DataProps>({
      _id: '',
      name: '',
      url: '',
      gtin: '',
      short_desc: '',
      long_desc: '',
      seller_id: '',
      tax_id: '',
      adminApproval : true,
      status: true,
      displayOrder: null,
      dietary_type: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      meta_id: '', title: '', description: ''
    });

    const router = useRouter();
    const handleChange = useFormHandler(setFormData);
    const [short_desc, setShortDesc] = useState("");
    const [shortDescError, setShortDescError] = useState<string | null>(null);
    const [long_desc, setLongDesc] = useState("");
    const [longDescError, setLongDescError] = useState<string | null>(null);
    const handleShortEditorChange = (name: string, value: string) => { setShortDesc(value); };
    const handleLongEditorChange = (name: string, value: string) => { setLongDesc(value); };
    const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
    const [taxOptions, setTaxOptions] = useState<{_id: string; name: string}[]>([]);
    const [category, setCategory] = useState<{_id: string; name: string}[]>([]);
    const [selectedTag, setSelectedTag] = useState<string[]>([]);
    const [tag, setTag] = useState<{_id: string; name: string}[]>([]);
    const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>([]);
    const [productTypes, setProductTypes] = useState<{_id: string; name: string}[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<string[]>([]);
    const [brand, setBrand] = useState<{_id: string; name: string}[]>([]);
    const [selectedIngridient, setSelectedIngridient] = useState<string[]>([]);
    const [ingridient, setIngridient] = useState<{_id: string; name: string}[]>([]);
    const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
    const [storage, setStorage] = useState<{_id: string; name: string}[]>([]);
    const [skus, setSkus] = useState<any[]>([]);
    const [openSkuModal, setOpenSkuModal] = useState(false);
    const [editingSkuIndex, setEditingSkuIndex] = useState<number | null>(null);

    const [selectedMediaIds, setSelectedMediaIds] = useState<any[]>([]);

    const fetchSingleEntry = useCallback(async () => {
      if (!dataId || !seller_id) return;

      try {
          const res = await apiRequest("GET", `product/product?function=get_single_product&id=${dataId}`);

          console.log("RES.data", res.data)

          if (res?.data) {
              const product = res.data;

              setFormData({
                  _id: product.id || product._id || '',
                  name: product.name || "",
                  url: product.url || "",
                  gtin: product.gtin || "",
                  adminApproval: product.adminApproval ?? 1,
                  status: product.status ?? true,
                  displayOrder: product.displayOrder || null,
                  dietary_type: product.dietary_type || "",
                  seller_id: product.seller_id?._id || '',
                  tax_id: product.tax_id?._id || product.tax_id || '',
                  short_desc: product.short_desc || "",
                  long_desc: product.long_desc || "",
                  createdAt: product.createdAt,
                  updatedAt: product.updatedAt,
                  meta_id: product.meta_id?._id || product.meta_id || '',
                  title: product.meta_id?.title || '',
                  description: product.meta_id?.description || '',
              });

              setShortDesc(product.short_desc || "");
              setLongDesc(product.long_desc || "");
              setSelectedCategory( product?.productMeta?.filter((m: any) => m.productmeta_id?.module === "Category").map((m: any) => m.productmeta_id?._id || m.productmeta_id).filter(Boolean) || [] );
              setSelectedTag( product?.productMeta?.filter((m: any) => m.productmeta_id?.module === "Tag").map((m: any) => m.productmeta_id?._id || m.productmeta_id).filter(Boolean) || [] );
              setSelectedProductTypes( product?.productMeta?.filter((m: any) => m.productmeta_id?.module === "Type").map((m: any) => m.productmeta_id?._id || m.productmeta_id).filter(Boolean) || [] );
              setSelectedBrand(product?.productBrand?.map((m: any) => m.productBrand_id?._id) || []);
              setSelectedStorage(product?.productFeature?.filter((m: any) => m?.productFeature_id?.module === "Storage").map((m: any) => m?.productFeature_id?._id) || []);
              setSelectedIngridient(product?.productIngridient?.map((m: any) => m?.ingridient_id?._id) || []);
              setSelectedMediaIds(product?.medias?.map((m: any) => m._id) || []);
              const incomingSkus = product?.sku || [];
              setSkus(incomingSkus);
          }
      } catch (error) { 
          clo(error); 
      }
  }, [dataId, seller_id]);

    useEffect(() => { fetchSingleEntry(); }, [dataId, seller_id]);

    const initData = useCallback(async () => {
        if (!seller_id) return;
        
        try {
          const res_1 = await apiRequest("POST", `product/product`,{
            function: "get_product_modules",
            seller_id
          });

          setCategory(res_1?.data?.category ?? []);
          setTag(res_1?.data?.tag ?? []);
          setProductTypes(res_1?.data?.productTypes ?? []);
          setBrand(res_1?.data?.productBrand ?? []);
          setIngridient(res_1?.data?.ingridient ?? []);
          setStorage(res_1?.data?.storage ?? []);
          setTaxOptions(res_1?.data?.tax ?? []);
        } catch (error) { clo( error ); }
    }, [seller_id]);

    useEffect(() => { initData(); }, [initData]);
      
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if( !skus || !skus.length ){ hitToastr('success', 'SKUs are Required'); setOpenSkuModal(true); return; }

        if ( can("Edit Product") ) {
            setShortDescError(!short_desc ? "Short Description is required." : null);
            if (!short_desc?.trim()) { hitToastr("error", "Short Description is required!"); return; }

            setLongDescError(!long_desc ? "Long Description is required." : null);
            if (!long_desc?.trim()) { hitToastr("error", "Long Description is required!"); return; }
        }

        setIsSubmitting(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("function", "create_update_product");
            formDataToSend.append("seller_id", (formData.seller_id || seller_id) as string);
            formDataToSend.append("path", "product");
            formDataToSend.append("module", "Product");
            formDataToSend.append("_id", formData._id);
            formDataToSend.append("name", formData.name);
            formDataToSend.append("tax_id", formData.tax_id as string);
            formDataToSend.append("url", formData.url);
            formDataToSend.append("short_desc", short_desc as string);
            formDataToSend.append("long_desc", long_desc as string);
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

            const res = await apiRequest("POST", `product/product`, formDataToSend);
            if( res?.data ){
              hitToastr('success', res?.message);
            }

            if( !dataId ){
              if( can("Edit Product") ){
                router.replace('/admin/products');
              }else{
                router.replace('/admin/seller/products');
              }
            }            
        } catch (error) { clo( error ); } finally { setIsSubmitting(false); }
    };

    const title = !dataId ? 'Add Product' : 'Update Product';

    return(
        <>
            <div className="py-5">
                <p>{title}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                <TextField label="Product Name" value={formData.name} name="name" onChange={handleChange} required/>
                <TextField label="Product URL" value={formData.url} name="url" onChange={handleChange} required/>
                <TextField label="Product GTIN" value={formData.gtin} name="gtin" onChange={handleChange}/>
                <OpenSelect name={String(formData.dietary_type)} label="Dietary Type" value={formData.dietary_type} onChange={(value) => setFormData((prev) => ({...prev, dietary_type: value}))} options={["Veg", "Non-Veg"].map((mod) => ({ label: mod, value: mod }))}/>
                <StatusSelect value={formData.status} onChange={(value) => handleChange("status", value)}/>
                <GenericSelect label="Tax" name="tax_id" value={formData.tax_id?.toString() ?? ""} options={taxOptions} onChange={(val) => setFormData({ ...formData, tax_id: val as string })}/>
                <SingleUserDropdown value={formData.seller_id} onChange={(val) => handleChange("seller_id", val)} filters={{ role: ["Seller"] }}/>
              </div>
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                <MultiSelectDropdown label="Types" options={productTypes} selected={selectedProductTypes} onChange={(e) => handleMultiSelectChange(e, setSelectedProductTypes)}/>
                <MultiSelectDropdown label="Category" options={category} selected={selectedCategory} onChange={(e) => handleMultiSelectChange(e, setSelectedCategory)}/>
                <MultiSelectDropdown label="Tags" options={tag} selected={selectedTag} onChange={(e) => handleMultiSelectChange(e, setSelectedTag)}/>
                <MultiSelectDropdown label="Brands" options={brand} selected={selectedBrand} onChange={(e) => handleMultiSelectChange(e, setSelectedBrand)}/>
                <MultiSelectDropdown label="Storage" options={storage} selected={selectedStorage} onChange={(e) => handleMultiSelectChange(e, setSelectedStorage)}/>
                <MultiSelectDropdown label="Ingridients" options={ingridient} selected={selectedIngridient} onChange={(e) => handleMultiSelectChange(e, setSelectedIngridient)}/>
              </div>

              {can("Edit Product") && ( <MetaInput title={formData.title} description={formData.description} onChange={handleChange}/> )}
              <MediaPanel ref={mediaPanelRef} module="Product" module_id={dataId}/>

              <div className="mt-3">
                <Button type="button" onClick={() => { setEditingSkuIndex(null); setOpenSkuModal(true); }}>Add SKU</Button>
                <SkuCardList skus={skus} showActions={true} onEdit={(index) => { setEditingSkuIndex(index); setOpenSkuModal(true); }} onDelete={(index) => setSkus(skus.filter((_, i) => i !== index))}/>
              </div>

              {can("Edit Product") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-8">
                      <CkEditor label="Short Description" name="shortDesc" value={short_desc} onChange={handleShortEditorChange} required error={shortDescError} />
                      <CkEditor label="Long Description" name="longDesc" value={long_desc} onChange={handleLongEditorChange} required error={longDescError} />
                  </div>
              )}

              <SubmitButton loading={isSubmitting} title={title}/>
            </form>

            <SkuModal 
              open={openSkuModal}
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

                    flavors: data.flavors.map((flavorId: string) => {
                      if (typeof flavorId === 'object' && flavorId !== null) return flavorId;
                      const originalSku = editingSkuIndex !== null ? skus[editingSkuIndex] : null;
                      const existing = originalSku?.flavors?.find((f: any) => (f._id || f) === flavorId);
                      if (typeof existing === 'object' && existing !== null) return existing;
                      
                      return flavorId;
                    }),
                    colors: data.colors.map((colorId: string) => {
                      if (typeof colorId === 'object' && colorId !== null) return colorId;
                      const originalSku = editingSkuIndex !== null ? skus[editingSkuIndex] : null;
                      const existing = originalSku?.colors?.find((c: any) => (c._id || c) === colorId);
                      if (typeof existing === 'object' && existing !== null) return existing;
                      
                      return colorId;
                    })
                };
                if (editingSkuIndex !== null) {
                    setSkus((prev) => prev.map((s, i) => (i === editingSkuIndex ? payload : s)));
                } else {
                    setSkus((prev) => [...prev, payload]);
                }
                
                setEditingSkuIndex(null); 
                setOpenSkuModal(false);
              }}
            />
        </>
    )
}

export default SellerProductForm;