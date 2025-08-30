import * as React from 'react';
import Box from '@mui/material/Box';
import {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type {DataProps} from '@amitkk/product/admin/admin-product-brand-table';
import { useState } from 'react';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/utils';
import CkEditor from '@amitkk/basic/components/static/ckeditor-input';
import ImageUpload from '@amitkk/basic/components/static/file-input';
import StatusSelect from '@amitkk/basic/components/static/status-input';
import MediaImage from '@amitkk/basic/components/static/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { MediaProps } from '@amitkk/basic/types/page';
import MetaInput from '@amitkk/basic/components/static/meta-input';
import GenericSelect from '@amitkk/basic/components/static/generic-select';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
  vendorOptions: { _id: string; name: string }[]; 
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate, vendorOptions }: DataFormProps) {
  const initialFormData: DataProps = {
    function : 'create_update_product_brand',
    name: '',
    url: '',
    vendor_id: '',
    status: true,
    content: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    media_id: '',
    _id: '',
    selectedDataId,
    meta_id: '', title: '', description: '',
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };  

  const [media_id, setMedia_id] = useState("");
  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState<string | null>(null);

  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleEditorChange = (name: string, value: string) => {
    setContent(value);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: name === "status" ? value === "true" : value }));
  };

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("get", `product/basic?function=get_single_product_brand&id=${selectedDataId}`);
  
          setFormData({
            function: 'create_update_product_brand',
            name: res?.data?.name || "",
            url: res?.data?.url || "",
            content: res?.data?.content || "",
            status: res?.data?.status ?? true,
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
            media_id: res?.data?.media_id || null,
            _id: res?.data?._id || "",
            selectedDataId: res?.data?._id || "",
            meta_id: res?.data?.meta_id?._id,
            title: res?.data?.meta_id?.title || '',
            description: res?.data?.meta_id?.description || '',
            vendor_id: res?.data?.vendor_id || "",
          });

          setContent(res?.data?.content || ""); 
        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedData: DataProps = {...formData, updatedAt: new Date(), _id: selectedDataId as string};

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_product_brand");
      formDataToSend.append("vendor_id", String(formData.vendor_id));
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
      const res = await apiRequest("post", `product/basic`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        setImage(null);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Brand' : 'Update Brand';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
          <GenericSelect label="Vendor" name="vendor_id" value={formData.vendor_id?.toString() ?? ""} options={vendorOptions} onChange={(val) => setFormData({ ...formData, vendor_id: val as string })}/>
          <TextField label="Brand Name" variant="outlined" value={formData.name} name="name" fullWidth onChange={handleChange} required/>
          <TextField label="URL" variant="outlined" value={formData.url} name="url" fullWidth onChange={handleChange} required/>
          <StatusSelect value={formData.status} onChange={handleChange}/>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MediaImage media={formData.media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
            <ImageUpload name="image" label="Upload Image" required={!selectedDataId} error={imageError} onChange={(name, file) => { setImage(file); }}/>
          </div>
          <MetaInput title={formData.title} description={formData.description} onChange={handleChange}/>
          <CkEditor name="content" value={formData.content} onChange={handleEditorChange} required={!selectedDataId} error={contentError} />
          <Button type="submit" variant="contained" color="primary">{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}