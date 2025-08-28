import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Checkbox, ListItemText } from '@mui/material';
import type {DataProps} from './admin-role-table';
import StatusSelect from '@amitkk/basic/components/static/status-input';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from '@amitkk/basic/utils/utils';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
  permissions: { _id: string; name: string }[]; 
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate, permissions }: DataFormProps) {
  const initialFormData: DataProps = {
    function: "create_update_role",
    name: "",
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _id: "",
    selectedDataId: "",
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
  const handlePermissionChange = (event: SelectChangeEvent<typeof selectedPermissions>) => {
    const {
      target: {value}
    } = event;
    setSelectedPermissions(typeof value === 'string' ? value.split(',') : value);
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
          const res = await apiRequest("get", `basic/spatie?function=get_single_role&id=${selectedDataId}`);

          const permissionIds = res?.data?.permission_ids;
          setSelectedPermissions(permissionIds);
          
          setFormData({
            function: 'create_update_role',
            name: res?.data.name || '',
            status: res?.data.status ?? true,
            createdAt: res?.data.createdAt || new Date(),
            updatedAt: new Date(),
            _id: res?.data._id || '',
            selectedDataId: res?.data._id || '',
          });
        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [open, selectedDataId]);  

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedData: DataProps = {...formData, permission_child: JSON.stringify(selectedPermissions ?? []), updatedAt: new Date(), _id: selectedDataId as string};

    try {
      const res = await apiRequest("post", `basic/spatie`, updatedData);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        setSelectedPermissions([]);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Role' : 'Update Role';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
          <TextField label='Role Name' variant='outlined' value={formData.name} name='name' fullWidth onChange={handleChange} required/>
          <StatusSelect value={formData.status} onChange={handleChange}/>

          <FormControl sx={{width: '100%'}}>
            <InputLabel id='permission-select-label' sx={{background: '#fff'}}>Permissions</InputLabel>
            <Select labelId='permission-select-label' id='permission-select' multiple value={selectedPermissions} onChange={handlePermissionChange}
              renderValue={selected => (
                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                  {selected?.map((i, index) => {
                    const permission = permissions.find(r => r._id === i);
                    return <Chip key={index} label={permission?.name} />;
                  })}
                </Box>
              )}
            >
              {permissions?.map((i, index) => (
                <MenuItem key={index} value={i._id}>
                  <Checkbox checked={selectedPermissions.includes(i._id)} />
                  <ListItemText primary={i.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button type='submit' variant='contained' color='primary'>{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}
