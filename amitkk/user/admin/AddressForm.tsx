import React, { useEffect, useState } from 'react';
import GenericSelect from '@amitkk/components/admin/generic-select';
import GenericSelectInput from '@amitkk/components/admin/GenericSelectInput';
import { OptionProps } from '@amitkk/basic/types/generic';
import { DataProps } from '@amitkk/address/admin/admin-address-table';
import { useFormHandler } from 'hooks/useFormHandler';
import { apiRequest, clo, hitToastr } from '@amitkk/basic/utils/my-utils/admin-utils';
import { TextField } from '@amitkk/components/basic/TextField';
import { Button } from '@amitkk/components/button/button';
import StatusSelect from '@amitkk/components/admin/status-input';
import { Label } from '@amitkk/components/basic/label';
import { Checkbox } from '@amitkk/components/basic/checkbox';

type DataFormProps = {
    selectedAddressId?: string | number | null | object;
    onSubmit: (data: DataProps) => void;
};

export default function AddressForm({ selectedAddressId, onSubmit }: DataFormProps) {
    const initialFormData: DataProps = {
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

    const [formData, setFormData] = useState<DataProps>(initialFormData);

    const [countryOptions, setCountryOptions] = useState<OptionProps[]>([]);
    const [stateOptions, setStateOptions] = useState<OptionProps[]>([]);
    const [cityOptions, setCityOptions] = useState<OptionProps[]>([]);
    const [isSameAsPhone, setIsSameAsPhone] = useState(false);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await apiRequest('GET', 'address/address?function=get_country_options');
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
                    const res = await apiRequest("POST", 'address/address', {
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
                    const res = await apiRequest("POST", 'address/address', {
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

    const handleChange = useFormHandler(setFormData);

    const handleCheckboxChange = (checked: boolean) => {    
        setIsSameAsPhone(checked);
        setFormData(prev => ({ ...prev, whatsapp: checked ? prev.phone : '' }));
    };

    React.useEffect(() => {
        const fetchData = async () => {
            if (!selectedAddressId) { return; }

            try {
                const res = await apiRequest("POST", `address/address`, { function : "get_single_address_id_selected", id: selectedAddressId });

                setFormData({
                    _id: res?.data?._id || '',
                    user_id: res?.data?.user_id?._id || '',
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
    }, [selectedAddressId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const updatedData: DataProps = {...formData};
        try {
            const res = await apiRequest("POST", `address/address`, updatedData);

            if( res?.data ){
                setFormData(initialFormData);
                hitToastr('success', res?.message);
                onSubmit(res?.data?._id );
            }
        } catch (error) { clo( error ); }
    };

    const title = !selectedAddressId ? "Create Address" : "Edit Address";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <TextField label='First Name' value={formData.name} name='name' onChange={handleChange} required/>
            <TextField label='Email' value={formData.email} name='email' onChange={handleChange}/>
            <TextField label='Phone' value={formData.phone} name='phone' onChange={handleChange} required/>
            <div className="flex items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="same-as-phone">Same as Phone</Label>
                    <div className="flex h-10 items-center">
                        <Checkbox id="same-as-phone" checked={isSameAsPhone} onCheckedChange={(checked) => handleCheckboxChange(Boolean(checked))}/>
                    </div>
                </div>
                <TextField label='Whatsapp' value={formData.whatsapp} name='whatsapp' onChange={handleChange}/>
            </div>
            <GenericSelect label="State" name="state_id" value={formData.state_id?.toString() ?? ""} options={stateOptions} onChange={(val) => setFormData({ ...formData, state_id: val as string })}/>
            
            <GenericSelectInput label="City" name="city" value={cityOptions.find(opt => opt._id === formData.city_id) || null} 
            options={cityOptions}
            onChange={({ id, new: city_new }) => {
                setFormData(prev => ({ ...prev, city_id: id ?? '', city_new: city_new ?? '' }));
            }}/>

            <TextField label='Address 1' value={formData.address1} name='address1' onChange={handleChange} required/>
            <TextField label='Address 2' value={formData.address2} name='address2' onChange={handleChange}/>
            <TextField label='PIN' value={formData.pin} name='pin' onChange={handleChange} required/>
            <TextField label='Landmark' value={formData.landmark} name='landmark' onChange={handleChange}/>
            <TextField label='Company' value={formData.company} name='company' onChange={handleChange}/>
            <StatusSelect value={formData.status} onChange={(value) => handleChange("status", value)}/>
            <Button type='submit' color='primary'>{title}</Button>
        </form>
    );
}