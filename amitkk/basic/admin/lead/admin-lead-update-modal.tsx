import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest, clo, hitToastr, TableDataFormProps } from "@amitkk/basic/utils/my-utils/admin-utils";
import CustomModal from '@amitkk/basic/static/CustomModal';
import { LeadProps } from '@amitkk/basic/types';
import MultiSelectDropdownModule from '@amitkk/basic/static/MultiSelectDropdownModule';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import OpenSelect from '@amitkk/components/basic/OpenSelect';
import { lead_options } from '@amitkk/basic/utils/my-utils/shared-utils';
import { Textarea } from '@amitkk/components/basic/textarea';
import { useFormHandler } from 'hooks/useFormHandler';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: LeadProps = {
    _id: '',
    name: '',
    email: '',
    phone: '',
    status: '',
    page_url: '',
    user_remarks: '',
    admin_remarks: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const [formData, setFormData] = React.useState<LeadProps>(initialFormData);
  const [selectedModule, setSelectedModule] = useState<any[]>([]);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    setSelectedModule([])
    handleClose();
  };
  
  const handleChange = useFormHandler(setFormData);

  const [moduleOptions, setModuleOptions] = useState<{_id: string; name: string, module: string}[]>([]);
  const initData = useCallback(async () => {
      try {
          const res = await apiRequest("GET", "basic/basic?function=get_all_lead_options");
          setModuleOptions(res?.data ?? []);
      } catch (error) { clo( error ); }
  }, []);

  useEffect(() => { initData(); }, [initData]);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `basic/basic?function=get_single_lead_request&id=${selectedDataId}`);

          const modules = res?.data?.modules?.map((m: any) => ({
            _id: m.module_id?._id || m.module_id,
            name: m.module_id?.name || "Unknown",
            module: m.module,
          })) || [];

          setSelectedModule(modules);
          
          setFormData({
            _id: res?.data?._id || "",
            name: res?.data?.name || "",
            email: res?.data?.email || "",
            phone: res?.data?.phone || "",
            status: res?.data?.status ?? "",
            page_url: res?.data?.page_url ?? "",
            user_remarks: res?.data?.user_remarks || "",
            admin_remarks: res?.data?.admin_remarks || "",
            createdAt: res?.data?.createdAt || new Date(),
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
      formDataToSend.append("function", "create_update_lead_request");
      formDataToSend.append("_id", selectedDataId as string);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("user_remarks", formData.user_remarks ?? "");
      formDataToSend.append("admin_remarks", formData.admin_remarks ?? "");
      formDataToSend.append("selectedModule", JSON.stringify(selectedModule));

      const res = await apiRequest("POST", `basic/basic`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        setSelectedModule([])
        await handleUpdate();
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Lead' : 'Update Lead';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label='Name' value={formData.name} name='name' onChange={handleChange} required/>
        <TextField label='Email' value={formData.email} name='email' onChange={handleChange} required/>
        <TextField label='Phone Number' value={formData.phone} name='phone' onChange={handleChange} required/>
        <MultiSelectDropdownModule label="Service" options={moduleOptions} selected={selectedModule} onChange={setSelectedModule}/>
        <OpenSelect key={`status-select-${formData.status}`} name="status" label="Lead Status" options={lead_options} value={formData.status} onChange={(value) => setFormData((prev) => ({ ...prev, status: String(value) }))} required/>
        <Textarea label="User Remarks" value={formData.user_remarks} name="user_remarks" onChange={handleChange} rows={2}/>
        <Textarea label="Admin Remarks" value={formData.admin_remarks} name="admin_remarks" onChange={handleChange} rows={2}/>
        <StickyFormFooter title="Update Lead"/>
      </form>
    </CustomModal>
  );
}