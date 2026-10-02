import * as React from 'react';
import { TableDataFormProps, apiRequest,  clo, hitToastr  } from "@amitkk/basic/utils/my-utils/admin-utils";
import { useState } from 'react';
import { BulkProps } from '../types';
import GenericSelect from '@amitkk/components/admin/generic-select';
import { Types } from 'mongoose';
import { OptionProps } from '@amitkk/basic/types/generic';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TextField } from '@amitkk/components/basic/TextField';
import { useFormHandler } from 'hooks/useFormHandler';
import { Textarea } from '@amitkk/components/basic/textarea';
import { Button } from '@amitkk/components/button/button';
import OpenSelect from '@amitkk/components/basic/OpenSelect';

interface DataProps extends BulkProps{
  function?: string;
  selectedDataId: string | number | object | null;
}

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
  vendor_options: OptionProps[];
  // product_options: OptionProps[];
  // sku_options: OptionProps[];
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate, vendor_options }: DataFormProps) {
  const initialFormData: DataProps = {
    _id: '',
    function: 'update_bulk_order',
    name: '',
    email: '',
    phone: '',
    seller_id: '',
    user_id: '',
    status: '',
    product_id: '',
    quantity: 0,
    user_remarks: '',
    admin_remarks: '',
    vendor_remarks: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    selectedDataId,
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  const [product_options, setProductOptions] = useState<OptionProps[]>([]);
  const [sku_options, setSkuOptions] = useState<OptionProps[]>([]);
  const handleChange = useFormHandler(setFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("POST", `product/product`,{ function: "get_single_bulk_order", id: selectedDataId});

          setFormData({
            _id: res?.data?._id || '',
            function: 'update_bulk_order',
            name: res?.data?.name || '',
            email: res?.data?.email || '',
            phone: res?.data?.phone || '',
            seller_id: res?.data?.seller_id?._id || '',
            user_id: res?.data?.user_id || '',
            status: res?.data?.status || '',
            product_id: res?.data?.product_id?._id || '',
            quantity: res?.data?.quantity || 0,
            user_remarks: res?.data?.user_remarks || '',
            admin_remarks: res?.data?.admin_remarks || '',
            vendor_remarks: res?.data?.vendor_remarks || '',
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
            selectedDataId: res?.data?._id || '',
          });          

        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [open, selectedDataId]);

  React.useEffect(() => {
    if (!formData.seller_id) { 
      setProductOptions([]);
      setSkuOptions([]);
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await apiRequest("GET", `product/product?function=get_sku_options&seller_id=${formData.seller_id}`);
        const products = res?.data ?? [];
        setProductOptions( products.map((p: any) => ({ _id: p._id, name: p.name })) );

        const selectedProduct = products.find((p: { _id: string | Types.ObjectId; }) => p._id === formData.product_id);
        if (selectedProduct) {
          setSkuOptions( (selectedProduct.skus || []).map((s: any) => ({ _id: s._id, name: s.name })) );
        } else { setSkuOptions([]); }

      } catch (error) { clo( error ); setProductOptions([]); setSkuOptions([]); }
    };

    fetchProducts();
  }, [formData.seller_id]);

  React.useEffect(() => {
    if (!formData.product_id) { setSkuOptions([]); return; }

    const selectedProduct = product_options.find(p => p._id === formData.product_id);
    if (selectedProduct && (selectedProduct as any).sku) {
      setSkuOptions( ((selectedProduct as any).sku || []).map((s: any) => ({ _id: s._id, name: s.name })) );
    } else { setSkuOptions([]); }
  }, [formData.product_id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const res = await apiRequest("POST", `product/product`, formData);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Bulk Order' : 'Update Bulk Order';

  const STATUS_OPTIONS = [
    { label: "All Status", value: "" },
    { label: "Requested", value: "Requested" },
    { label: "Passed to Vendor", value: "Passed to Vendor" },
    { label: "Quoted", value: "Quoted" },
    { label: "Postponed", value: "Postponed" },
    { label: "Closed", value: "Closed" },
  ];

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
          <TextField label='Name' value={formData.name} name='name' onChange={handleChange} required/>
          <TextField label='Email' value={formData.email} name='email' onChange={handleChange} required/>
          <TextField label='Phone' value={formData.phone} name='phone' onChange={handleChange} required/>
          <TextField label='Quantity' type="number" value={formData.quantity} name='quantity' onChange={handleChange} required/>
          <OpenSelect name={String(formData.status)} label="Status" value={formData.status} onChange={(value) => setFormData((prev) => ({...prev, status: value}))} options={STATUS_OPTIONS}/>
          <GenericSelect label="Vendor" name="seller_id" value={formData.seller_id?.toString() ?? ""} options={vendor_options} onChange={(val) => setFormData({ ...formData, seller_id: val as string })}/>
          <GenericSelect label="Product" name="product_id" value={formData.product_id?.toString() ?? ""} options={product_options} onChange={(val) => setFormData({ ...formData, product_id: val as string })}/>
          <GenericSelect label="SKU" name="sku_id" value={formData.sku_id?.toString() ?? ""} options={sku_options} onChange={(val) => setFormData({ ...formData, sku_id: val as string })}/>
          <Textarea label="User Message" value={formData.user_remarks} name="user_remarks" onChange={handleChange} rows={2}/>
          <Textarea label="Vendor Message" value={formData.vendor_remarks} name="vendor_remarks" onChange={handleChange} rows={2}/>
          <Textarea label="Admin Message" value={formData.admin_remarks} name="admin_remarks" onChange={handleChange} rows={2}/>
          <Button type='submit' color='primary'>Connect Now</Button>
      </form>
    </CustomModal>
  );
}
