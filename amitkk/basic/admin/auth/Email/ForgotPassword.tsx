import React from 'react';
import { apiRequest, clo, hitToastr, useForm } from '@amitkk/basic/utils/my-utils/admin-utils';
import { DataProps } from '@amitkk/basic/admin/auth/Email/EmailRegisterModal';
import { useAuth } from 'contexts/AuthContext';
import { TextField } from '@amitkk/components/basic/TextField';
import { Button } from '@amitkk/components/button/button';

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
      const res = await apiRequest("POST", `basic/auth`, formData);      
      
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
      <form onSubmit={submit} className="space-y-4">
        <TextField label='Email' value={formData.email} name='email' onChange={handleChange} required/>
        <Button type='submit'>Forgot Password</Button>
      </form>
  );
};
