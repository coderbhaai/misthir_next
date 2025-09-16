import * as React from 'react';
import Box from '@mui/material/Box';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type {DataProps} from '@amitkk/basic/components/review/admin-review-table';
import StatusSelect from '@amitkk/basic/components/static/status-input';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from '@amitkk/basic/utils/utils';
import { FormControl, InputLabel, MenuItem } from '@mui/material';
import StatusDisplay from '../static/status-display-input';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    module: '',
    module_id: '',
    rating: 0,
    review: '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: name === "status" ? value === "true" : value }));
  };

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const data = await apiRequest("get", `/page/get_single_comment?id=${selectedDataId}`);
          setFormData({
            module: data.module || '',
            module_id: data.module_id || '',
            rating: data.rating || '',
            review: data.review || '',
            status: data.status ?? true,
            displayOrder: data.displayOrder || '',
            createdAt: data.createdAt || new Date(),
            updatedAt: new Date(),
            _id: data._id || '',
            selectedDataId: data._id || '',
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
      const res = await apiRequest("post", `/page/create_update_comment`, updatedData);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Comment' : 'Update Comment';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
          <FormControl sx={{width: '100%'}}>
              <InputLabel id="rating-select-label">Rating<span style={{ color: 'red' }}>*</span></InputLabel>
              <Select labelId="rating-select-label" id="rating-select" name="module" value={String(formData.rating)} onChange={handleChange} >
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
                <MenuItem value="4">4</MenuItem>
                <MenuItem value="5">5</MenuItem>
              </Select>
            </FormControl>
          <TextField label='Email' variant='outlined' value={formData.review} name='email' fullWidth onChange={handleChange} required/>
          <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={handleChange} onDisplayOrderChange={handleChange}/>
          <Button type='submit' variant='contained' color='primary'>{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}
