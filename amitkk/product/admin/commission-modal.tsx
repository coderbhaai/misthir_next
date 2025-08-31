import * as React from 'react';
import Box from '@mui/material/Box';
import {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type {DataProps} from '@amitkk/product/admin/admin-commission-table';
import { useEffect, useState } from 'react';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/utils';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { OptionProps } from '@amitkk/basic/types/page';
import GenericSelect from '@amitkk/basic/components/static/generic-select';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    function : 'create_update_commission',
    productmeta_id: '',
    vendor_id: '',
    percentage: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    _id: '',
    selectedDataId,
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  const [productmetaOptions, setProductmetaOptions] = useState<OptionProps[]>([]);
  const [vendorOptions, setVendorOptions] = useState<OptionProps[]>([]);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: name === "status" ? value === "true" : value }));
  };

  const initData = React.useCallback(async () => {
    try {
        const res_1 = await apiRequest("get", `product/basic?function=get_user_by_role&role=Vendor`);
        setVendorOptions(res_1?.data ?? []);

        const res_2 = await apiRequest("get", `product/basic?function=get_product_meta_by_module&module=Type`);
        setProductmetaOptions(res_2?.data ?? []);
    } catch (error) { clo( error ); }
  }, []);

  useEffect(() => { initData(); }, [initData]);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("get", `product/basic?function=get_single_commission&id=${selectedDataId}`);
  
          setFormData({
            function: 'create_update_commission',
            productmeta_id: res?.data?.productmeta_id?._id || "",
            vendor_id: res?.data?.vendor_id?._id || "",
            percentage: res?.data?.percentage ?? 0,
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
    try {
      const formDataToSend = new FormData();

      if (!formData.productmeta_id) { hitToastr("error", "Type is required."); return; }
      if (!formData.vendor_id) { hitToastr("error", "Vendor is required."); return; }

      formDataToSend.append("function", "create_update_commission");
      formDataToSend.append("productmeta_id", formData.productmeta_id as string);
      formDataToSend.append("vendor_id", formData.vendor_id as string);
      formDataToSend.append("percentage", formData.percentage?.toString() || "0");
      formDataToSend.append("_id", selectedDataId as string);

      const res = await apiRequest("post", `product/basic`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Commission' : 'Update Commission';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
          <GenericSelect label="Type" name="productmeta_id" value={formData.productmeta_id?.toString() ?? ""} options={productmetaOptions} onChange={(val) => setFormData({ ...formData, productmeta_id: val as string })}/>

          <GenericSelect label="Vendor" name="vendor_id" value={formData.vendor_id?.toString() ?? ""} options={vendorOptions} onChange={(val) => setFormData({ ...formData, vendor_id: val as string })}/>

          <TextField label="Commission" variant="outlined" value={formData.percentage} name="percentage" fullWidth onChange={handleChange} required/>
          <Button type="submit" variant="contained" color="primary">{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}