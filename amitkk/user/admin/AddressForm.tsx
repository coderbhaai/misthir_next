import React, { useEffect, useState } from 'react';
import { Box, TextField, Button, Checkbox, FormControl, FormControlLabel, FormLabel, SelectChangeEvent } from '@mui/material';
import GenericSelect from '@amitkk/basic/components/static/generic-select';
import GenericSelectInput from '@amitkk/basic/components/static/GenericSelectInput';
import StatusSelect from '@amitkk/basic/components/static/status-input';
import { OptionProps } from '@amitkk/basic/types/page';
import { DataProps } from '@amitkk/address/admin/admin-address-table';
import { apiRequest, clo, hitToastr } from '@amitkk/basic/utils/utils';

type DataFormProps = {
    selectedAddressId?: string | number | null | object;
    userId: string | undefined;
    onSubmit: (data: DataProps) => void;
};

export default function AddressForm({ selectedAddressId, userId, onSubmit }: DataFormProps) {
    const initialFormData: DataProps = {
        function: 'create_update_address',
        _id: "",
        first_name: "",
        last_name: "",
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

    const [formData, setFormData] = useState<DataProps>(initialFormData);

    const [countryOptions, setCountryOptions] = useState<OptionProps[]>([]);
    const [stateOptions, setStateOptions] = useState<OptionProps[]>([]);
    const [cityOptions, setCityOptions] = useState<OptionProps[]>([]);
    const [isSameAsPhone, setIsSameAsPhone] = useState(false);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await apiRequest('get', 'address/address?function=get_country_options');
                const countries = res?.data ?? [];
                setCountryOptions(countries);
                const india = countries.find((c: OptionProps) => c.name === 'India');
                if (india && !formData.country_id) {
                    setFormData(prev => ({ ...prev, country_id: india._id as string }));
                }
            } catch (error) { clo(error); }
        };

        fetchCountries();
    }, []);

    useEffect(() => {
        if (formData.country_id) {
            const fetchStates = async () => {
                try {
                    const res = await apiRequest('post', 'address/address', {
                        function: 'get_states_of_country',
                        country_id: formData.country_id,
                    });
                    setStateOptions(res?.data ?? []);
                } catch (error) { clo(error); }
            };
            fetchStates();
        }
    }, [formData.country_id]);

    useEffect(() => {
        if (formData.state_id) {
            const fetchCities = async () => {
                try {
                    const res = await apiRequest('post', 'address/address', {
                        function: 'get_cities_of_state',
                        state_id: formData.state_id,
                    });
                    setCityOptions(res?.data ?? []);
                } catch (error) { clo(error); }
            };

            fetchCities();
        }
    }, [formData.state_id]);

    useEffect(() => {
        setIsSameAsPhone(formData.phone === formData.whatsapp && formData.phone !== '');
    }, [formData.phone, formData.whatsapp]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
        const { name, value } = e.target;  
        setFormData((prevData) => ({ ...prevData, [name]: name === "status" ? value === "true" : value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setIsSameAsPhone(checked);
        setFormData(prev => ({ ...prev, whatsapp: checked ? prev.phone : '' }));
    };

    React.useEffect(() => {
        const fetchData = async () => {
            if (!selectedAddressId) { return; }

            try {
                const res = await apiRequest("post", `address/address`, { function : "get_single_address_id_selected", id: selectedAddressId });

                setFormData({
                    function: 'create_update_address',
                    _id: res?.data?._id || '',
                    user_id: res?.data?.user_id?._id || '',
                    first_name: res?.data?.first_name || '',
                    last_name: res?.data?.last_name || '',
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
    }, [selectedAddressId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const updatedData: DataProps = {...formData};
        try {
            const res = await apiRequest("post", `address/address`, updatedData);

            if( res?.data ){
                setFormData(initialFormData);
                hitToastr('success', res?.message);
                onSubmit(res?.data?._id );
            }
        } catch (error) { clo( error ); }
    };

    const title = !selectedAddressId ? "Create Address" : "Edit Address";

    // console.log('formData', formData)



    return (
        <form onSubmit={handleSubmit}>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
            <TextField label='First Name' variant='outlined' value={formData.first_name} name='first_name' fullWidth onChange={handleChange} required/>
            <TextField label='Last Name' variant='outlined' value={formData.last_name} name='last_name' fullWidth onChange={handleChange}/>
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
            
            <GenericSelectInput label="City" name="city" value={cityOptions.find(opt => opt._id === formData.city_id) || null} 
            options={cityOptions}
            onChange={({ id, new: city_new }) => {
                setFormData(prev => ({ ...prev, city_id: id ?? '', city_new: city_new ?? '' }));
            }}/>

            <TextField label='Address 1' variant='outlined' value={formData.address1} name='address1' fullWidth onChange={handleChange} required/>
            <TextField label='Address 2' variant='outlined' value={formData.address2} name='address2' fullWidth onChange={handleChange}/>
            <TextField label='PIN' variant='outlined' value={formData.pin} name='pin' fullWidth onChange={handleChange} required/>
            <TextField label='Landmark' variant='outlined' value={formData.landmark} name='landmark' fullWidth onChange={handleChange}/>
            <TextField label='Company' variant='outlined' value={formData.company} name='company' fullWidth onChange={handleChange}/>
            <StatusSelect value={formData.status} onChange={handleChange}/>
            <Button type='submit' variant='contained' color='primary'>{title}</Button>
            </Box>
        </form>
    );
}