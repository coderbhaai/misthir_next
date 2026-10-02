import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import StatusSelect from '@amitkk/components/admin/status-input';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { useFormHandler, useSetForm } from 'hooks/useFormHandler';
import { useAuth } from 'contexts/AuthContext';
import ModuleSelector from '@amitkk/components/admin/ModuleSelector';
import { UrlRegistryModalProps } from '@amitkk/basic/types';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};


export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: UrlRegistryModalProps = {
    _id: "",
    name: "",
    module: "",
    module_id: "",
    url: "",
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const [formData, setFormData] = React.useState<UrlRegistryModalProps>(initialFormData);
  const handleChange = useFormHandler(setFormData);
  const setValue = useSetForm(setFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("POST", `basic/routing`, {
            function: "get_single_url_registry",
            id: selectedDataId
          });
          
          setFormData({
            _id: res?.data._id || '',
            name: res?.data.name || '',
            url: res?.data.url || '',
            module: res?.data.module || '',
            module_id: res?.data.module_id || '',
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
      formDataToSend.append("function", "update_url_registry");
      formDataToSend.append("_id", selectedDataId as string);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("url", formData.url);
      formDataToSend.append("module", formData.module);
      formDataToSend.append("module_id", formData.module_id);
      formDataToSend.append("status", String(formData.status));
      const res = await apiRequest("POST", `basic/routing`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add URL Registry' : 'Update URL Registry';

  const ALLOWED_EMAILS = ['amit.khare588@gmail.com'];
  const { user } = useAuth();
  const isAuthorizedToSelectAll = !!user?.email && ALLOWED_EMAILS.includes(user.email.toLowerCase());

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ModuleSelector formData={formData} allow_edit={false}/>
        <TextField label='Name' value={formData.name} name='name' onChange={handleChange} required/>
        <TextField label='URL' value={formData.url} name='url' onChange={handleChange} required/>
        <StatusSelect value={formData.status} onChange={(value) => setValue("status", value)}/>
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}
