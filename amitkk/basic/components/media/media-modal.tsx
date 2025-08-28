import * as React from 'react';
import Box from '@mui/material/Box';
import {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type {DataProps} from './admin-media-table';
import { useState } from 'react';
import ImageUpload from '@amitkk/basic/components/static/file-input';
import MediaImage from '@amitkk/basic/components/static/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from '@amitkk/basic/utils/utils';
import { MediaProps } from '@amitkk/basic/types/page';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    function : 'create_update_media',
    alt: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    _id: '',
    selectedDataId,
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);
  
  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  
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
          const res = await apiRequest("get", `basic/media?function=get_single_media&id=${selectedDataId}`);
  
          setFormData({
            function: 'create_update_media',
            alt: res?.data?.alt || "",
            _id: res?.data?._id || "",
            selectedDataId: selectedDataId,
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
    const updatedData: DataProps = {...formData, updatedAt: new Date(), _id: selectedDataId as string};

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_media");
      formDataToSend.append("alt", formData.alt);
      formDataToSend.append("path", "uploads");

      const mediaIdToSend = formData.media_id && typeof formData.media_id === "object" && "_id" in formData.media_id 
        ? String((formData.media_id as MediaProps)._id) : typeof formData.media_id === "string" && formData.media_id !== "null" ? formData.media_id : "";
      if(mediaIdToSend){ formDataToSend.append("media_id", mediaIdToSend); }
      if (formData._id){ formDataToSend.append("_id", String(formData._id)); }
      if (image) { formDataToSend.append("image", image); }
  
      const res = await apiRequest("post", `basic/media`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        setImage(null);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Media' : 'Update Media';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2,  width: "100%" }}>
          <TextField label="Mdia Alt" variant="outlined" value={formData.alt} name="alt" fullWidth onChange={handleChange} required/>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MediaImage media={formData.media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
            {!selectedDataId &&(
              <ImageUpload name="image" label="Upload Image" required={!selectedDataId} error={imageError} onChange={(name, file) => { setImage(file); }}/>
            )
            }
          </div>
          <Button type="submit" variant="contained" color="primary">{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}