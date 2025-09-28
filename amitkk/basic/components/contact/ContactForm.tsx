import React, {useCallback, useEffect, useState } from 'react';
import {TextField, Button, Box, Typography} from '@mui/material';
import { hitToastr, apiRequest, clo, useForm } from '@amitkk/basic/utils/utils';
import { useAuth } from 'contexts/AuthContext';
import { ContactProps } from '@amitkk/basic/types/page';
import router from 'next/router';

type ContactFormProps = {
  handleClose: () => void;
};

type ContactFormData = ContactProps & {
  function: string;
};

export default function ContactForm({ handleClose }: ContactFormProps) {
  const { formData, handleChange, setFormData } = useForm<ContactFormData>({
    function: 'create_update_contact',
    name: '',
    email: '',
    phone: '',
    user_remarks: '',
    admin_remarks: '',
    status: "Requested"
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
      const res = await apiRequest("post", `basic/basic`, formData);

      if( res?.data ){
        handleClose();
        hitToastr('success', res.message);
        router.push('/thank-you');
      }
      
    } catch (error) { clo( error ); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
        <TextField label='Name' variant='outlined' value={formData.name} name='name' fullWidth onChange={handleChange} required/>
        <TextField label='Email' variant='outlined' value={formData.email} name='email' fullWidth onChange={handleChange} required/>
        <TextField label='Phone' variant='outlined' value={formData.phone} name='phone' fullWidth onChange={handleChange} required/>
        <TextField label="Your Message" variant="outlined" value={formData.user_remarks} name="user_remarks" fullWidth onChange={handleChange} required multiline rows={2}/>
        <Button type='submit' variant='contained' color='primary'>Connect Now</Button>
      </Box>
    </form>
  );
};
