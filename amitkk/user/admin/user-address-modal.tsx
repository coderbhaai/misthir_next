import * as React from 'react';
import Box from '@mui/material/Box';
import { Tab, Tabs } from '@mui/material';
import type {DataProps} from '@amitkk/user/admin/user-address-table';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from '@amitkk/basic/utils/utils';
import { useAuth } from 'contexts/AuthContext';
import { useEffect, useState } from 'react';
import SelectAddressTab from './SelectAddressTab';
import AddressForm from './AddressForm';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
  userId: string | undefined;
  open: boolean;
  handleClose: () => void; 
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate, userId }: DataFormProps) { 
  const [isLoadingStates, setIsLoadingStates] = React.useState(false);
  const { isLoggedIn, user } = useAuth();

  const handleCloseModal = () => {
    handleClose();
  };

  const [activeTab, setActiveTab] = useState(0);
  useEffect(() => {
    if (selectedDataId) {
      setActiveTab(2);
    } else {
      setActiveTab(0);
    }
  }, [selectedDataId, open]);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => setActiveTab(newValue);
  const title = selectedDataId ? "Edit Address" : ["Create Address", "Select Address"][activeTab] || "Manage Address";

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          {!selectedDataId && ( <Tab label="Create Address" /> )}
          {!selectedDataId && ( <Tab label="Select Address" /> )}
          {/* <Tab label="Edit Address" disabled={!selectedDataId} /> */}
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <AddressForm selectedAddressId={undefined} userId={userId} onSubmit={onUpdate}/>
      )}
      {activeTab === 1 && (
        <SelectAddressTab onSelect={(addressId: string) => { onUpdate({ _id: addressId } as DataProps); }}/>
      )}

      {activeTab === 2 && selectedDataId && (
        <AddressForm selectedAddressId={selectedDataId} userId={userId} onSubmit={onUpdate}/>
      )}
    </CustomModal>

    // <CustomModal open={open} handleClose={handleCloseModal} title={title}>
    //   <form onSubmit={handleSubmit}>
    //     <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
    //       <TextField label='First Name' variant='outlined' value={formData.first_name} name='first_name' fullWidth onChange={handleChange} required/>
    //       <TextField label='Last Name' variant='outlined' value={formData.last_name} name='last_name' fullWidth onChange={handleChange}/>
    //       <TextField label='Email' variant='outlined' value={formData.email} name='email' fullWidth onChange={handleChange}/>
    //       <TextField label='Phone' variant='outlined' value={formData.phone} name='phone' fullWidth onChange={handleChange} required/>
    //       <Box display="flex" alignItems="center" gap={2}>
    //        <FormControl component="fieldset">
    //         <FormLabel component="legend">Same as Phone</FormLabel>
    //         <FormControlLabel control={ <Checkbox checked={isSameAsPhone} onChange={handleCheckboxChange} /> } label=""/>
    //       </FormControl>
    //         <TextField label='Whatsapp' variant='outlined' value={formData.whatsapp} name='whatsapp' fullWidth onChange={handleChange}/>
    //       </Box>
    //       <GenericSelect label="State" name="state_id" value={formData.state_id?.toString() ?? ""} options={stateOptions} onChange={(val) => setFormData({ ...formData, state_id: val as string })}/>
         
    //      <GenericSelectInput label="City" name="city" value={cityOptions.find(opt => opt._id === formData.city_id) || null} 
    //       options={cityOptions}
    //       onChange={({ id, new: city_new }) => {
    //         setFormData(prev => ({ ...prev, city_id: id ?? '', city_new: city_new ?? '' }));
    //       }}/>

    //       <TextField label='Address 1' variant='outlined' value={formData.address1} name='address1' fullWidth onChange={handleChange} required/>
    //       <TextField label='Address 2' variant='outlined' value={formData.address2} name='address2' fullWidth onChange={handleChange}/>
    //       <TextField label='PIN' variant='outlined' value={formData.pin} name='pin' fullWidth onChange={handleChange} required/>
    //       <TextField label='Landmark' variant='outlined' value={formData.landmark} name='landmark' fullWidth onChange={handleChange}/>
    //       <TextField label='Company' variant='outlined' value={formData.company} name='company' fullWidth onChange={handleChange}/>
    //       <StatusSelect value={formData.status} onChange={handleChange}/>
    //       <Button type='submit' variant='contained' color='primary'>{title}</Button>
    //     </Box>
    //   </form>
    // </CustomModal>
  );
}
