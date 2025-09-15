import * as React from 'react';
import Box from '@mui/material/Box';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type {DataProps} from './admin-tax-table';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/utils';
import StatusSelect from '@amitkk/basic/components/static/status-input';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { FormControl, InputLabel, MenuItem } from '@mui/material';
import StatusDisplay from '@amitkk/basic/components/static/status-display-input';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate }: DataFormProps) {
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
          const res = await apiRequest("get", `payment/payment?function=get_single_tax&id=${selectedDataId}`);

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
      const res = await apiRequest("post", `payment/payment`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Tax' : 'Update Tax';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const target = e.target as HTMLInputElement & { name: string; value: string };
    const { name, value } = target;
    setFormData((prevData) => ({ ...prevData, [name]: name === 'status' ? value === 'true' : value }));
  };

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>          
          <TextField label="Name" variant="outlined" name="name" value={formData.name} onChange={handleChange} fullWidth required/>
          <TextField type="number" label="Tax Rate" variant="outlined" name="rate" value={formData.rate} onChange={handleChange} fullWidth required/>
          <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={handleChange} onDisplayOrderChange={handleChange}/>
          <Button type='submit' variant='contained' color='primary'>{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}
