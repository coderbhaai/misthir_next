import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Checkbox, FormControlLabel, FormHelperText, FormLabel, ListItemText } from '@mui/material';
import type {DataProps} from '@amitkk/user/admin/user-address-table';
import MetaInput from '@amitkk/basic/components/static/meta-input';
import StatusSelect from '@amitkk/basic/components/static/status-input';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from '@amitkk/basic/utils/utils';
import { OptionProps } from '@amitkk/basic/types/page';
import GenericSelect from '@amitkk/basic/components/static/generic-select';
import GenericSelectInput from '@amitkk/basic/components/static/GenericSelectInput';
import { useAuth } from 'contexts/AuthContext';
import { useEffect, useState } from 'react';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate }: DataFormProps) {
  const [isLoadingStates, setIsLoadingStates] = React.useState(false);
  const { isLoggedIn, user } = useAuth();
  const initialFormData: DataProps = {
    function : 'create_update_address',
    _id: "",
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    state_id: "",
    country_id: "",
    city_id: "",
    city_new: "",
    address1: "",
    address2: "",
    pin: "",
    landmark: "",
    company: "",
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name ?? '',
        email: user.email ?? '',
        phone: user.phone ?? '',
      }));
    }
  }, [isLoggedIn, user]);
  
  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };
  const [isSameAsPhone, setIsSameAsPhone] = useState(false);
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsSameAsPhone(checked);

    if (checked) {
      setFormData(prev => ({ ...prev, whatsapp: prev.phone }));
    }
  };

  useEffect(() => {
    setIsSameAsPhone(formData.phone === formData.whatsapp && formData.phone !== '');
  }, [formData.phone, formData.whatsapp]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;  
    setFormData((prevData) => ({ ...prevData, [name]: name === "status" ? value === "true" : value }));
  };  

  const [countryOptions, setCountryOptions] = React.useState<OptionProps[]>([]);
  const [stateOptions, setStateOptions] = React.useState<OptionProps[]>([]);
  const [cityOptions, setCityOptions] = React.useState<OptionProps[]>([]);

  const initData = React.useCallback(async () => {
    try {
      setIsLoadingStates(true);
      const res = await apiRequest("get", `address/address?function=get_country_options`);
      const countries = res?.data ?? [];
      setCountryOptions(countries);

      const india = countries.find((c: { _id: string; name: string }) => c.name === 'India');
      if (india) {
        setFormData((prev) => ({ ...prev, country_id: india._id }));
      }
      setIsLoadingStates(false);
    } catch (error) {
      clo(error);
    }
  }, []);

  React.useEffect(() => { initData(); }, [initData]);

  React.useEffect(() => {
    if (formData.country_id) {
      setIsLoadingStates(true);
      const loadStates = async () => {
        const res = await apiRequest("post", `address/address`, {
          function: "get_states_of_country",
          country_id: formData.country_id,
        });
        setStateOptions(res?.data ?? []);
        setIsLoadingStates(false);
      };

      loadStates();
    }
  }, [formData.country_id]);

  React.useEffect(() => {
    if (formData.country_id) {
      setIsLoadingStates(true);
      const loadStates = async () => {
        const res = await apiRequest("post", `address/address`, {
          function: "get_cities_of_state",
          state_id: formData.state_id,
        });
        setCityOptions(res?.data ?? []);
        setIsLoadingStates(false);
      };

      loadStates();
    }
  }, [formData.state_id]);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("get", `address/address?function=get_my_single_address&id=${selectedDataId}`);

          setFormData({
            function: 'create_update_address',
            _id: res?.data?._id || '',
            name: res?.data?.name || '',
            email: res?.data?.email || '',
            phone: res?.data?.phone || '',
            whatsapp: res?.data?.whatsapp || '',
            city_id: res?.data?.city_id?._id || '',
            city_new: '',
            country_id: res?.data?.city_id?.state_id?.country_id || '',
            state_id: res?.data?.city_id?.state_id?._id || '',
            address1: res?.data?.address1 || '',
            address2: res?.data?.address2 || '',
            pin: res?.data?.pin || '',
            landmark: res?.data?.landmark || '',
            company: res?.data?.company || '',
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
    const updatedData: DataProps = {...formData};
    try {
      const res = await apiRequest("post", `address/address`, updatedData);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Address' : 'Update Address';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
          <TextField label='Name' variant='outlined' value={formData.name} name='name' fullWidth onChange={handleChange} required/>
          <TextField label='Email' variant='outlined' value={formData.email} name='email' fullWidth onChange={handleChange}/>
          <TextField label='Phone' variant='outlined' value={formData.phone} name='phone' fullWidth onChange={handleChange} required/>
          <Box display="flex" alignItems="center" gap={2}>
           <FormControl component="fieldset">
            <FormLabel component="legend">Same as Phone</FormLabel>
            <FormControlLabel control={ <Checkbox checked={isSameAsPhone} onChange={handleCheckboxChange} /> } label=""/>
          </FormControl>
            <TextField label='Whatsapp' variant='outlined' value={formData.whatsapp} name='whatsapp' fullWidth onChange={handleChange}/>
          </Box>
          <GenericSelect label="State" name="state_id" value={formData.state_id?.toString() ?? ""} options={stateOptions} onChange={(val) => setFormData({ ...formData, state_id: val as string })}/>
         
         
         <GenericSelectInput
  label="City"
  name="city"
  value={cityOptions.find(opt => opt._id === formData.city_id) || null}
  options={cityOptions}
  onChange={({ id, new: city_new }) => {
    setFormData(prev => ({
      ...prev,
      city_id: id ?? '',
      city_new: city_new ?? '',
    }));
  }}
/>





          <TextField label='Address 1' variant='outlined' value={formData.address1} name='address1' fullWidth onChange={handleChange} required/>


          <TextField label='Address 2' variant='outlined' value={formData.address2} name='address2' fullWidth onChange={handleChange}/>
          <TextField label='PIN' variant='outlined' value={formData.pin} name='pin' fullWidth onChange={handleChange} required/>
          <TextField label='Landmark' variant='outlined' value={formData.landmark} name='landmark' fullWidth onChange={handleChange}/>
          <TextField label='Company' variant='outlined' value={formData.company} name='company' fullWidth onChange={handleChange}/>
          <StatusSelect value={formData.status} onChange={handleChange}/>
          <Button type='submit' variant='contained' color='primary'>{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}
