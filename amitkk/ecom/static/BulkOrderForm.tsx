import React, {useCallback, useEffect } from 'react';
import { apiRequest, clo, hitToastr, useForm } from "@amitkk/basic/utils/my-utils/admin-utils";
import { useAuth } from 'contexts/AuthContext';
import { BulkProps } from '../types';
import { TextField } from '@amitkk/components/basic/TextField';
import { Button } from '@amitkk/components/button/button';
import { Textarea } from '@amitkk/components/basic/textarea';

type BulkFormProps = {
  handleClose: () => void;
  product_id: string;
  sku_id?: string;
  seller_id?: string;  
};

type BulkFormData = BulkProps & {
  function: string;
};

export default function BulkOrderForm({ handleClose, product_id, sku_id, seller_id }: BulkFormProps) {
  const { formData, handleChange, setFormData } = useForm<BulkFormData>({
    function: 'create_bulk_order',
    _id: '',
    name: '',
    email: '',
    phone: '',
    quantity: 20,
    user_remarks: '',
    admin_remarks: '',
    status: "Requested",
    product_id,
    sku_id,
    seller_id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  const { isLoggedIn, user } = useAuth();
  const autoFillForm = useCallback(() => {
    if (isLoggedIn && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        ...(user.phone && { phone: user.phone })
      }));
    }
  }, [isLoggedIn, user, setFormData]);

  useEffect(() => { autoFillForm(); }, [autoFillForm]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const res = await apiRequest("POST", `product/product`, formData);

      if( res?.data ){
        handleClose();
        hitToastr('success', res.message);
        // router.push('/thank-you');
      }
      
    } catch (error) { clo( error ); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label='Name' value={formData.name} name='name' onChange={handleChange} required/>
        <TextField label='Email' value={formData.email} name='email' onChange={handleChange} required/>
        <TextField label='Phone' value={formData.phone} name='phone' onChange={handleChange} required/>
        <TextField label='Quantity' type="number" value={formData.quantity} name='quantity' onChange={handleChange} required/>
        <Textarea label="Your Message" value={formData.user_remarks} name="user_remarks" onChange={handleChange} rows={2}/>
        <Button type='submit' color='primary'>Connect Now</Button>
    </form>
  );
};
