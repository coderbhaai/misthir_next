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
import { useState } from 'react';
import { MediaHubProps, MediaProps } from '@amitkk/basic/types/page';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    function: '',
    module: '',
    module_id: '',
    user_id: '',
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
  const [mediaHub, setMediaHub] = useState<MediaHubProps[]>([]);
  
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
          const res = await apiRequest("get", `basic/review?function=get_single_review&id=${selectedDataId}`);

          setFormData({
            function: "update_review",
            module: res?.data.module || '',
            module_id: res?.data.module_id || '',
            user_id: res?.data.user_id || '',
            rating: res?.data.rating || '',
            review: res?.data.review || '',
            status: res?.data.status ?? true,
            displayOrder: res?.data.displayOrder || 0,
            createdAt: res?.data.createdAt || new Date(),
            updatedAt: new Date(),
            _id: res?.data._id || '',
            selectedDataId: res?.data._id || '',
          });

          setMediaHub(res?.data?.mediaHub);

        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedData: DataProps = {...formData, updatedAt: new Date(), _id: selectedDataId as string};

    try {
      const res = await apiRequest("post", `basic/review`, updatedData);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        hitToastr('success', res?.message);
        setMediaHub([]);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Review' : 'Update Review';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
          <FormControl sx={{width: '100%'}}>
              <InputLabel id="rating-select-label">Rating<span style={{ color: 'red' }}>*</span></InputLabel>
              <Select labelId="rating-select-label" id="rating-select" name="module" value={formData.rating ? String(formData.rating) : ''} onChange={handleChange} >
                <MenuItem value="">Select rating</MenuItem>
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
                <MenuItem value="4">4</MenuItem>
                <MenuItem value="5">5</MenuItem>
              </Select>
            </FormControl>
          <TextField label='Review' variant='outlined' value={formData.review} name='review' fullWidth onChange={handleChange} required/>
          <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={handleChange} onDisplayOrderChange={handleChange}/>

          <Box sx={{ display: 'flex', flexWrap: "wrap"}}>
            {mediaHub?.map((item, i) => {
              const media = item.media_id as MediaProps;
              return (
                <Box key={item._id.toString()} sx={{ display: 'flex', width: 100, height: 100, border: "1px solid #ccc", borderRadius: 2, m: 1 }}>
                  {"path" in media && (
                    <img
                      src={media.path}
                      alt={media.alt || `image-${i}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>

          <Button type='submit' variant='contained' color='primary'>{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}
