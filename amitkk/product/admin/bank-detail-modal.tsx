import * as React from 'react';
import Box from '@mui/material/Box';
import {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type {DataProps} from '@amitkk/product/admin/admin-bank-detail-table';
import { useEffect, useState } from 'react';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/utils';
import CkEditor from '@amitkk/basic/components/static/ckeditor-input';
import ImageUpload from '@amitkk/basic/components/static/file-input';
import StatusSelect from '@amitkk/basic/components/static/status-input';
import MediaImage from '@amitkk/basic/components/static/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { MediaProps, OptionProps } from '@amitkk/basic/types/page';
import GenericSelect from '@amitkk/basic/components/static/generic-select';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    function : 'create_update_bank_detail',
    user_id: '',
    account: '',
    ifsc: '',
    bank: '',
    branch: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    _id: '',
    selectedDataId,
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  const [vendorOptions, setVendorOptions] = useState<OptionProps[]>([]);
  const initData = React.useCallback(async () => {
    try {
        const res_1 = await apiRequest("get", `product/basic?function=get_user_by_role&role=Vendor`);
        setVendorOptions(res_1?.data ?? []);
    } catch (error) { clo( error ); }
  }, []);

  useEffect(() => { initData(); }, [initData]);

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
          const res = await apiRequest("get", `product/basic?function=get_single_bank_detail&id=${selectedDataId}`);
  
          setFormData({
            function: 'create_update_bank_detail',
            user_id: res?.data?.user_id?._id || "",
            account: res?.data?.account || "",
            ifsc: res?.data?.ifsc || "",
            bank: res?.data?.bank ?? true,
            branch: res?.data?.branch || null,
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
            _id: res?.data?._id || "",
            selectedDataId: res?.data?._id || "",
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
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_bank_detail");
      formDataToSend.append("account", formData.account);
      formDataToSend.append("ifsc", formData.ifsc);
      formDataToSend.append("bank", formData.bank);
      formDataToSend.append("branch", formData.branch);
      formDataToSend.append("user_id", formData.user_id as string);
      formDataToSend.append("_id", selectedDataId as string);

      const res = await apiRequest("post", `product/basic`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Bank Detail' : 'Update Bank Detail';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
        <GenericSelect label="Vendor" name="user_id" value={formData.user_id?.toString() ?? ""} options={vendorOptions} onChange={(val) => setFormData({ ...formData, user_id: val as string })}/>
          <TextField label="Account" variant="outlined" value={formData.account} name="account" fullWidth onChange={handleChange} required/>
          <TextField label="IFSC" variant="outlined" value={formData.ifsc} name="ifsc" fullWidth onChange={handleChange} required/>
          <TextField label="Bank" variant="outlined" value={formData.bank} name="bank" fullWidth onChange={handleChange} required/>
          <TextField label="Branch" variant="outlined" value={formData.branch} name="branch" fullWidth onChange={handleChange} required/>
          <Button type="submit" variant="contained" color="primary">{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}