import GenericSelect from "@amitkk/basic/components/static/generic-select";
import MultiSelectDropdown from "@amitkk/basic/components/static/multiselect-dropdown";
import CustomModal from "@amitkk/basic/static/CustomModal";
import { handleMultiSelectChange, hitToastr } from "@amitkk/basic/utils/utils";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from "@mui/material";
import { useState, useEffect } from "react";

export default function SkuModal({ open, handleCloseModal, onSave, initialData, eggless, sugar, flavors }: any) {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    price: "",
    inventory: "",
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
  });
  useEffect(() => { if (initialData) setFormData(initialData); }, [initialData]);

  const [selectedFlavor, setSelectedFlavor] = useState<string[]>([]);
    const [flavor, setFlavor] = useState<{_id: string; name: string}[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if ( formData.name ) { hitToastr("error", "Name is required."); return; }
    if ( formData.price ) { hitToastr("error", "Price is required."); return; }
    if ( formData.inventory ) { hitToastr("error", "Inventory is required."); return; }
    if ( formData.eggless_id ) { hitToastr("error", "Eggless is required."); return; }
    if ( formData.sugarfree_id ) { hitToastr("error", "Sugarfree is required."); return; }

    onSave(formData);
    handleCloseModal();
  };

  const title = initialData ? "Edit SKU" : "Add SKU";

  console.log("flavors In Sku", flavors)

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
        <form onSubmit={handleSubmit} style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={2}>
                <TextField label="Name" name="name" value={formData.name} onChange={handleChange} required />
                <TextField label="Price" name="price" type="number" value={formData.price} onChange={handleChange} required />
                <TextField label="Inventory" name="inventory" type="number" value={formData.inventory} onChange={handleChange} required />
                <TextField label="Display Order" name="displayOrder" type="number" value={formData.displayOrder} onChange={handleChange} />
                <TextField label="Weight" name="weight" type="number" value={formData.weight} onChange={handleChange} />
                <TextField label="Length" name="length" type="number" value={formData.length} onChange={handleChange} />
                <TextField label="Width" name="width" type="number" value={formData.width} onChange={handleChange} />
                <TextField label="Height" name="height" type="number" value={formData.height} onChange={handleChange} />
                <TextField label="Preparation Time (mins)" name="preparationTime" type="number" value={formData.preparationTime} onChange={handleChange} />
                <GenericSelect label="Eggless" name="eggless_id" value={formData.eggless_id?.toString() ?? ""} options={eggless} onChange={(val) => setFormData({ ...formData, eggless_id: val as string })}/>
                <GenericSelect label="SugarFree" name="sugarfree_id" value={formData.sugarfree_id?.toString() ?? ""} options={sugar} onChange={(val) => setFormData({ ...formData, sugarfree_id: val as string })}/>
                <MultiSelectDropdown label="Flavors" options={flavors} selected={selectedFlavor} onChange={(e) => handleMultiSelectChange(e, setSelectedFlavor)}/>
            </Box>
            <DialogActions>
                <Button onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary">{title}</Button>
            </DialogActions>
        </form>
    </CustomModal>
  );
};
