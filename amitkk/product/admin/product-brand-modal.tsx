import * as React from 'react';
import type {DataProps} from '@amitkk/product/admin/admin-product-brand-table';
import { useState } from 'react';
import CkEditor from '@amitkk/components/admin/ckeditor-input';
import ImageUpload from '@amitkk/components/admin/file-input';
import StatusSelect from '@amitkk/components/admin/status-input';
import MediaImage from '@amitkk/components/admin/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import MetaInput from '@amitkk/components/admin/meta-input';
import { useFormHandler } from 'hooks/useFormHandler';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/my-utils/admin-utils';
import { MediaProps } from '@amitkk/basic/types/media';
import { TextField } from '@amitkk/components/basic/TextField';
import SingleUserDropdown from '@amitkk/basic/admin/spatie/SingleUserDropdown';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    _id: '',
    name: '',
    url: '',
    seller_id: '',
    status: true,
    content: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    media_id: '',
    meta_id: '', title: '', description: '',
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };  

  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState<string | null>(null);

  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleEditorChange = (name: string, value: string) => {
    setContent(value);
  };
  
  const handleChange = useFormHandler(setFormData);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `product/basic?function=get_single_product_brand&id=${selectedDataId}`);
  
          setFormData({
            name: res?.data?.name || "",
            url: res?.data?.url || "",
            content: res?.data?.content || "",
            status: res?.data?.status ?? true,
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
            media_id: res?.data?.media_id || null,
            _id: res?.data?._id || "",
            meta_id: res?.data?.meta_id?._id,
            title: res?.data?.meta_id?.title || '',
            description: res?.data?.meta_id?.description || '',
            seller_id: res?.data?.seller_id?._id || "",
          });

          setContent(res?.data?.content || ""); 
        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_product_brand");
      formDataToSend.append("seller_id", String(formData.seller_id));
      formDataToSend.append("name", formData.name);
      formDataToSend.append("url", formData.url);
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("content", content);
      formDataToSend.append("path", "product");

      const mediaIdToSend = formData.media_id && typeof formData.media_id === "object" && "_id" in formData.media_id 
        ? String((formData.media_id as MediaProps)._id) : typeof formData.media_id === "string" && formData.media_id !== "null" ? formData.media_id : "";
      formDataToSend.append("media_id", mediaIdToSend);

      formDataToSend.append("_id", selectedDataId as string);
      if (image) { formDataToSend.append("image", image); }


      formDataToSend.append("title", formData.title?.toString() ?? "");
      formDataToSend.append("description", formData.description?.toString() ?? "");
      formDataToSend.append( "meta_id", typeof formData.meta_id === "string" ? formData.meta_id : formData.meta_id?.meta_id?.toString() ?? "" );
      const res = await apiRequest("POST", `product/basic`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        setImage(null);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Brand' : 'Update Brand';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <SingleUserDropdown value={formData.seller_id} onChange={(val) => handleChange("seller_id", val)} filters={{ role: ["Seller Staff", "Seller"] }}/>
        <TextField label="Brand Name" value={formData.name} name="name" onChange={handleChange} required/>
        <TextField label="URL" value={formData.url} name="url" onChange={handleChange} required/>
        <StatusSelect value={formData.status} onChange={(value) => handleChange("status", value)}/>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <MediaImage media={formData.media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
          <ImageUpload name="image" label="Upload Image" required={!selectedDataId} error={imageError} onChange={(name, file) => { setImage(file); }}/>
        </div>
        <MetaInput title={formData.title} description={formData.description} onChange={handleChange} fullWidth={true}/>
        <CkEditor name="content" value={formData.content} onChange={handleEditorChange} required={!selectedDataId} error={contentError} />
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}