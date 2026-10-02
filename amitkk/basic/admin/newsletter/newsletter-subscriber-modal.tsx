import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import { DataProps } from "@amitkk/basic/admin/newsletter/admin-newsletter-subscriber-table";
import { apiRequest, clo, hitToastr, TableDataFormProps } from "@amitkk/basic/utils/my-utils/admin-utils";
import CustomModal from '@amitkk/basic/static/CustomModal';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { useFormHandler, useSetForm } from 'hooks/useFormHandler';
import StatusSelect from '@amitkk/components/admin/status-input';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    _id: '',
    name: '',
    email: '',
    phone: '',
    page_url: '',
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };
  
  const handleChange = useFormHandler(setFormData);
  const setValue = useSetForm(setFormData);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `basic/basic?function=get_single_newsletter_subscriber&id=${selectedDataId}`);
  
          setFormData({
            _id: res?.data?._id || "",
            name: res?.data?.name || "",
            email: res?.data?.email || "",
            phone: res?.data?.phone || "",
            page_url: res?.data?.page_url || "",
            status: res?.data?.status ?? '',
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
    const updatedData: DataProps = {...formData, updatedAt: new Date(), _id: selectedDataId as string};

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_newsletter_subscriber");
      formDataToSend.append("name", formData.name ?? "");
      formDataToSend.append("email", formData.email ?? "");
      formDataToSend.append("phone", formData.phone ?? "");
      formDataToSend.append("page_url", formData.page_url ?? "");
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("_id", selectedDataId as string);

      const res = await apiRequest("POST", `basic/basic`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add NewsLetter' : 'Update NewsLetter';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <TextField label="Name" value={formData.name} name="name" onChange={handleChange}/>
          <TextField label="Email" value={formData.email} name="email" onChange={handleChange} required/>
          <TextField label="Phone" value={formData.phone} name="phone" onChange={handleChange}/>
          <StatusSelect value={formData.status} onChange={(value) => setValue("status", value)}/>
          <StickyFormFooter title={title}/>
        </div>
      </form>
    </CustomModal>
  );
}