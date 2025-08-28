import * as React from 'react';
import Box from '@mui/material/Box';
import {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type {DataProps} from '@amitkk/basic/components/comment/admin-comment-table';
import StatusSelect from '@amitkk/basic/components/static/status-input';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from '@amitkk/basic/utils/utils';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    module: '',
    module_id: '',
    name: '',
    email: '',
    content: '',
    status: true,
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
  
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "status" ? value === "true" : value,
    }));
  };

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const data = await apiRequest("get", `/page/get_single_comment?id=${selectedDataId}`);
          setFormData({
            module: data.module || '',
            module_id: data.module_id || '',
            name: data.name || '',
            email: data.email || '',
            content: data.content || '',
            status: data.status ?? true,
            createdAt: data.createdAt || new Date(),
            updatedAt: new Date(),
            _id: data._id || '',
            selectedDataId: data._id || '',
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
      const res = await apiRequest("post", `/page/create_update_comment`, updatedData);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Comment' : 'Update Comment';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
          <TextField label='Name' variant='outlined' value={formData.name} name='name' fullWidth onChange={handleChange} required/>
          <TextField label='Email' variant='outlined' value={formData.email} name='email' fullWidth onChange={handleChange} required/>
          <StatusSelect value={formData.status} onChange={handleChange}/>
          <TextField label='Comment' variant='outlined' value={formData.content} multiline rows={4} name='content' fullWidth onChange={handleChange} required sx={{ marginBottom: 2}}/>
          <Button type='submit' variant='contained' color='primary'>{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}
