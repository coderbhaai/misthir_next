import * as React from 'react';
import Box from '@mui/material/Box';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type {DataProps} from './admin-setting-table';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/utils';
import StatusSelect from '@amitkk/basic/components/static/status-input';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { FormControl, InputLabel, MenuItem } from '@mui/material';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
};

const module_options = [
  'Mode',
  'Site',
  'Test Site',
  'Payment Gateway',
  'Shipping',
  'Order Replacement Days',
  'Free Shipping Above',
  'Allow Cod'
];

const moduleValueOptions: Record<string, (string[] | Record<string, string>)> = {
  Mode: ['Dev', 'Prod'],
  'Payment Gateway': ['PhonePe', 'Razorpay'],
  'Allow Cod': { 1: 'Yes', 0: 'No' },
  Shipping: ['Ship Rocket'],
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    function: 'create_update_setting',
    module: '',
    module_value: '',
    status: true,
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
          const res = await apiRequest("get", `basic/basic?function=get_single_setting&id=${selectedDataId}`);

          setFormData({
            function: 'create_update_setting',
            module: res?.data.module || '',
            module_value: res?.data.module_value || '',
            status: res?.data.status ?? true,
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
      formDataToSend.append("function", "create_update_setting");
      formDataToSend.append("module", formData.module);
      formDataToSend.append("module_value", formData.module_value);
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("_id", selectedDataId as string);
      const res = await apiRequest("post", `basic/basic`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Setting' : 'Update Setting';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const target = e.target as HTMLInputElement & { name: string; value: string }; // type assertion
    const { name, value } = target;
    setFormData((prevData) => ({ ...prevData, [name]: name === 'status' ? value === 'true' : value }));
  };

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
          <FormControl sx={{width: '100%'}}>
            <InputLabel id="setting-select-label">Module <span style={{ color: 'red' }}>*</span></InputLabel>
            <Select labelId="setting-select-label" id="setting-select" label="module" name="module" value={formData.module} onChange={handleChange} required>
              {module_options?.map((i: any) => ( <MenuItem value={i}>{i}</MenuItem> ))}
            </Select>
          </FormControl>
          
          {formData.module && (
            <>
              {['Site', 'Test Site', 'Order Replacement Days', 'Free Shipping Above'].includes(formData.module) && (
                <TextField label="Setting Value" variant="outlined" name="module_value" value={formData.module_value} onChange={handleChange} fullWidth required/>
              )}
              
              {['Mode', 'Payment Gateway', 'Shipping'].includes(formData.module) && (
                <FormControl sx={{ width: '100%' }}>
                  <InputLabel id="value-select-label">Value *</InputLabel>
                  <Select labelId="value-select-label" id="value-select" label="Value" name="module_value" value={formData.module_value} onChange={handleChange} required>
                    <MenuItem value="">Select Value</MenuItem>
                    {Array.isArray(moduleValueOptions[formData.module]) &&
                      (moduleValueOptions[formData.module] as string[]).map((v) => ( <MenuItem key={v} value={v}>{v}</MenuItem> ))}
                  </Select>
                </FormControl>
              )}
              
              {formData.module === 'Allow Cod' && (
                <FormControl sx={{ width: '100%' }}>
                  <InputLabel id="value-select-label">Value *</InputLabel>
                  <Select labelId="value-select-label" id="value-select" label="Value" name="module_value" value={formData.module_value} onChange={handleChange} required>
                    <MenuItem value="">Select Value</MenuItem>
                    <MenuItem value="1">Yes</MenuItem>
                    <MenuItem value="0">No</MenuItem>
                  </Select>
                </FormControl>
              )}
            </>
          )}

          <StatusSelect value={formData.status} onChange={handleChange}/>
          <Button type='submit' variant='contained' color='primary'>{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}
