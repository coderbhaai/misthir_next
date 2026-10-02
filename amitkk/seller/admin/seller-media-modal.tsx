import * as React from 'react';
import { useState } from 'react';
import ImageUpload from '@amitkk/components/admin/file-input';
import MediaImage from '@amitkk/components/admin/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest,  clo, hitToastr  } from "@amitkk/basic/utils/my-utils/admin-utils";
import { useVendorId } from 'hooks/useVendorId';
import { useFormHandler } from 'hooks/useFormHandler';
import { MediaProps, SingleMediaProps } from '@amitkk/basic/types/media';
import { TextField } from '@amitkk/components/basic/TextField';
import { Button } from '@amitkk/components/button/button';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const seller_id = useVendorId();
  const initialFormData: SingleMediaProps = {
    _id: '',
    alt: 'Image',
    createdAt: new Date(),
    updatedAt: new Date(),
    user_id: seller_id,
  };
  const [formData, setFormData] = React.useState<SingleMediaProps>(initialFormData);
  
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
          const res = await apiRequest("GET", `basic/media?function=get_single_media&id=${selectedDataId}`);
  
          setFormData({
            alt: res?.data?.alt || "",
            _id: res?.data?._id || "",
            user_id: res?.data?.user_id?._id || "",
            updatedAt: res?.data?.updatedAt || new Date(),
            createdAt: res?.data?.createdAt || new Date(),
          });
        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedData: SingleMediaProps = {...formData, updatedAt: new Date(), _id: selectedDataId as string};

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_media");
      formDataToSend.append("alt", formData.alt);
      formDataToSend.append("path", "uploads");
      formDataToSend.append("user_id", String(formData.user_id));

      const mediaIdToSend = formData.media_id && typeof formData.media_id === "object" && "_id" in formData.media_id 
        ? String((formData.media_id as MediaProps)._id) : typeof formData.media_id === "string" && formData.media_id !== "null" ? formData.media_id : "";
      if(mediaIdToSend){ formDataToSend.append("media_id", mediaIdToSend); }
      if (formData._id){ formDataToSend.append("_id", String(formData._id)); }
      if (image) { formDataToSend.append("image", image); }
  
      const res = await apiRequest("POST", `basic/media`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        setImage(null);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Media' : 'Update Media';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label="Media Alt" value={formData.alt} name="alt" onChange={handleChange} required/>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MediaImage media={formData.media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
            {!selectedDataId &&(
              <ImageUpload name="image" label="Upload Image" required={!selectedDataId} error={imageError} onChange={(name, file) => { setImage(file); }}/>
            )}
          </div>
          <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}