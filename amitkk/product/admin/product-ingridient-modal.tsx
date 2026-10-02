import * as React from 'react';
import { useState } from 'react';
import ImageUpload from '@amitkk/components/admin/file-input';
import MediaImage from '@amitkk/components/admin/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import StatusDisplay from '@amitkk/components/admin/status-display-input';
import { useFormHandler } from 'hooks/useFormHandler';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/my-utils/admin-utils';
import { MediaProps } from '@amitkk/basic/types/media';
import { TextField } from '@amitkk/components/basic/TextField';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { IngridientProps } from "@amitkk/product/types";

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: IngridientProps = {
    _id: '',
    name: '',
    status: true,
    displayOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    media_id: '',
  };
  const [formData, setFormData] = React.useState<IngridientProps>(initialFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };  

  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);  
  const handleChange = useFormHandler(setFormData);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `product/basic?function=get_single_product_ingridient&id=${selectedDataId}`);
  
          setFormData({
            _id: res?.data?._id || "",
            name: res?.data?.name || "",
            status: res?.data?.status ?? true,
            displayOrder: res?.data?.displayOrder ?? 0,
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
            media_id: res?.data?.media_id || null,
          });
        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedData: IngridientProps = {...formData, updatedAt: new Date(), _id: selectedDataId as string};
    setImageError(!image && !selectedDataId ? "Image is required." : null);
    if (!selectedDataId && !image) { hitToastr("error", "Image is required."); return; }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_product_ingridient");
      formDataToSend.append("name", formData.name);
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("displayOrder", formData.displayOrder?.toString() || "0");
      formDataToSend.append("path", "product");

      const mediaIdToSend = formData.media_id && typeof formData.media_id === "object" && "_id" in formData.media_id 
        ? String((formData.media_id as MediaProps)._id) : typeof formData.media_id === "string" && formData.media_id !== "null" ? formData.media_id : "";
      formDataToSend.append("media_id", mediaIdToSend);

      formDataToSend.append("_id", selectedDataId as string);
      if (image) { formDataToSend.append("image", image); }

      const res = await apiRequest("POST", `product/basic`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        setImage(null);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Ingridient' : 'Update Ingridient';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label="Name" value={formData.name} name="name" onChange={handleChange} required/>
        <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={(value) => setFormData((prev) => ({...prev, status: value}))} onDisplayOrderChange={(value) => setFormData((prev) => ({...prev, displayOrder: value}))}/>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <MediaImage media={formData.media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
          <ImageUpload name="image" label="Upload Image" required={!selectedDataId} error={imageError} onChange={(name, file) => { setImage(file); }}/>
        </div>
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}