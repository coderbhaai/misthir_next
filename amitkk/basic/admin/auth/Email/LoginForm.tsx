import React from 'react';
import { DataProps } from '@amitkk/basic/admin/auth/Email/EmailRegisterModal';
import { useAuth } from 'contexts/AuthContext';
import { apiRequest, clo, hitToastr, useForm } from '@amitkk/basic/utils/my-utils/admin-utils';
import { TextField } from '@amitkk/components/basic/TextField';
import { Button } from '@amitkk/components/button/button';
import PasswordField from './PasswordField';

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
      const res = await apiRequest("POST", `basic/auth`, formData);
      if( res?.data ){
        login(res?.data);
        handleClose();
        hitToastr('success', res.message);
      }
    } catch (error) { clo( error ); }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
        <TextField label='Email' value={formData.email} name='email' onChange={handleChange} required/>
        <PasswordField label="Password" value={formData.password} name="password" onChange={handleChange} required/>
        <Button type="submit" className="w-full">Login</Button>
    </form>
  );
};
