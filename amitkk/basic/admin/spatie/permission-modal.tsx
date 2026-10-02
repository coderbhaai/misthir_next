import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import StatusSelect from '@amitkk/components/admin/status-input';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, handleMultiSelectChange, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import type { OptionProps } from '@amitkk/basic/types/generic';
import { useCallback, useEffect, useState } from 'react';
import { useFormHandler, useSetForm } from 'hooks/useFormHandler';
import { SinglePermissionProps } from '@amitkk/basic/types/spatie';
import MultiSelectDropdown from '@amitkk/components/admin/multiselect-dropdown';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: SinglePermissionProps = {
    _id: '',
    name: '',
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const [formData, setFormData] = React.useState<SinglePermissionProps>(initialFormData);
  const handleChange = useFormHandler(setFormData);
  const setValue = useSetForm(setFormData);
  
  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  const [selectedRoles, setSelectedRoles] = React.useState<string[]>([]);

  const [roles, setRoles] = useState<OptionProps[]>([]);    
  const initData = useCallback(async () => {
      try {
          const res = await apiRequest("GET", `basic/spatie?function=get_all_roles`);
          setRoles(res?.data ?? []);
      } catch (error) { clo( error ); }
  }, []);
  useEffect(() => { initData(); }, [initData]);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `basic/spatie?function=get_single_permission&id=${selectedDataId}`);

          const roleIds = res?.data?.role_ids;
          setSelectedRoles(roleIds);

          setFormData({
            name: res?.data?.name || '',
            status: res?.data?.status ?? true,
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
            _id: res?.data?._id || '',
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
      formDataToSend.append("function", "create_update_permission");
      formDataToSend.append("_id", selectedDataId as string);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("role_child", JSON.stringify(selectedRoles ?? []));

      const res = await apiRequest("POST", `basic/spatie`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        setSelectedRoles([]);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Permission' : 'Update Permission';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label='Permission Name' value={formData.name} name='name' onChange={handleChange} required/>
        <StatusSelect value={formData.status} onChange={(value) => setValue("status", value)}/>
        <MultiSelectDropdown label="Roles" options={roles} selected={selectedRoles} onChange={(e) => handleMultiSelectChange(e, setSelectedRoles)}/>
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}