import * as React from 'react';
import { useState } from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, handleMultiSelectChange, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import MultiSelectDropdown from '@amitkk/basic/static/multiselect-dropdown';
import type { OptionProps } from '@amitkk/basic/types/generic';
import type { UserProps } from '@amitkk/basic/types/user';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { useAuth } from 'contexts/AuthContext';
import PasswordField from '../auth/Email/PasswordField';
import { useFormHandler } from 'hooks/useFormHandler';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
  fixedRole?: boolean;
  role_selected?: string;
};

export default function UserModal({ open, handleClose, selectedDataId, handleUpdate, fixedRole = true, role_selected }: DataFormProps) {
  const initialFormData: UserProps = {
    _id: '',
    name: '',
    email: '',
    phone: '',
    roles: [],
    permissions: [],
    status: true,
    password: '',
    confirm_password: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const [formData, setFormData] = React.useState<UserProps>(initialFormData);
  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);  
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
  const handleChange = useFormHandler(setFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  const [roles, setRoles] = useState<OptionProps[]>([]);
  const [permissions, setPermissions] = useState<OptionProps[]>([]);
  const initData = React.useCallback(async () => {
    try {
      const res_1 = await apiRequest("GET", `basic/spatie?function=get_all_roles`);
      setRoles(res_1?.data ?? []);

      const res_2 = await apiRequest("GET", `basic/spatie?function=get_all_permissions`);
      setPermissions(res_2?.data ?? []);
    } catch (error) { clo( error ); }
  }, []);
  React.useEffect(() => { initData(); }, [initData]);

  React.useEffect(() => {
    if (role_selected && roles.length > 0) {
      const matchedRole = roles.find((role) => role.name?.toLowerCase() === role_selected.toLowerCase());

      if (matchedRole) {
        setSelectedRoles([String(matchedRole._id)]);

        const fetchRolePermissions = async () => {
          try {
            const res = await apiRequest("GET", `basic/spatie?function=get_single_role&id=${matchedRole._id}`);
            const permissionIds = res?.data?.permission_ids;
            setSelectedPermissions(permissionIds ?? []);
          } catch (error) { clo(error); }
        };
        fetchRolePermissions();
      }
    }
  }, [role_selected, roles]);
  
  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchUserData = async () => {
        try {
          const res = await apiRequest("GET", `basic/spatie?function=get_single_user&id=${selectedDataId}`);

          const user = res?.data;
          const roleIds = user?.role_ids?? [];
          const permissionIds = user?.permission_ids ?? [];

          setSelectedRoles(roleIds);
          setSelectedPermissions(permissionIds);

          setFormData({
            _id: user?._id || "",
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            status: user?.status ?? true,
            password: "",
            confirm_password: "",
            createdAt: user?.createdAt || new Date(),
            updatedAt: user?.updatedAt || new Date(),
          });
        } catch (error) { clo(error); }
      };

      fetchUserData();
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_user");
      formDataToSend.append("_id", selectedDataId as string);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("password", String(formData.password));
      formDataToSend.append("confirm_password", String(formData.confirm_password));
      formDataToSend.append("role_child", JSON.stringify(selectedRoles ?? []));
      formDataToSend.append("permission_child", JSON.stringify(selectedPermissions ?? []));
      const res = await apiRequest("POST", `basic/spatie`, formDataToSend);
      
      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        setSelectedRoles([]);
        setSelectedPermissions([]);
        hitToastr('success', res?.message);
        handleClose();
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add User' : 'Update User';

  const ALLOWED_EMAILS = ['amit.khare588@gmail.com'];
  const { user } = useAuth();
  const isAuthorizedToSelectAll = !!user?.email && ALLOWED_EMAILS.includes(user.email.toLowerCase());

  const handleSelectAllPermissions = () => {
    const allPermissionIds = permissions.map(perm => String(perm._id));
    setSelectedPermissions(allPermissionIds);
  };
  
  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">  
          <TextField label='User Name' value={formData.name} name='name' onChange={handleChange} />
          <TextField label='Email' type='email' value={formData.email} name='email' onChange={handleChange} />
          <TextField label='Phone' type='tel' value={formData.phone} name='phone' onChange={handleChange} required />
          <MultiSelectDropdown label="Roles" options={roles} selected={selectedRoles} onChange={(e) => handleMultiSelectChange(e, setSelectedRoles)} disabled={fixedRole} disableEdit={fixedRole}/>
          <MultiSelectDropdown label="Permissions" options={permissions} selected={selectedPermissions} onChange={(e) => handleMultiSelectChange(e, setSelectedPermissions)} disabled={fixedRole} disableEdit={false}/>

          {isAuthorizedToSelectAll && (
            <button type="button" onClick={handleSelectAllPermissions} className="text-xs text-blue-600 hover:text-blue-800 font-medium underline focus:outline-none block mt-1">Select All Permissions</button>
          )}
          
          { !selectedDataId && (
            <>
              <PasswordField label="Password" value={formData.password} name="password" onChange={handleChange} required/>
              <PasswordField label="Confirm Password" value={formData.confirm_password} name="confirm_password" onChange={handleChange} required/>
            </>
          )}
          <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}