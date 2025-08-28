import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Checkbox, FormHelperText, ListItemText } from '@mui/material';

import type {DataProps} from './admin-menu-table';
import { useState } from 'react';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/utils';
import ImageUpload from '@amitkk/basic/components/static/file-input';
import StatusSelect from '@amitkk/basic/components/static/status-input';
import MediaImage from '@amitkk/basic/components/static/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { MediaProps } from '@amitkk/basic/types/page';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
  submenuOptions: { _id: string; name: string }[]; 
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate, submenuOptions }: DataFormProps) {
  const initialFormData: DataProps = {
    function: 'create_update_menu',
    name: '',
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _id: '',
    selectedDataId,
    media_id: '',
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };
  
  const [image, setImage] = useState<File | null>(null);

  const [selectedSubmenu, setSelectedSubmenu] = React.useState<string[]>([]);
  const handleSubmenuChange = (event: SelectChangeEvent<string[]>) => {
    const { target: { value }, } = event;
    setSelectedSubmenu(typeof value === 'string' ? value.split(',') : value);
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
          const res = await apiRequest("get", `basic/spatie?function=get_single_menu&id=${selectedDataId}`);

          const submenuIds = res?.data?.submenu_ids;
          setSelectedSubmenu(submenuIds);
          
          setFormData({
            function: 'create_update_menu',
            name: res?.data.name || '',
            status: res?.data.status ?? true,
            createdAt: res?.data.createdAt || new Date(),
            updatedAt: new Date(),
            _id: res?.data._id || '',
            selectedDataId: res?.data._id || '',
            media_id: res?.data?.media_id || null,
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
      formDataToSend.append("function", "create_update_menu");
      formDataToSend.append("name", formData.name);
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("path", "spatie");
      formDataToSend.append("submenus", JSON.stringify(selectedSubmenu ?? []));

      const mediaIdToSend = formData.media_id && typeof formData.media_id === "object" && "_id" in formData.media_id 
        ? String((formData.media_id as MediaProps)._id) : typeof formData.media_id === "string" && formData.media_id !== "null" ? formData.media_id : "";
      formDataToSend.append("media_id", mediaIdToSend);

      formDataToSend.append("_id", selectedDataId as string);
      if (image) { formDataToSend.append("image", image); }

      const res = await apiRequest("post", `basic/spatie`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        hitToastr('success', res?.message);
        setSelectedSubmenu([]);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Menu' : 'Update Menu';
  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
          <TextField label='Menu Name' variant='outlined' value={formData.name} name='name' fullWidth onChange={handleChange} required/>
          <StatusSelect value={formData.status} onChange={handleChange}/>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MediaImage media={formData.media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
            <ImageUpload name="image" label="Upload Image" required={!selectedDataId} onChange={(name, file) => { setImage(file); }}/>
          </div>
          <FormControl sx={{width: '100%'}}>
            <InputLabel id='permission-select-label' sx={{background: '#fff'}}>Submenu</InputLabel>
            <Select labelId='permission-select-label' id='permission-select' multiple value={selectedSubmenu || []} onChange={handleSubmenuChange}
              renderValue={selected => (
                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                  {selected?.map((i, index) => {
                    const permission = submenuOptions.find(r => r._id === i);
                    return <Chip key={index} label={permission?.name} />;
                  })}
                </Box>
              )}
            >
              {submenuOptions?.map((i, index) => (
                <MenuItem key={index} value={i._id}><Checkbox checked={selectedSubmenu?.includes(i._id)} /><ListItemText primary={i.name} /></MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button type='submit' variant='contained' color='primary'>{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}
