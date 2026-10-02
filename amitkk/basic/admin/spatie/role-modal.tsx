import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import StatusSelect from '@amitkk/components/admin/status-input';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, handleMultiSelectChange, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import type { OptionProps } from '@amitkk/basic/types/generic';
import { useFormHandler, useSetForm } from 'hooks/useFormHandler';
import { Label } from '@amitkk/components/basic/label';
import { Checkbox } from '@amitkk/components/basic/checkbox';
import { SingleRoleProps } from '@amitkk/basic/types/spatie';
import MultiSelectDropdown from '@amitkk/basic/static/multiselect-dropdown';
import { useAuth } from 'contexts/AuthContext';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: SingleRoleProps = {
    _id: "",
    name: "",
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const [formData, setFormData] = React.useState<SingleRoleProps>(initialFormData);
  const handleChange = useFormHandler(setFormData);
  const setValue = useSetForm(setFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
  const [permissions, setPermissions] = React.useState<OptionProps[]>([]);
  const initData = React.useCallback(async () => {
      try {
          const res = await apiRequest("GET", `basic/spatie?function=get_all_permissions`);
          setPermissions(res?.data ?? []);
      } catch (error) { clo( error ); }
  }, []);
  React.useEffect(() => { initData(); }, [initData]);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `basic/spatie?function=get_single_role&id=${selectedDataId}`);

          const permissionIds = res?.data?.permission_ids;
          setSelectedPermissions(permissionIds);
          
          setFormData({
            _id: res?.data._id || '',
            name: res?.data.name || '',
            status: res?.data.status ?? true,
            createdAt: res?.data.createdAt || new Date(),
            updatedAt: new Date(),
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
      formDataToSend.append("function", "create_update_role");
      formDataToSend.append("_id", selectedDataId as string);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("permission_child", JSON.stringify(selectedPermissions ?? []));
      const res = await apiRequest("POST", `basic/spatie`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        setSelectedPermissions([]);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Role' : 'Update Role';

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
        <TextField label='Role Name' value={formData.name} name='name' onChange={handleChange} required/>
        <StatusSelect value={formData.status} onChange={(value) => setValue("status", value)}/>
        <MultiSelectDropdown label="Permissions" options={permissions} selected={selectedPermissions} onChange={(e) => handleMultiSelectChange(e, setSelectedPermissions)}/>
        {isAuthorizedToSelectAll && (
          <button type="button" onClick={handleSelectAllPermissions} className="text-xs text-blue-600 hover:text-blue-800 font-medium underline focus:outline-none block mt-1">Select All Permissions</button>
        )}
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}
