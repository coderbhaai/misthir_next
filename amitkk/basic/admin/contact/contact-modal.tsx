import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import { DataProps } from "@amitkk/basic/admin/contact/admin-contact-table";
import CustomModal from '@amitkk/basic/static/CustomModal';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { hitToastr, clo, apiRequest, TableDataFormProps } from '@amitkk/basic/utils/my-utils/admin-utils';
import OpenSelect from '@amitkk/components/basic/OpenSelect';
import { Textarea } from '@amitkk/components/basic/textarea';
import { useFormHandler } from 'hooks/useFormHandler';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    name: '',
    email: '',
    phone: '',
    country_id: '',
    status: '',
    user_remarks: '',
    admin_remarks: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    _id: '',
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };
  
  const handleChange = useFormHandler(setFormData);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `basic/basic?function=get_single_contact&id=${selectedDataId}`);
  
          setFormData({
            _id: res?.data?._id || "",
            name: res?.data?.name || "",
            email: res?.data?.email || "",
            phone: res?.data?.phone || "",
            country_id: res?.data?.country_id?._id || "",
            user_remarks: res?.data?.user_remarks || "",
            admin_remarks: res?.data?.admin_remarks || "",
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
      formDataToSend.append("function", "create_update_contact");
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email ?? "");
      formDataToSend.append("phone", formData.phone ?? "");
      formDataToSend.append("user_remarks", formData.user_remarks ?? "");
      formDataToSend.append("admin_remarks", formData.admin_remarks ?? "");
      formDataToSend.append("status", formData.status);
      formDataToSend.append("_id", selectedDataId as string);

      const res = await apiRequest("POST", `basic/basic`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Contact' : 'Update Contact';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <TextField label="Name" value={formData.name} name="name" onChange={handleChange} required/>
          <TextField label="Email" value={formData.email} name="email" onChange={handleChange} required/>
          <TextField label="Phone" value={formData.phone} name="phone" onChange={handleChange} required/>
          <OpenSelect name={String(formData.status)} label="Role" value={formData.status} onChange={(value) => setFormData((prev) => ({...prev, status: value}))}
          options={[ 
            { label: "All Status", value: "" },
            { label: "Requested", value: "Requested" },
            { label: "Closed", value: "Closed" },
            { label: "Postponed", value: "Postponed" },
            { label: "Fake", value: "Fake" },
          ]}/>
          <Textarea label="User Remarks" value={formData.user_remarks} name="user_remarks" onChange={handleChange} required rows={2}/>
          <Textarea label="Admin Remarks" value={formData.admin_remarks} name="admin_remarks" onChange={handleChange} rows={2}/>
          <StickyFormFooter title={title}/>
        </div>
      </form>
    </CustomModal>
  );
}