'use client'

import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest } from "@amitkk/basic/utils/my-utils/admin-utils";
import { CountryProps } from '@amitkk/address/types';
import StatusDisplay from '@amitkk/components/admin/status-display-input';
import { hitToastr, clo } from '@amitkk/basic/utils/my-utils/admin-utils';
import { useFormHandler } from 'hooks/useFormHandler';
import OpenSelect from '@amitkk/components/basic/OpenSelect';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export interface DataProps extends CountryProps {
}

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    _id: '',
    name: '',
    capital: '',
    code: '',
    calling_code: '',
    flag: '',
    status: true,
    site: false,
    displayOrder: 0,
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
          const res = await apiRequest("GET", `address/address?function=get_single_country&id=${selectedDataId}`);

          setFormData({
            _id: res?.data?._id || '',
            name: res?.data?.name || '',
            capital: res?.data?.capital || '',
            code: res?.data?.code || '',
            calling_code: res?.data?.calling_code || '',
            flag: res?.data?.flag || '',
            status: res?.data?.status ?? true,
            displayOrder: res?.data?.displayOrder ?? null,
            site: res?.data?.site ?? false,
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
      formDataToSend.append("function", "create_update_country");
      formDataToSend.append("_id", selectedDataId as string);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("capital", formData.capital ?? "");
      formDataToSend.append("code", formData.code ?? "");
      formDataToSend.append("calling_code", formData.calling_code ?? "");
      formDataToSend.append("flag", formData.flag ?? "");
      formDataToSend.append("site", String(formData.site));
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("displayOrder", String(formData.displayOrder));

      const res = await apiRequest("POST", `address/address`, formDataToSend);
      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Country' : 'Update Country';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label='Name' value={formData.name} name='name' onChange={handleChange} required/>
        <TextField label='Captial' value={formData.capital} name='capital' onChange={handleChange}/>
        <TextField label='Code' value={formData.code} name='code' onChange={handleChange} required/>
        <TextField label='Calling Code' value={formData.calling_code} name='calling_code' onChange={handleChange} required/>
        <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={(value) => setFormData((prev) => ({...prev, status: value}))} onDisplayOrderChange={(value) => setFormData((prev) => ({...prev, displayOrder: value}))}/>
        <OpenSelect label="Site Status" name="site" value={formData.site} onChange={(value) => setFormData((prev) => ({...prev, site: value}))} options={[ { label: "Active", value: true }, { label: "Not Active", value: false } ]}/>
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}
