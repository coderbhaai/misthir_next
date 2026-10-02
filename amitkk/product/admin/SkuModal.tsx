import GenericSelect from "@amitkk/components/admin/generic-select";
import MultiSelectDropdown from "@amitkk/components/admin/multiselect-dropdown";
import CustomModal from "@amitkk/basic/static/CustomModal";
import { useState, useEffect } from "react";
import { ProductFeatureProps, SkuDetailProps, SkuProductFeatureRelationItem, SkuProps } from "../types";
import { apiRequest, clo, handleMultiSelectChange, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import { TextField } from "@amitkk/components/basic/TextField";
import { Button } from "@amitkk/components/button/button";
import OpenSelect from "@amitkk/components/basic/OpenSelect";
import StatusSelect from "@amitkk/components/admin/status-input";
import { useFormHandler, useSetForm } from "hooks/useFormHandler";
import { extractFeatureValues } from "@amitkk/basic/utils/my-utils/ecom-utils";
import StickyFormFooter from "@amitkk/components/ui/StickyFormFooter";

interface SkuModalProps {
  open: boolean;
  handleCloseModal: () => void;
  onSave: (data: SkuProps) => void;
  initialData: SkuProps | null;
}
  const emptyForm: SkuProps = {
    _id: "",
    product_id: "",
    name: "",
    price: "",
    item_code: "",
    unit: "",
    price_per_unit: "",
    inventory: 0,
    status: true,
    displayOrder: 0,
    adminApproval: true,
    eggless_id: "",
    sugarfree_id: "",
    gluttenfree_id: "",
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    preparationTime: 0,
    flavors: [],
    colors: [],
  };

export default function SkuModal({ open, handleCloseModal, onSave, initialData }: SkuModalProps) {
  const [loading, setLoading] = useState(false);

  const [options, setOptions] = useState<{
    eggless: { _id: string; name: string }[];
    sugar: { _id: string; name: string }[];
    flavors: { _id: string; name: string }[];
    colors: { _id: string; name: string }[];
    glutten: { _id: string; name: string }[];
  }>({
    eggless: [],
    sugar: [],
    flavors: [],
    colors: [],
    glutten: [],
  });

  useEffect(() => {
    if (!open) return;

    const fetchSkuOptions = async () => {
      setLoading(true);
      try {
        const res = await apiRequest("GET", "product/product?function=get_sku_modules");
        if (res?.data) {
          setOptions(res.data);
        }
      } catch (error) { 
        clo(error); 
      } finally { 
        setLoading(false); 
      }
    };

    fetchSkuOptions();
  }, [open]);

  const [formData, setFormData] = useState<SkuProps>(emptyForm);
  
useEffect(() => {
    if (initialData) {
      const extractedFlavors = extractFeatureValues( initialData?.flavors?.length ? initialData.flavors : initialData?.features, "Flavor", "_id" );
      const extractedColors = extractFeatureValues( initialData?.colors?.length ? initialData.colors : initialData?.features, "Color", "_id" );
      setFormData({
        _id: initialData?._id || '',
        product_id: initialData?.product_id || '',
        name: initialData?.name || '',
        price: initialData?.price || '',
        item_code: initialData?.item_code || '',
        unit: initialData?.unit || '',
        price_per_unit: initialData?.price_per_unit || '',
        inventory: initialData?.inventory || '',
        status: initialData?.status ?? true,
        displayOrder: initialData?.displayOrder || null,
        adminApproval: initialData?.adminApproval ?? true,
        eggless_id: typeof initialData?.eggless_id === 'object' ? (initialData?.eggless_id as ProductFeatureProps)?._id || '' : initialData?.eggless_id || '',
        sugarfree_id: typeof initialData?.sugarfree_id === 'object' ? (initialData?.sugarfree_id as ProductFeatureProps)?._id || '' : initialData?.sugarfree_id || '',
        gluttenfree_id: typeof initialData?.gluttenfree_id === 'object' ? (initialData?.gluttenfree_id as ProductFeatureProps)?._id || '' : initialData?.gluttenfree_id || '',
        weight: (initialData?.details as SkuDetailProps)?.weight || null,
        length: (initialData?.details as SkuDetailProps)?.length || null,
        width: (initialData?.details as SkuDetailProps)?.width || null,
        height: (initialData?.details as SkuDetailProps)?.height || null,
        preparationTime: (initialData?.details as SkuDetailProps)?.preparationTime || null,
        flavors: extractedFlavors,
        colors: extractedColors,
      });

      setSelectedFlavor(extractedFlavors);
      setSelectedColor(extractedColors);

    } else {
      setFormData(emptyForm);
      setSelectedFlavor([]);
      setSelectedColor([]);
    }
  }, [initialData, open]);

  const [selectedFlavor, setSelectedFlavor] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string[]>([]);

  const handleChange = useFormHandler(setFormData);
  const setValue = useSetForm(setFormData);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formData.name) { hitToastr("error", "Name is required."); return; }
    if (!formData.price) { hitToastr("error", "Price is required."); return; }
    if (!formData.inventory) { hitToastr("error", "Inventory is required."); return; }
    if (!formData.eggless_id) { hitToastr("error", "Eggless is required."); return; }
    if (!formData.sugarfree_id) { hitToastr("error", "Sugarfree is required."); return; }

    const populatedFlavors = selectedFlavor.map(id => {
      const found = options.flavors.find(f => f._id === id);
      return found ? { _id: found._id, name: found.name, module: "Flavor" } : id;
    });

    const populatedColors = selectedColor.map(id => {
      const found = options.colors.find(c => c._id === id);
      return found ? { _id: found._id, name: found.name, module: "Color" } : id;
    });
    
    const foundEggless = options.eggless.find(e => e._id === formData.eggless_id);
    const egglessObj = foundEggless ? { _id: foundEggless._id, name: foundEggless.name, module: "Eggless" } : formData.eggless_id;

    const foundSugar = options.sugar.find(s => s._id === formData.sugarfree_id);
    const sugarObj = foundSugar ? { _id: foundSugar._id, name: foundSugar.name, module: "Sugarfree" } : formData.sugarfree_id;

    const foundGluten = options.glutten.find(g => g._id === formData.gluttenfree_id);
    const glutenObj = foundGluten ? { _id: foundGluten._id, name: foundGluten.name, module: "Glutenfree" } : formData.gluttenfree_id;

    onSave({ 
      ...formData, 
      flavors: populatedFlavors, 
      colors: populatedColors,
      eggless_id: egglessObj,
      sugarfree_id: sugarObj,
      gluttenfree_id: glutenObj
    } as any);
    handleCloseModal();
  };

  const ppuOptions = [
    { label: "Per Box", value: "Per Box" },
    { label: "Per Dozen", value: "Per Dozen" },
  ];

  const title = initialData ? "Edit SKU" : "Add SKU";

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <TextField label="Name" name="name" value={formData.name} onChange={handleChange} required />
            <TextField label="Item Code" name="item_code" value={formData.item_code} onChange={handleChange} required />
            <OpenSelect name="unit" label="unit" value={String(formData.unit)} options={ppuOptions} onChange={(value) => setValue("unit", value)} required />
            <TextField label="Price Per Unit" name="price_per_unit" type="number" value={formData.price_per_unit} onChange={handleChange} required />
            <TextField label="Price" name="price" type="number" value={formData.price} onChange={handleChange} required />
            <TextField label="Inventory" name="inventory" type="number" value={formData.inventory} onChange={handleChange} required />
            <TextField label="Display Order" name="displayOrder" type="number" value={formData.displayOrder} onChange={handleChange} />
            <TextField label="Weight" name="weight" type="number" value={formData.weight} onChange={handleChange} />
            <TextField label="Length" name="length" type="number" value={formData.length} onChange={handleChange} />
            <TextField label="Width" name="width" type="number" value={formData.width} onChange={handleChange} />
            <TextField label="Height" name="height" type="number" value={formData.height} onChange={handleChange} />
            <TextField label="Preparation Time (mins)" name="preparationTime" type="number" value={formData.preparationTime} onChange={handleChange} />
            
            <GenericSelect label="Eggless" name="eggless_id" value={formData.eggless_id?.toString() ?? ""} options={options.eggless ?? []} onChange={(val) => setFormData({ ...formData, eggless_id: val as string })} />
            <GenericSelect label="SugarFree" name="sugarfree_id" value={formData.sugarfree_id?.toString() ?? ""} options={options.sugar ?? []} onChange={(val) => setFormData({ ...formData, sugarfree_id: val as string })} />
            <GenericSelect label="Glutten Free" name="gluttenfree_id" value={formData.gluttenfree_id?.toString() ?? ""} options={options.glutten ?? []} onChange={(val) => setFormData({ ...formData, gluttenfree_id: val as string })} />
            
            <MultiSelectDropdown label="Flavors" options={options.flavors ?? []} selected={selectedFlavor} onChange={(e) => handleMultiSelectChange(e, setSelectedFlavor)} />
            <MultiSelectDropdown label="Colors" options={options.colors ?? []} selected={selectedColor} onChange={(e) => handleMultiSelectChange(e, setSelectedColor)} />
            
            <StatusSelect value={formData.status} onChange={(value) => setValue("status", value)} />
          </div>
          
          <StickyFormFooter title={title}/>
        </form>
    </CustomModal>
  );
}