import * as React from 'react';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/my-utils/admin-utils';
// import StickyFormFooter from '@amitkk/basic/static/ui/StickyFormFooter';
import {DataProps} from '@amitkk/wishlist/admin/admin-grievance-table';
// import OpenSelect from '@amitkk/basic/admin/static/OpenSelect';
import { useFormHandler, useSetForm } from 'hooks/useFormHandler';
import { TextField } from '@amitkk/components/basic/TextField';
import { Textarea } from '@amitkk/components/basic/textarea';
import OpenSelect from '@amitkk/components/basic/OpenSelect';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    _id: '',
    module: '',
    module_id: '',
    name: '',
    email: '',
    phone: '',
    status: 'Requested',
    user_remarks: null,
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
          const res = await apiRequest("POST", `ecom/ecom`, {
                        function: "get_single_grievance_by_id",
                        id: selectedDataId
                    });

          setFormData({
            _id: res?.data?._id || '',
            module: res?.data?.module || '',
            module_id: res?.data?.module_id || '',
            name: res?.data?.name || '',
            email: res?.data?.email || '',
            phone: res?.data?.phone || '',
            user_remarks: res?.data?.user_remarks || '',
            admin_remarks: res?.data?.admin_remarks || '',
            status: res?.data?.status || '',
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
      formDataToSend.append("function", "update_grievance");
      formDataToSend.append("_id", String(formData._id));
      formDataToSend.append("admin_remarks", formData.admin_remarks ?? "");
      formDataToSend.append("status", formData.status ?? "");

      const res = await apiRequest("POST", `ecom/ecom`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        handleUpdate()
        hitToastr('success', res?.message);
      }

    } catch (error) { clo( error ); }
  };

  const statusOptions = [ 
    { label: "Requested", value: "Requested" },
    { label: "Cleared", value: "Cleared" },
    { label: "Pending", value: "Pending" },
  ];

  const title = 'Update Grievance';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label='Name' value={formData.name} disabled/>
        <TextField label='Email' value={formData.email} disabled/>
        <TextField label='Phone' value={formData.phone} disabled/>
        <Textarea value={String(formData.user_remarks)} rows={2}/>
        <OpenSelect name="status" label="Status" value={formData.status} options={statusOptions} onChange={(value) => setValue("status", value)} required/>
        <Textarea label="Admin Comments" value={String(formData.admin_remarks)} name="admin_remarks" onChange={handleChange} rows={2}/>
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}
