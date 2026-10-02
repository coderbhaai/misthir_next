import * as React from 'react';
import type {DataProps} from '@amitkk/product/admin/admin-commission-table';
import { useEffect, useState } from 'react';
import CustomModal from '@amitkk/basic/static/CustomModal';
import GenericSelect from '@amitkk/components/admin/generic-select';
import { useFormHandler } from 'hooks/useFormHandler';
import { OptionProps } from '@amitkk/basic/types/generic';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/my-utils/admin-utils';
import { TextField } from '@amitkk/components/basic/TextField';
import { Button } from '@amitkk/components/button/button';
import SingleUserDropdown from '@amitkk/basic/admin/spatie/SingleUserDropdown';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    function : 'create_update_commission',
    productmeta_id: '',
    seller_id: '',
    percentage: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    _id: '',
    selectedDataId,
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  const [productmetaOptions, setProductmetaOptions] = useState<OptionProps[]>([]);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };
  
  const handleChange = useFormHandler(setFormData);

  const initData = React.useCallback(async () => {
    try {
        const res_2 = await apiRequest("GET", `product/basic?function=get_product_meta_by_module&module=Type`);
        setProductmetaOptions(res_2?.data ?? []);
    } catch (error) { clo( error ); }
  }, []);

  useEffect(() => { initData(); }, [initData]);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `product/basic?function=get_single_commission&id=${selectedDataId}`);
  
          setFormData({
            function: 'create_update_commission',
            productmeta_id: res?.data?.productmeta_id?._id || "",
            seller_id: res?.data?.seller_id?._id || "",
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
      if (!formData.seller_id) { hitToastr("error", "Vendor is required."); return; }

      formDataToSend.append("function", "create_update_commission");
      formDataToSend.append("productmeta_id", formData.productmeta_id as string);
      formDataToSend.append("seller_id", formData.seller_id as string);
      formDataToSend.append("percentage", formData.percentage?.toString() || "0");
      formDataToSend.append("_id", selectedDataId as string);

      const res = await apiRequest("POST", `product/basic`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Commission' : 'Update Commission';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
          <GenericSelect label="Type" name="productmeta_id" value={formData.productmeta_id?.toString() ?? ""} options={productmetaOptions} onChange={(val) => setFormData({ ...formData, productmeta_id: val as string })}/>
          <SingleUserDropdown value={formData.seller_id} onChange={(val) => handleChange("seller_id", val)} filters={{ role: ["Seller"] }}/>
          <TextField label="Commission" value={formData.percentage} name="percentage" onChange={handleChange} required/>
          <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}