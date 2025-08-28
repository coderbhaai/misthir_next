import * as React from 'react';
import Box from '@mui/material/Box';
import {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type {DataProps} from './admin-meta-table';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from '@amitkk/basic/utils/utils';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    function : 'create_update_meta',
    title: '',
    description: '',
    url: '',
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
          const data = await apiRequest("get", `basic/meta?function=get_single_meta&id=${selectedDataId}`);

          setFormData({
            function: 'create_update_meta',
            title: data.title || '',
            description: data.description || '',
            url: data.url || '',
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
    const updatedData: DataProps = {...formData, function: 'create_update_meta', updatedAt: new Date(), _id: selectedDataId as string};
    try {
      const res = await apiRequest("post", `basic/meta`, updatedData);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = selectedDataId ? 'Add Meta' : 'Update Meta';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
          <TextField label='URL' variant='outlined' value={formData.url} name='url' fullWidth onChange={handleChange} required/>
          <TextField label='Title' variant='outlined' value={formData.title} name='title' fullWidth onChange={handleChange} required/>
          <TextField label='Description' variant='outlined' value={formData.description} name='description' fullWidth onChange={handleChange} required multiline rows={4} />
          <Button type='submit' variant='contained' color='primary'>{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}
