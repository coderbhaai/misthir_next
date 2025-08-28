import * as React from 'react';
import Box from '@mui/material/Box';
import {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type {DataProps} from '@amitkk/agency/admin/admin-video-portfolio-table';
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
    function : 'create_update_video_portfolio',
    name: '',
    url: '',
    status: true,
    displayOrder: 0,
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;  
    setFormData((prevData) => ({ ...prevData, [name]: name === "status" ? value === "true" : value, }));
  };

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("get", `agency/portfolio?function=get_single_video_portfolio&id=${selectedDataId}`);
  
          setFormData({
            function: 'create_update_video_portfolio',
            name: res?.data?.name || "",
            url: res?.data?.url || "",
            status: res?.data?.status ?? true,
            displayOrder: res?.data?.displayOrder,
            _id: res?.data?._id || "",
            selectedDataId: res?.data?._id || "",
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
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
      formDataToSend.append("function", "create_update_video_portfolio");
      formDataToSend.append("name", formData.name);
      formDataToSend.append("url", formData.url);
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("displayOrder", formData.displayOrder?.toString() || "0");

      const res = await apiRequest("post", `agency/portfolio`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Video Portfolio' : 'Update Video Portfolio';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
          <TextField label="Name" variant="outlined" value={formData.name} name="name" fullWidth onChange={handleChange} required/>
          <TextField label="URL" variant="outlined" value={formData.url} name="url" fullWidth onChange={handleChange} required/>
          <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={handleChange} onDisplayOrderChange={handleChange}/>
          <Button type="submit" variant="contained" color="primary">{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}