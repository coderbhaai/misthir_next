import * as React from 'react';
import Box from '@mui/material/Box';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from '@amitkk/basic/utils/utils';
import { FormControl, InputLabel, MenuItem } from '@mui/material';
import { useState } from 'react';
import { MediaHubProps, MediaProps, OptionProps } from '@amitkk/basic/types/page';
import { BulkProps } from '../types/ecom';
import GenericSelect from '@amitkk/basic/components/static/generic-select';
import { Types } from 'mongoose';

interface DataProps extends BulkProps{
  function?: string;
  selectedDataId: string | number | object | null;
}

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
  vendor_options: OptionProps[];
  // product_options: OptionProps[];
  // sku_options: OptionProps[];
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate, vendor_options }: DataFormProps) {
  const initialFormData: DataProps = {
    _id: '',
    function: 'update_bulk_order',
    name: '',
    email: '',
    phone: '',
    vendor_id: '',
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

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("post", `product/product`,{ function: "get_single_bulk_order", id: selectedDataId});

          setFormData({
            _id: res?.data?._id || '',
            function: 'update_bulk_order',
            name: res?.data?.name || '',
            email: res?.data?.email || '',
            phone: res?.data?.phone || '',
            vendor_id: res?.data?.vendor_id?._id || '',
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
    if (!formData.vendor_id) { 
      setProductOptions([]);
      setSkuOptions([]);
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await apiRequest("get", `product/product?function=get_sku_options&vendor_id=${formData.vendor_id}`);
        const products = res?.data ?? [];
        setProductOptions( products.map((p: any) => ({ _id: p._id, name: p.name })) );

        const selectedProduct = products.find((p: { _id: string | Types.ObjectId; }) => p._id === formData.product_id);
        if (selectedProduct) {
          setSkuOptions( (selectedProduct.skus || []).map((s: any) => ({ _id: s._id, name: s.name })) );
        } else { setSkuOptions([]); }

      } catch (error) { clo( error ); setProductOptions([]); setSkuOptions([]); }
    };

    fetchProducts();
  }, [formData.vendor_id]);

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
      const res = await apiRequest("post", `product/product`, formData);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Bulk Order' : 'Update Bulk Order';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
          <TextField label='Name' variant='outlined' value={formData.name} name='name' fullWidth onChange={handleChange} required/>
          <TextField label='Email' variant='outlined' value={formData.email} name='email' fullWidth onChange={handleChange} required/>
          <TextField label='Phone' variant='outlined' value={formData.phone} name='phone' fullWidth onChange={handleChange} required/>
          <TextField label='Quantity' variant='outlined' type="number" value={formData.quantity} name='quantity' fullWidth onChange={handleChange} required/>
          <FormControl sx={{ width: "100%" }}>
            <InputLabel id="status-label">Status <span style={{ color: "red" }}>*</span></InputLabel>
            <Select labelId="status-label" id="status" name="status" value={formData.status} onChange={handleChange} required>
              <MenuItem value="Requested">Requested</MenuItem>
              <MenuItem value="Passed to Vendor">Passed to Vendor</MenuItem>
              <MenuItem value="Quoted">Quoted</MenuItem>
              <MenuItem value="Postponed">Postponed</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
            </Select>
          </FormControl>
          <GenericSelect label="Vendor" name="vendor_id" value={formData.vendor_id?.toString() ?? ""} options={vendor_options} onChange={(val) => setFormData({ ...formData, vendor_id: val as string })}/>
          <GenericSelect label="Product" name="product_id" value={formData.product_id?.toString() ?? ""} options={product_options} onChange={(val) => setFormData({ ...formData, product_id: val as string })}/>
          <GenericSelect label="SKU" name="sku_id" value={formData.sku_id?.toString() ?? ""} options={sku_options} onChange={(val) => setFormData({ ...formData, sku_id: val as string })}/>
          <TextField label="User Message" variant="outlined" value={formData.user_remarks} name="user_remarks" fullWidth onChange={handleChange} multiline rows={2}/>
          <TextField label="Vendor Message" variant="outlined" value={formData.vendor_remarks} name="vendor_remarks" fullWidth onChange={handleChange} multiline rows={2}/>
          <TextField label="Admin Message" variant="outlined" value={formData.admin_remarks} name="admin_remarks" fullWidth onChange={handleChange} multiline rows={2}/>
          <Button type='submit' variant='contained' color='primary'>Connect Now</Button>
        </Box>
      </form>
    </CustomModal>
  );
}
