import React, {useEffect, useState } from 'react';
import {TextField, Button, Box, Typography} from '@mui/material';
import { hitToastr, apiRequest, clo, useForm } from '@amitkk/basic/utils/utils';
import { DataProps } from '@amitkk/basic/components/auth/Email/EmailRegisterModal';
import { useAuth } from 'contexts/AuthContext';

type AuthProps = DataProps & {
  handleClose: () => void;
};

type ForgotPasswordProps = {
  function?: string;
  email: string;
};

export default function ForgotPassword({ handleClose, onUpdate }: AuthProps) {
  const { login } = useAuth();
  const { formData, setFormData, handleChange } = useForm<ForgotPasswordProps>({
    function : 'forgot_password',
    email: '',
  });

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if( !formData.email ){
      hitToastr('success', "Fields are Missing"); return;
    }

    try {
      const res = await apiRequest("post", `basic/auth`, formData);      
      
      if( res?.data ){
        onUpdate();

        setFormData({
          function: 'forgot_password',
          email: '',
        });

        hitToastr('success', res.message);
      }

    } catch (error) { clo( error ); }
  };

  return (
      <form onSubmit={submit}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
          <TextField label='Email' variant='outlined' value={formData.email} name='email' fullWidth onChange={handleChange} required/>
          <Button type='submit' variant='contained' color='primary'>Forgot Password</Button>
        </Box>
      </form>
  );
};
