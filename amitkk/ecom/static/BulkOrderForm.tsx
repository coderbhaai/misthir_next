import React, {useCallback, useEffect, useState } from 'react';
import {TextField, Button, Box, Typography} from '@mui/material';
import { hitToastr, apiRequest, clo, useForm } from '@amitkk/basic/utils/utils';
import { useAuth } from 'contexts/AuthContext';
import { ContactProps } from '@amitkk/basic/types/page';
import router from 'next/router';
import { BulkProps } from '../types/ecom';

type BulkFormProps = {
  handleClose: () => void;
  product_id: string;
  sku_id?: string;
  vendor_id?: string;  
};

type BulkFormData = BulkProps & {
  function: string;
};

export default function BulkOrderForm({ handleClose, product_id, sku_id, vendor_id }: BulkFormProps) {
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
    vendor_id,
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
      const res = await apiRequest("post", `product/product`, formData);

      if( res?.data ){
        handleClose();
        hitToastr('success', res.message);
        // router.push('/thank-you');
      }
      
    } catch (error) { clo( error ); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
        <TextField label='Name' variant='outlined' value={formData.name} name='name' fullWidth onChange={handleChange} required/>
        <TextField label='Email' variant='outlined' value={formData.email} name='email' fullWidth onChange={handleChange} required/>
        <TextField label='Phone' variant='outlined' value={formData.phone} name='phone' fullWidth onChange={handleChange} required/>
        <TextField label='Quantity' variant='outlined' type="number" value={formData.quantity} name='quantity' fullWidth onChange={handleChange} required/>
        <TextField label="Your Message" variant="outlined" value={formData.user_remarks} name="user_remarks" fullWidth onChange={handleChange} multiline rows={2}/>
        <Button type='submit' variant='contained' color='primary'>Connect Now</Button>
      </Box>
    </form>
  );
};
