'use client'

import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest } from "@amitkk/basic/utils/my-utils/admin-utils";
import { StateProps } from '@amitkk/address/types';
import StatusDisplay from '@amitkk/components/admin/status-display-input';
import { hitToastr, clo } from '@amitkk/basic/utils/my-utils/admin-utils';
import { useFormHandler } from 'hooks/useFormHandler';
import OpenSelect from '@amitkk/components/basic/OpenSelect';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import SingleCountryDropdown from '../static/SingleCountryDropdown';

type DataFormProps = TableDataFormProps & {
  handleUpdate: (data?: any) => Promise<void> | void;
};

export interface DataProps extends StateProps {
}

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    _id: '',
    country_id: '',
    name: '',
    status: true,
    displayOrder: 0,
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

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `address/address?function=get_single_state&id=${selectedDataId}`);

          setFormData({
            _id: res?.data?._id || '',
            country_id: res?.data?.country_id?._id || '',
            name: res?.data?.name || '',
            status: res?.data?.status ?? true,
            displayOrder: res?.data?.displayOrder ?? null,
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
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_state");
      formDataToSend.append("_id", selectedDataId as string);
      formDataToSend.append("country_id", formData.country_id.toString());
      formDataToSend.append("name", formData.name);
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("displayOrder", String(formData.displayOrder));
      formDataToSend.append("major", String(formData.major));

      const res = await apiRequest("POST", `address/address`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add State' : 'Update State';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <SingleCountryDropdown value={String(formData.country_id || "")} onChange={(value) => setFormData((prev) => ({ ...prev, country_id: value }))} required/>
        <TextField label='Name' value={formData.name} name='name' onChange={handleChange} required/>
        <OpenSelect label="Major" name="major" value={formData.major} onChange={(value) => setFormData((prev) => ({...prev, major: value}))} options={[ { label: "Yes", value: true }, { label: "No", value: false } ]}/>
        <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={(value) => setFormData((prev) => ({...prev, status: value}))} onDisplayOrderChange={(value) => setFormData((prev) => ({...prev, displayOrder: value}))}/>
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}