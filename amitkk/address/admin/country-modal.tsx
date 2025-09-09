import * as React from 'react';
import Box from '@mui/material/Box';
import {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from '@amitkk/basic/utils/utils';
import { CountryProps } from '@amitkk/address/types/address';
import StatusDisplay from '@amitkk/basic/components/static/status-display-input';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
};

export interface DataProps extends CountryProps {
  function?: string;
  selectedDataId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function DataModal({ open, handleClose, selectedDataId, onUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    function: 'create_update_country',
    _id: '',
    name: '',
    capital: '',
    code: '',
    calling_code: '',
    flag: '',
    status: true,
    displayOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);
  
  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;  
    setFormData((prevData) => ({ ...prevData, [name]: name === "status" ? value === "true" : value }));
  };

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("get", `address/address?function=get_single_country&id=${selectedDataId}`);

          setFormData({
            function: 'create_update_country',
            _id: res?.data?._id || '',
            name: res?.data?.name || '',
            capital: res?.data?.capital || '',
            code: res?.data?.code || '',
            calling_code: res?.data?.calling_code || '',
            flag: res?.data?.flag || '',
            status: res?.data?.status ?? true,
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
    const updatedData: CountryProps = {...formData };
    try {
      const res = await apiRequest("post", `address/address`, updatedData);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Country' : 'Update Country';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
          <TextField label='Name' variant='outlined' value={formData.name} name='name' fullWidth onChange={handleChange} required/>
          <TextField label='Captial' variant='outlined' value={formData.capital} name='capital' fullWidth onChange={handleChange} required/>
          <TextField label='Code' variant='outlined' value={formData.code} name='code' fullWidth onChange={handleChange} required/>
          <TextField label='Calling Code' variant='outlined' value={formData.calling_code} name='calling_code' fullWidth onChange={handleChange} required/>
          <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={handleChange} onDisplayOrderChange={handleChange}/>
          <Button type='submit' variant='contained' color='primary'>{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}
