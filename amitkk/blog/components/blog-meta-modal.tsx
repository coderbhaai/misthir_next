import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Checkbox, FormHelperText, ListItemText } from '@mui/material';

import type {DataProps} from './admin-blog-meta-table';
import MetaInput from '@amitkk/basic/components/static/meta-input';
import StatusSelect from '@amitkk/basic/components/static/status-input';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from '@amitkk/basic/utils/utils';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    function : 'create_update_blog_meta',
    type: '',
    name: '',
    url: '',
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _id: '',
    selectedDataId,
    selected_meta_id: '', 
    meta_id: '', title: '', description: '',
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
          const res = await apiRequest("get", `blog/blogmeta?function=get_single_blog_meta&id=${selectedDataId}`);

          setFormData({
            function: 'create_update_blog_meta',
            type: res?.data?.type || '',
            name: res?.data?.name || '',
            url: res?.data?.url || '',
            status: res?.data?.status ?? true,
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
            _id: res?.data?._id || '',
            selectedDataId: res?.data?._id || '',
            selected_meta_id: res?.data?.meta_id?._id || '',
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
    const updatedData: DataProps = {...formData, function: 'create_update_blog_meta', updatedAt: new Date(), _id: selectedDataId as string};
    try {
      const res = await apiRequest("post", `blog/blogmeta`, updatedData);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Blog Meta' : 'Update Blog Meta';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
          <FormControl sx={{width: '100%'}}>
            <InputLabel id="type-simple-select-label">Type <span style={{ color: 'red' }}>*</span></InputLabel>
            <Select labelId="type-simple-select-label" id="type-simple-select" label="Type" name="type" value={formData.type} onChange={handleChange}>
              <MenuItem value="category">Category</MenuItem> 
              <MenuItem value="tag">Tag</MenuItem> 
            </Select>
            {(formData.status === undefined || formData.status === null) && ( <FormHelperText>Status is required</FormHelperText> )}
          </FormControl>
          <TextField label='Name' variant='outlined' value={formData.name} name='name' fullWidth onChange={handleChange} required/>
          <TextField label='URL' variant='outlined' value={formData.url} name='url' fullWidth onChange={handleChange} required/>
          <StatusSelect value={formData.status} onChange={handleChange}/>
          <MetaInput title={formData.title} description={formData.description} onChange={handleChange}/>
          <Button type='submit' variant='contained' color='primary'>{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}
