import React, {useEffect, useState } from 'react';
import {TextField, Button, Box, Typography} from '@mui/material';
import { hitToastr, apiRequest, clo, useForm } from '@amitkk/basic/utils/utils';
import { DataProps } from '@amitkk/basic/components/auth/Email/EmailRegisterModal';
import { useAuth } from 'contexts/AuthContext';

type AuthProps = DataProps & {
  handleClose: () => void;
};

export interface EmailAuthProps {
  function?: string;
  email: string;
  otp?: string;
  password?: string;
  confirm_password?: string;
};

export default function ResetPassword({ role="User", handleClose, attachUser= false, saveUser = true, onUpdate }: AuthProps) {
  const { login } = useAuth();
  const { formData, setFormData, handleChange } = useForm<EmailAuthProps>({
    function : 'reset_password',
    email: '',
    otp: '',
    password: '',
    confirm_password: ''
  });

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if( !formData.email || !formData.otp || !formData.password || !formData.confirm_password ){
      hitToastr('success', "Fields are Missing"); return;
    }

    try {
      const res = await apiRequest("post", `basic/auth`, formData);      
      
      if( res?.data ){
        onUpdate();

        setFormData({
          function: 'reset_password',
          email: '',
          otp: '',
          password: '',
          confirm_password: ''
        });

        hitToastr('success', res.message);
      }

    } catch (error) { clo( error ); }
  };

  return (
      <form onSubmit={submit}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
          <TextField label='Email' variant='outlined' value={formData.email} name='email' fullWidth onChange={handleChange} required/>
          <TextField label="Enter OTP" variant="outlined" value={formData.otp} name='otp' fullWidth onChange={handleChange}  sx={{ mt: 2 }} required/>
          <TextField type="password" label='Password' variant='outlined' value={formData.password} name='password' fullWidth onChange={handleChange} required/>
          <TextField type="password" label='Confirm Password' variant='outlined' value={formData.confirm_password} name='confirm_password' fullWidth onChange={handleChange} required/>
          <Button type='submit' variant='contained' color='primary' disabled={!formData.otp}>Reset Password</Button>
        </Box>
      </form>
  );
};
