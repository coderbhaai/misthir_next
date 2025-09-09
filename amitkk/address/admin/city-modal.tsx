import * as React from 'react';
import Box from '@mui/material/Box';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from '@amitkk/basic/utils/utils';
import { CityProps } from '@amitkk/address/types/address';
import StatusDisplay from '@amitkk/basic/components/static/status-display-input';
import GenericSelect from '@amitkk/basic/components/static/generic-select';
import { OptionProps } from '@amitkk/basic/types/page';
import { FormControl, InputLabel, MenuItem } from '@mui/material';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
};

export interface DataProps extends CityProps {
  function?: string;
  selectedDataId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function DataModal({ open, handleClose, selectedDataId, onUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    function: 'create_update_city',
    _id: '',
    state_id: '',
    name: '',
    status: true,
    displayOrder: 0,
    major: false,
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
    setFormData((prevData) => ({ ...prevData, [name]: name === "status" || name === "major" ? value === "true" : value, }));
  };

  const [stateOptions, setStateOptions] = React.useState<OptionProps[]>([]);
  const initData = React.useCallback(async () => {
    try {
        const res_1 = await apiRequest("get", `address/address?function=get_state_options`);
        setStateOptions(res_1?.data ?? []);
    } catch (error) { clo( error ); }
  }, []);

  React.useEffect(() => { initData(); }, [initData]);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("get", `address/address?function=get_single_city&id=${selectedDataId}`);

          setFormData({
            function: 'create_update_city',
            _id: res?.data?._id || '',
            state_id: res?.data?.state_id?._id || '',
            name: res?.data?.name || '',
            status: res?.data?.status ?? true,
            major: res?.data?.major ?? false,
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
    const updatedData: CityProps = {...formData };
    try {
      const res = await apiRequest("post", `address/address`, updatedData);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add City' : 'Update City';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
          <GenericSelect label="State" name="state_id" value={formData.state_id?.toString() ?? ""} options={stateOptions} onChange={(val) => setFormData({ ...formData, state_id: val as string })}/>
          <TextField label='Name' variant='outlined' value={formData.name} name='name' fullWidth onChange={handleChange} required/>
          <FormControl sx={{ width: "100%" }}>
            <InputLabel id="major-label">Major <span style={{ color: "red" }}>*</span></InputLabel>
            <Select labelId="major-label" id="major" name="major" value={formData.major ? "true" : "false"} onChange={handleChange} required>
              <MenuItem value="true">Yes</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
          <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={handleChange} onDisplayOrderChange={handleChange}/>
          <Button type='submit' variant='contained' color='primary'>{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}