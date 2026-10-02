import * as React from 'react';
import type {DataProps} from '@amitkk/product/admin/admin-document-table';
import { useState } from 'react';
import ImageUpload from '@amitkk/components/admin/file-input';
import MediaImage from '@amitkk/components/admin/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { useFormHandler } from 'hooks/useFormHandler';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/my-utils/admin-utils';
import { MediaProps } from '@amitkk/basic/types/media';
import OpenSelect from '@amitkk/components/basic/OpenSelect';
import SingleUserDropdown from '@amitkk/basic/admin/spatie/SingleUserDropdown';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    _id: '',
    user_id: '',
    name: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    media_id: '',
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

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
          const res = await apiRequest("GET", `payment/document?function=get_single_document&id=${selectedDataId}`);
  
          setFormData({
            _id: res?.data?._id || "",
            name: res?.data?.name || "",
            user_id: res?.data?.user_id?._id || "",
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
    const updatedData: DataProps = {...formData, updatedAt: new Date(), _id: selectedDataId as string};
    setImageError(!image && !selectedDataId ? "Image is required." : null);
    if (!selectedDataId && !image) { hitToastr("error", "Image is required."); return; }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_document");
      formDataToSend.append("user_id", formData.user_id as string);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("path", "vendor");

      const mediaIdToSend = formData.media_id && typeof formData.media_id === "object" && "_id" in formData.media_id 
        ? String((formData.media_id as MediaProps)._id) : typeof formData.media_id === "string" && formData.media_id !== "null" ? formData.media_id : "";
      formDataToSend.append("media_id", mediaIdToSend);

      formDataToSend.append("_id", selectedDataId as string);
      if (image) { formDataToSend.append("image", image); }

      const res = await apiRequest("POST", `payment/document`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        setImage(null);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Document' : 'Update Document';
  const nameOptions = [ 'Pan Card', 'Aadhar Card', "GST Certificate", "Shop Licennce" ]

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <SingleUserDropdown value={formData.user_id} onChange={(val) => handleChange("user_id", val)}/>
        <OpenSelect name={String(formData.name)} label="Document Name" value={formData.name} onChange={(value) => setFormData((prev) => ({...prev, name: value}))} options={nameOptions.map((mod) => ({ label: mod, value: mod }))}/>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <MediaImage media={formData.media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
          <ImageUpload name="image" label="Upload Image" required={!selectedDataId} error={imageError} onChange={(name, file) => { setImage(file); }}/>
        </div>
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}