import * as React from 'react';
import type {DataProps} from '@amitkk/product/admin/admin-product-feature-table';
import { useState } from 'react';
import CkEditor from '@amitkk/components/admin/ckeditor-input';
import ImageUpload from '@amitkk/components/admin/file-input';
import MediaImage from '@amitkk/components/admin/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import MetaInput from '@amitkk/components/admin/meta-input';
import { useFormHandler } from 'hooks/useFormHandler';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/my-utils/admin-utils';
import { MediaProps } from '@amitkk/basic/types/media';
import { TextField } from '@amitkk/components/basic/TextField';
import { Button } from '@amitkk/components/button/button';
import OpenSelect from '@amitkk/components/basic/OpenSelect';
import StatusSelect from '@amitkk/components/admin/status-input';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    _id: '',
    module: '',
    module_value: '',
    name: '',
    url: '',
    content: '',
    status: true,
    displayOrder: 0,
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

  const [image, setImage] = useState<File | null>(null);
  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState<string | null>(null);
  const handleEditorChange = (name: string, value: string) => { setContent(value); };
  
  const handleChange = useFormHandler(setFormData);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `product/basic?function=get_single_product_feature&id=${selectedDataId}`);
  
          setFormData({
            _id: res?.data?._id || "",
            module: res?.data?.module || "",
            module_value: res?.data?.module_value || "",
            name: res?.data?.name || "",
            url: res?.data?.url || "",
            content: res?.data?.content || "",
            status: res?.data?.status ?? true,
            displayOrder: res?.data?.displayOrder ?? 0,
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
            media_id: res?.data?.media_id || null,
            meta_id: res?.data?.meta_id?._id,
            title: res?.data?.meta_id?.title || '',
            description: res?.data?.meta_id?.description || '',
          });
        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_product_feature");
      formDataToSend.append("module", formData.module);
      formDataToSend.append("module_value", formData.module_value);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("url", formData.url);
      formDataToSend.append("content", content);
      formDataToSend.append("status", String(formData.status));
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
        setContent(res?.data?.content || ""); 
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Feature' : 'Update Feature';

  const module_options = ["Flavor", "Color", "Eggless", "Glutten Free", "Sugar Free", "Storage", ]; 
  
  
  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <OpenSelect name={String(formData.module)} label="Module" value={formData.module} onChange={(value) => setFormData((prev) => ({...prev, module: value}))} options={module_options.map((mod) => ({ label: mod, value: mod }))}/>
          <TextField label="Module Value" value={formData.module_value} name="module_value" onChange={handleChange} required/>
          <TextField label="Feature Name" value={formData.name} name="name" onChange={handleChange} required/>
          <TextField label="URL" value={formData.url} name="url" onChange={handleChange} required/>
          <StatusSelect value={formData.status} onChange={(value) => handleChange("status", value)}/>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MediaImage media={formData.media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
            <ImageUpload name="image" label="Upload Image" required={false} onChange={(name, file) => { setImage(file); }}/>
          </div>
          <MetaInput title={formData.title} description={formData.description} onChange={handleChange} fullWidth={true}/>
          <CkEditor name="content" value={formData.content} onChange={handleEditorChange} required={!selectedDataId} error={contentError} />
          <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}