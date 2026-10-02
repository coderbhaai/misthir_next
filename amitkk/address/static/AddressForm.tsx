'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import StatusSelect from '@amitkk/components/admin/status-input';
import { useAuth } from 'contexts/AuthContext';
import { OptionProps } from '@amitkk/basic/types/generic';
import { TextField } from '@amitkk/components/basic/TextField';
import { apiRequest, clo, hitToastr } from '@amitkk/basic/utils/my-utils/admin-utils';
import { AddressProps } from '../types';
import { Checkbox } from '@amitkk/components/basic/checkbox';
import { Label } from '@amitkk/components/basic/label';
import CountryStateCityDropdown from './CountryStateCityDropdown';
import { useFormHandler } from 'hooks/useFormHandler';

type DataFormProps = {
  selectedAddressId?: string | number | null | object;
  onSubmit: (addressId: string) => void;
  admin?: boolean;
  fullWidth?: boolean;
  vertical?: boolean;
};

interface CountryOptionProps extends OptionProps {
  code?: string;
}

export default function AddressForm({ selectedAddressId, onSubmit, admin = false, vertical = false, fullWidth=false }: DataFormProps) {
  const initialFormData: AddressProps = {
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

  const [formData, setFormData] = useState<AddressProps>(initialFormData);
  const [countryOptions, setCountryOptions] = useState<CountryOptionProps[]>([]);
  const [isSameAsPhone, setIsSameAsPhone] = useState(false);
  const hasDetectedCountry = useRef(false);

  const { isLoggedIn, user } = useAuth();

  // Auto-populate user details from auth context
  const autoFillForm = useCallback(() => {
    if (isLoggedIn && user && !selectedAddressId) { // Only autofill for new records
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [isLoggedIn, user, selectedAddressId]);

  useEffect(() => { 
    autoFillForm(); 
  }, [autoFillForm]);

const handleChange = useFormHandler(setFormData);

useEffect(() => {
  const initializeCountryAndState = async () => {
    try {
      const res = await apiRequest("POST", 'address/address', {
        function: 'get_country_options'
      });

      let countries: CountryOptionProps[] = [];
      if (Array.isArray(res?.data)) {
        countries = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        countries = res.data.data;
      }

      setCountryOptions(countries);
      if (hasDetectedCountry.current || formData.country_id || countries.length === 0) return;
      hasDetectedCountry.current = true;

      let detectedCountryId = "";
      let ipData: any = null;
      const forcedCountry = new URLSearchParams(window.location.search).get("country");
      if (forcedCountry) {
        const found = countries.find(
          (c) => c.name && c.name.toLowerCase().trim() === forcedCountry.toLowerCase().trim()
        );
        if (found) detectedCountryId = found._id;
      }

      if (!detectedCountryId) {
        try {
          const ipRes = await fetch("https://ipapi.co/json/");
          ipData = await ipRes.json();          
          if (ipData?.country_name) {
            const found = countries.find(
              (c) => c.name && c.name.toLowerCase().trim() === ipData.country_name.toLowerCase().trim()
            );
            if (found) {
              detectedCountryId = found._id;
            }
          }
        } catch (e) {
          console.log("IP API lookup failed, falling back to defaults", e);
        }
      }

      // Rule C: Fallback to standard "India" lookups
      if (!detectedCountryId) {
        const defaultIndia = countries.find(
          (c) => c.name && c.name.toLowerCase().trim() === 'india'
        );
        if (defaultIndia) {
          detectedCountryId = defaultIndia._id;
        }
      }

      // Rule D: Emergency Fallback
      if (!detectedCountryId && countries.length > 0) {
        detectedCountryId = countries[0]._id;
        console.warn(`⚠️ "India" not found by string match. Defaulting to first database entry: ${countries[0].name}`);
      }

      if (detectedCountryId) {
        const stateRes = await apiRequest("POST", 'address/address', {
          function: 'get_states_of_country',
          country_id: detectedCountryId,
        });
        
        let states: OptionProps[] = [];
        if (Array.isArray(stateRes?.data)) {
          states = stateRes.data;
        } else if (Array.isArray(stateRes?.data?.data)) {
          states = stateRes.data.data;
        }

        let detectedStateId = "";

        if (ipData?.region) {
          const foundState = states.find(
            (s) => s.name && s.name.toLowerCase().trim() === ipData.region.toLowerCase().trim()
          );
          if (foundState) {
            detectedStateId = foundState._id;
          }
        }

        setFormData(prev => ({ 
          ...prev, 
          country_id: detectedCountryId,
          state_id: detectedStateId 
        }));
      }

    } catch (error) { 
      console.error("Critical error during geographic initial load routing:", error);
    }
  };

  initializeCountryAndState();
}, [formData.country_id]);

  // Handle syncing WhatsApp with Phone fields
  useEffect(() => {
    setIsSameAsPhone(formData.phone === formData.whatsapp && formData.phone !== '');
  }, [formData.phone, formData.whatsapp]);

  const handleCheckboxChange = (checked: boolean) => {
    setIsSameAsPhone(checked);
    setFormData(prev => ({ ...prev, whatsapp: checked ? prev.phone : '' }));
  };

  // Hydrate form in edit mode with robust error tracing loops
  useEffect(() => {
    const fetchExistingAddress = async () => {
      // 🛠️ FIX 1: Safely extract ID even if an object structure gets passed
      let targetId: string | undefined;
      
      if (selectedAddressId && typeof selectedAddressId === 'object') {
        targetId = (selectedAddressId as any)._id;
      } else if (selectedAddressId) {
        targetId = String(selectedAddressId);
      }

      if (!targetId || targetId === "null" || targetId === "undefined") {
        return;
      }

      try {
        const res = await apiRequest("POST", `address/address`, { 
          function: "get_single_address_id_selected", 
          id: targetId 
        });

        if (res?.data) {
          const d = res.data;
          const extractedCountryId = d.country_id?._id || d.country_id || d.city_id?.state_id?.country_id || '';
          const extractedStateId = d.state_id?._id || d.state_id || d.city_id?.state_id?._id || '';
          const extractedCityId = d.city_id?._id || d.city_id || '';

          setFormData({
            _id: d._id || '',
            user_id: d.user_id?._id || d.user_id || '',
            name: d.name || '',
            email: d.email || '',
            phone: d.phone || '',
            whatsapp: d.whatsapp || '',
            country_id: extractedCountryId,
            state_id: extractedStateId,
            city_id: extractedCityId,
            city_new: d.city_new || '',
            address1: d.address1 || '',
            address2: d.address2 || '',
            pin: d.pin || '',
            landmark: d.landmark || '',
            company: d.company || '',
            status: d.status ?? true,
            createdAt: d.createdAt || new Date(),
            updatedAt: new Date(),
          });
        } else {
          console.warn("⚠️ API structure completed successfully but returned an empty data container object.");
        }
      } catch (error) { 
        console.error("❌ Critical breakdown during address hydration process:");
        clo(error); 
      }
    };

    fetchExistingAddress();
  }, [selectedAddressId]);

  const handleSubmit = async (e: { preventDefault: () => void; stopPropagation: () => void; }) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_address");
      if (formData.user_id) formDataToSend.append("user_id", String(formData.user_id));
      formDataToSend.append("country_id", String(formData.country_id));
      formDataToSend.append("state_id", String(formData.state_id));
      formDataToSend.append("city_id", String(formData.city_id));
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email ?? "");
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("whatsapp", formData.whatsapp ?? "");
      formDataToSend.append("city_new", formData.city_new ?? "");
      formDataToSend.append("address1", formData.address1);
      formDataToSend.append("address2", formData.address2 ?? "");
      formDataToSend.append("pin", formData.pin);
      formDataToSend.append("landmark", formData.landmark ?? "");
      formDataToSend.append("company", formData.company ?? "");
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("admin", String(admin));

      const res = await apiRequest("POST", `address/address`, formDataToSend);

      if (res?.data) {
        setFormData(initialFormData);
        hitToastr('success', res?.message || "Address saved successfully");
        onSubmit(String(res.data._id));
      }
    } catch (error) { 
      clo(error); 
    }
  };

  const title = !selectedAddressId ? "Create Address" : "Edit Address";

  return (
    <div className="space-y-4 text-left">
      <TextField label='First Name' value={formData.name} name='name' onChange={handleChange} required />
      <TextField label='Email' value={formData.email} name='email' onChange={handleChange} type="email" />
      <TextField label='Phone' value={formData.phone} name='phone' onChange={handleChange} required />
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2 select-none">
          <Checkbox id="same-as-phone" checked={isSameAsPhone} onCheckedChange={(checked) => handleCheckboxChange(!!checked)}/>
          <Label htmlFor="same-as-phone" className="text-sm font-medium cursor-pointer">Same as Phone</Label>
        </div>
        <TextField label='WhatsApp' value={formData.whatsapp} name='whatsapp' onChange={handleChange} required />
      </div>

      <CountryStateCityDropdown 
        country={formData.country_id} 
        nameCountry="country_id" 
        state={formData.state_id} 
        nameState="state_id" 
        city={formData.city_id} 
        nameCity="city_id" 
        onChange={(name, value) => { setFormData((prev) => ({ ...prev, [name]: value })); }} 
        vertical={vertical}
        fullWidth={fullWidth}
      />

      <TextField label='Address 1' value={formData.address1} name='address1' onChange={handleChange} required />
      <TextField label='Address 2' value={formData.address2} name='address2' onChange={handleChange} />
      <TextField label='PIN' value={formData.pin} name='pin' onChange={handleChange} required />
      <TextField label='Landmark' value={formData.landmark} name='landmark' onChange={handleChange} />
      <TextField label='Company' value={formData.company} name='company' onChange={handleChange} />
      
      <StatusSelect value={formData.status} onChange={(value) => handleChange("status", value)}/>
      <button type="button" onClick={handleSubmit} className="btn">{title}</button>
    </div>
  );
}