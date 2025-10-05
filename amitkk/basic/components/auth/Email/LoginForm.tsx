import React, {useEffect, useState } from 'react';
import {TextField, Button, Box, Typography} from '@mui/material';
import { hitToastr, apiRequest, clo, useForm } from '@amitkk/basic/utils/utils';
import { DataProps } from '@amitkk/basic/components/auth/Email/EmailRegisterModal';
import { useAuth } from 'contexts/AuthContext';

type AuthProps = DataProps & {
  handleClose: () => void;
};

type LoginProps = {
  function?: string;
  email: string;
  password?: string;
};

export default function LoginForm({ role="User", handleClose, attachUser= false, saveUser = true, onUpdate }: AuthProps) {
  const { login } = useAuth();
  const { formData, setFormData, handleChange } = useForm<LoginProps>({
    function : 'login_via_email',
    email: '',
    password: ''
  });

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const res = await apiRequest("post", `basic/auth`, formData);

      console.log('res.data', res.data)

      if( res?.data ){
        login(res?.data);
        handleClose();
        hitToastr('success', res.message);
      }
    } catch (error) { clo( error ); }
  };

  return (
    <form onSubmit={submit}>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
        <TextField label='Email' variant='outlined' value={formData.email} name='email' fullWidth onChange={handleChange} required/>
        <TextField type="Password" label='Password' variant='outlined' value={formData.password} name='password' fullWidth onChange={handleChange} required/>
        <Button type='submit' variant='contained' color='primary'>Login</Button>
      </Box>
    </form>
  );
};
