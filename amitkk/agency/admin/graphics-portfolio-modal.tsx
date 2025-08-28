import * as React from 'react';
import Box from '@mui/material/Box';
import {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type {DataProps} from '@amitkk/agency/admin/admin-graphics-portfolio-table';
import { useState } from 'react';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/utils';
import CkEditor from '@amitkk/basic/components/static/ckeditor-input';
import ImageUpload from '@amitkk/basic/components/static/file-input';
import StatusSelect from '@amitkk/basic/components/static/status-input';
import MediaImage from '@amitkk/basic/components/static/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { MediaProps } from '@amitkk/basic/types/page';
import StatusDisplay from '@amitkk/basic/components/static/status-display-input';
import MetaInput from '@amitkk/basic/components/static/meta-input';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    function : 'create_update_graphics_portfolio',
    heading: '',
    status: true,
    displayOrder: 0,
    content: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    media_id: '',
    _id: '',
    selectedDataId,
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
  
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "status" ? value === "true" : value,
    }));
  };

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("get", `agency/portfolio?function=get_single_graphics_portfolio&id=${selectedDataId}`);
  
          setFormData({
            function: 'create_update_graphics_portfolio',
            heading: res?.data?.heading || "",
            content: res?.data?.content || "",
            status: res?.data?.status ?? true,
            displayOrder: res?.data?.displayOrder,
            media_id: res?.data?.media_id || null,
            _id: res?.data?._id || "",
            selectedDataId: res?.data?._id || "",
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
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

    setContentError(!content ? "Content is required." : null);
    setImageError(!image && !selectedDataId ? "Image is required." : null);

    if (!content.trim() ) { hitToastr("error", "Content is required!"); return; }
    if (!selectedDataId && !image) { hitToastr("error", "Image is required."); return; }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_graphics_portfolio");
      formDataToSend.append("heading", formData.heading);
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("displayOrder", formData.displayOrder?.toString() || "0");
      formDataToSend.append("content", content);
      formDataToSend.append("path", "portfolio");

      const mediaIdToSend = formData.media_id && typeof formData.media_id === "object" && "_id" in formData.media_id 
        ? String((formData.media_id as MediaProps)._id) : typeof formData.media_id === "string" && formData.media_id !== "null" ? formData.media_id : "";
      formDataToSend.append("media_id", mediaIdToSend);

      formDataToSend.append("_id", selectedDataId as string);
      if (image) { formDataToSend.append("image", image); }

      const res = await apiRequest("post", `agency/portfolio`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        setImage(null);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Graphics Portfolio' : 'Update Graphics Portfolio';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
          <TextField label="Heading" variant="outlined" value={formData.heading} name="heading" fullWidth onChange={handleChange} required/>
          <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={handleChange} onDisplayOrderChange={handleChange}/>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MediaImage media={formData.media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
            <ImageUpload name="image" label="Upload Image" required={!selectedDataId} error={imageError} onChange={(name, file) => { setImage(file); }}/>
          </div>
          <CkEditor name="content" value={formData.content} onChange={handleEditorChange} required={!selectedDataId} error={contentError} />
          <Button type="submit" variant="contained" color="primary">{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}