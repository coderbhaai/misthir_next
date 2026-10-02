import * as React from 'react';
import {DataProps} from '@amitkk/product/admin/admin-seller-table';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/my-utils/admin-utils';
import { Button } from '@amitkk/components/button/button';
import { TextField } from '@amitkk/components/basic/TextField';
import { useFormHandler } from 'hooks/useFormHandler';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate, roles, permissions }: DataFormProps) {
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

  const handleChange = useFormHandler(setFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };
  
  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchUserData = async () => {
        try {
          const res = await apiRequest("GET", `basic/spatie?function=get_single_user&id=${selectedDataId}`);

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
      const res = await apiRequest("POST", `basic/spatie`, updatedData);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        setSelectedRoles([]);
        setSelectedPermissions([]);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add User' : 'Update User';
  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label='User Name' value={formData.name} name='name' onChange={handleChange} />
          <TextField label='Email' type='email' value={formData.email} name='email' onChange={handleChange} />
          <TextField label='Phone' type='tel' value={formData.phone} name='phone' onChange={handleChange} required />

          
          <FormControl sx={{width: '100%'}}>
            <InputLabel id='role-select-label' sx={{background: '#fff'}}>Roles</InputLabel>
            <Select labelId='role-select-label' id='role-select' multiple value={selectedRoles} onChange={handleRoleChange}
              renderValue={selected => (
                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.5}}>
                  {selected?.map(value => {
                    const role = roles.find(r => r._id === value);
                    return <Chip key={value} label={role?.name} />;
                  })}
                </div>
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
                </div>
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
          <Button type='submit' color='primary'>{title}</Button>
      </form>
    </CustomModal>
  );
}