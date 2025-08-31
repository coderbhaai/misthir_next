import * as React from 'react';
import Box from '@mui/material/Box';
import {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type {DataProps} from '@amitkk/product/admin/admin-vendor-table';
import { useState } from 'react';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/utils';
import CkEditor from '@amitkk/basic/components/static/ckeditor-input';
import ImageUpload from '@amitkk/basic/components/static/file-input';
import StatusSelect from '@amitkk/basic/components/static/status-input';
import MediaImage from '@amitkk/basic/components/static/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { MediaProps } from '@amitkk/basic/types/page';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate, roles, permissions }: DataFormProps) {
  const initialFormData: DataProps = {
    function: 'create_update_user',
    _id: '',
    selectedDataId,
    name: '',
    email: '',
    phone: '',
    roles: [],
    permissions: [],
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);  
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };
  
  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchUserData = async () => {
        try {
          const res = await apiRequest("get", `basic/spatie?function=get_single_user&id=${selectedDataId}`);

          const permissionIds = res?.data?.permission_ids;
          setSelectedPermissions(permissionIds);

          const roleIds = res?.data?.role_ids;
          setSelectedRoles(roleIds);

          setFormData({
            function: 'create_update_user',
            _id: res?.data._id || '',
            selectedDataId: res?.data._id || '',
            name: res?.data.name || '',
            email: res?.data.email || '',
            phone: res?.data.phone || '',
            status: res?.data.status || true,
            createdAt: res?.data.createdAt || new Date(),
            updatedAt: new Date(),
          });
        } catch (error) { clo( error ); }
      };
      fetchUserData();
    }
  }, [open, selectedDataId]);

  const handleRoleChange = (event: SelectChangeEvent<typeof selectedRoles>) => {
    const { target: {value} } = event;
    setSelectedRoles(typeof value === 'string' ? value.split(',') : value);
  };

  const handlePermissionChange = (event: SelectChangeEvent<typeof selectedPermissions>) => {
    const { target: {value} } = event;
    setSelectedPermissions(typeof value === 'string' ? value.split(',') : value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedData: DataProps = {...formData, function: 'create_update_user', role_child: JSON.stringify(selectedRoles ?? []), permission_child: JSON.stringify(selectedPermissions ?? []), updatedAt: new Date(), _id: selectedDataId as string};

    try {
      const res = await apiRequest("post", `basic/spatie`, updatedData);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        setSelectedRoles([]);
        setSelectedPermissions([]);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add User' : 'Update User';
  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
          <TextField label='User Name' variant='outlined' value={formData.name} name='name' fullWidth onChange={handleChange} />
          <TextField label='Email' variant='outlined' type='email' value={formData.email} name='email' fullWidth onChange={handleChange} />
          <TextField label='Phone' variant='outlined' type='tel' value={formData.phone} name='phone' fullWidth onChange={handleChange} required />
          <FormControl sx={{width: '100%'}}>
            <InputLabel id='role-select-label' sx={{background: '#fff'}}>Roles</InputLabel>
            <Select labelId='role-select-label' id='role-select' multiple value={selectedRoles} onChange={handleRoleChange}
              renderValue={selected => (
                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                  {selected?.map(value => {
                    const role = roles.find(r => r._id === value);
                    return <Chip key={value} label={role?.name} />;
                  })}
                </Box>
              )}
            >
              {roles?.map((i, index) => (
                <MenuItem key={index} value={i._id}>
                  <Checkbox checked={selectedRoles.includes(i._id)} />
                  <ListItemText primary={i.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{width: '100%'}}>
            <InputLabel id='permission-select-label' sx={{background: '#fff'}}>Permissions</InputLabel>
            <Select labelId='permission-select-label' id='permission-select' multiple value={selectedPermissions} onChange={handlePermissionChange}
              renderValue={selected => (
                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                  {selected?.map(value => {
                    const permission = permissions.find(r => r._id === value);
                    return <Chip key={value} label={permission?.name} />;
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