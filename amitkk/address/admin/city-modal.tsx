'use client'

import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest } from "@amitkk/basic/utils/my-utils/admin-utils";
import { CityProps, StateProps } from '@amitkk/address/types';
import { useState } from 'react';
import StateModal from './state-modal';
import CountryStateDropdown from '../static/CountryStateDropdown';
import { hitToastr, clo } from '@amitkk/basic/utils/my-utils/admin-utils';
import { useFormHandler } from 'hooks/useFormHandler';
import OpenSelect from '@amitkk/components/basic/OpenSelect';
import StatusDisplay from '@amitkk/components/admin/status-display-input';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';

type DataFormProps = TableDataFormProps & {
  handleUpdate: (newCity: any) => Promise<void>;
  fullWidth?: boolean;
  countryId?: string | null;
  stateId?: string | null;
};

export interface DataProps extends CityProps {}

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate, countryId = null, stateId = null, fullWidth=false }: DataFormProps) {
  const initialFormData: DataProps = {
    _id: '',
    country_id: '',
    state_id: '',
    name: '',
    status: true,
    displayOrder: null,
    major: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);
  const handleChange = useFormHandler(setFormData);
  
  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  const [openStateModal, setOpenStateModal] = React.useState(false);
  const [stateRefreshKey, setStateRefreshKey] = useState(0);

  React.useEffect(() => {
    if (open && !selectedDataId) {
      setFormData(prev => ({ ...prev, country_id: countryId || '', state_id: stateId || ''}));
    }
  }, [open, selectedDataId, countryId, stateId]);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `address/address?function=get_single_city&id=${selectedDataId}`);

          const countryIdFetched = res?.data?.country_id?._id || "";
          const stateIdFetched = res?.data?.state_id?._id || "";

          setFormData({
            _id: res?.data?._id || '',
            country_id: countryIdFetched,
            state_id: stateIdFetched,
            name: res?.data?.name || '',
            status: res?.data?.status ?? true,
            displayOrder: res?.data?.displayOrder ?? 0,
            major: res?.data?.major ?? false,
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
          });
        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (e: { preventDefault: () => void; stopPropagation: () => void; }) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_city");
      formDataToSend.append("_id", (selectedDataId as string) || "");
      formDataToSend.append("country_id", formData.country_id.toString());
      formDataToSend.append("state_id", formData.state_id.toString());
      formDataToSend.append("name", formData.name);
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("displayOrder", String(formData.displayOrder));
      formDataToSend.append("major", String(formData.major));

      const res = await apiRequest("POST", `address/address`, formDataToSend);

      if (res?.data) {
        setFormData(initialFormData);
        await handleUpdate(res.data);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const handleStateAdded = (newState: StateProps) => {
    setStateRefreshKey((prev) => prev + 1);
    setFormData((prev) => ({ ...prev, state_id: newState._id || "" }));
  };

  const title = !selectedDataId ? 'Add City' : 'Update City';

  return (
    <>
      <CustomModal open={open} handleClose={handleCloseModal} title={title}>
        <div className="space-y-4">
            <CountryStateDropdown 
              country={String(formData.country_id || "")} 
              state={String(formData.state_id || "")} 
              nameCountry="country_id" 
              nameState="state_id" 
              onChange={(name, value) => setFormData((prev) => ({ ...prev, [name]: value }))} 
              countryMultiple={false} 
              stateMultiple={false} 
              stateRefreshKey={stateRefreshKey}
            />
            <TextField label='Name' value={formData.name} name='name' onChange={handleChange} required/>
            <OpenSelect label="Major" name="major" value={formData.major} onChange={(value) => setFormData((prev) => ({...prev, major: value}))} options={[ { label: "Yes", value: true }, { label: "No", value: false } ]}/>
            <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={(value) => setFormData((prev) => ({...prev, status: value}))} onDisplayOrderChange={(value) => setFormData((prev) => ({...prev, displayOrder: value}))}/>
            {/* <StickyFormFooter title={title}/> */}

            <button type="button" onClick={handleSubmit} className="btn">{title}</button>
        </div>
      </CustomModal>

      <StateModal open={openStateModal} handleClose={() => setOpenStateModal(false)} selectedDataId={null} handleUpdate={handleStateAdded}/>
    </>
  );
}