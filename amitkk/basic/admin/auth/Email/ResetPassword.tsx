import React, {useEffect, useState } from 'react';
import { apiRequest, clo, hitToastr, useForm } from '@amitkk/basic/utils/my-utils/admin-utils';
import { DataProps } from '@amitkk/basic/admin/auth/Email/EmailRegisterModal';
import { useAuth } from 'contexts/AuthContext';
import { TextField } from '@amitkk/components/basic/TextField';
import { Button } from '@amitkk/components/button/button';
import PasswordField from './PasswordField';

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
      const res = await apiRequest("POST", `basic/auth`, formData);      
      
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
      <form onSubmit={submit} className="space-y-4">
          <TextField label='Email' value={formData.email} name='email' onChange={handleChange} required/>
          <TextField label="Enter OTP" value={formData.otp} name='otp' onChange={handleChange} required/>
          <PasswordField label="Password" value={formData.password} name="password" onChange={handleChange} required/>
          <PasswordField label="Confirm Password" value={formData.confirm_password} name="confirm_password" onChange={handleChange} required/>
          <Button type='submit' disabled={!formData.otp}>Reset Password</Button>
      </form>
  );
};
