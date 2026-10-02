import * as React from 'react';
import type {DataProps} from './admin-tax-table';
import CustomModal from '@amitkk/basic/static/CustomModal';
import StatusDisplay from '@amitkk/components/admin/status-display-input';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/my-utils/admin-utils';
import { TextField } from '@amitkk/components/basic/TextField';
import { Button } from '@amitkk/components/button/button';
import { useFormHandler } from 'hooks/useFormHandler';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    function: 'create_update_tax',
    name: '',
    rate: '',
    status: true,
    displayOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    _id: '',
    selectedDataId,
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `payment/payment?function=get_single_tax&id=${selectedDataId}`);

          setFormData({
            function: 'create_update_tax',
            name: res?.data.name || '',
            rate: res?.data.rate || '',
            status: res?.data.status ?? true,
            displayOrder: res?.data.displayOrder ?? 0,
            createdAt: res?.data.createdAt || new Date(),
            updatedAt: new Date(),
            _id: res?.data._id || '',
            selectedDataId: res?.data._id || '',
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
      formDataToSend.append("function", "create_update_tax");
      formDataToSend.append("name", formData.name);
      formDataToSend.append("rate", formData.rate);
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("displayOrder", String(formData.displayOrder ));
      formDataToSend.append("_id", selectedDataId as string);
      const res = await apiRequest("POST", `payment/payment`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Tax' : 'Update Tax';

  const handleChange = useFormHandler(setFormData);

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label="Name" name="name" value={formData.name} onChange={handleChange} required/>
        <TextField type="number" label="Tax Rate" name="rate" value={formData.rate} onChange={handleChange} required/>
        <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={(value) => setFormData((prev) => ({...prev, status: value}))} onDisplayOrderChange={(value) => setFormData((prev) => ({...prev, displayOrder: value}))}/>
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}
