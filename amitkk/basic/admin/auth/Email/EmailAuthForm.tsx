import React, {useEffect, useState } from 'react';
import { apiRequest, clo, hitToastr, useForm } from '@amitkk/basic/utils/my-utils/admin-utils';
import { DataProps } from '@amitkk/basic/admin/auth/Email/EmailRegisterModal';
import { useAuth } from 'contexts/AuthContext';
import { TextField } from '@amitkk/components/basic/TextField';
import { Button } from '@amitkk/components/button/button';
import PasswordField from './PasswordField';

type AuthProps = DataProps & {
  handleClose: () => void;
  module: string;
};

export interface EmailAuthProps {
  function?: string;
  name: string;
  email: string;
  phone: string;
  otp?: string;
  role?: string;
  password?: string;
  confirm_password?: string;
};

export default function EmailAuthForm({ module="Register", role="User", handleClose, attachUser= false, saveUser = true, onUpdate }: AuthProps) {
  const { login } = useAuth();
  const { formData: registerFormData, setFormData: setRegisterFormData, handleChange: handleRegisterChange } = useForm<EmailAuthProps>({
    function : 'register_via_email',
    name: '',
    email: '',
    phone: '',
    otp: '',
    password: '',
    confirm_password: '',
    role,
  });

  const { formData: loginFormData, setFormData: setLoginFormData, handleChange: handleLoginChange } = useForm<EmailAuthProps>({
    function : 'login_via_email',
    name: '',
    email: '',
    phone: '',
    otp: '',
    password: '',
    confirm_password: '',
    role,
  });

  const [moduleSelected, setModuleSelected] = useState(module);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (otpCooldown > 0) {
      const id = setInterval(() => setOtpCooldown((t) => t - 1), 1000);
      setTimerId(id);
      return () => clearInterval(id);
    } else if (timerId) {
      clearInterval(timerId);
    }
  }, [otpCooldown]);

  const sendEmailOtp = async () => {
    const email = registerFormData.email?.toString().trim();

    if (!email) return hitToastr("error", "Email is required");

    try {
      const res = await apiRequest("POST", "basic/auth", {
        function: "generate_email_otp",
        type: "email",
        email,
      });

      if (res?.data) {
        setIsOtpSent(true);
        setOtpCooldown(30);
      }

      hitToastr("success", res?.message);

    } catch (error) { clo(error); }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if( !registerFormData.name || !registerFormData.email || !registerFormData.phone || !registerFormData.otp || !registerFormData.password || !registerFormData.confirm_password ){
      hitToastr('success', "Fields are Missing"); return;
    }

    try {
      const res = await apiRequest("POST", `basic/auth`, loginFormData);      
      hitToastr('success', res.message);

      if( res?.data ){
        login(res?.data?.token);
        handleClose();
      }
    } catch (error) { clo( error ); }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const res = await apiRequest("POST", `basic/auth`, registerFormData);      
      hitToastr('success', res.message);

      if( res?.data ){
        login(res?.data?.token);
        handleClose();
      }
    } catch (error) { clo( error ); }
  };

  return (
    <>
      { moduleSelected=="Register" ? (
        <form onSubmit={handleRegister}>
            <h2>Register With Us</h2>
            <TextField label='Name' value={registerFormData.name} name='name' onChange={handleRegisterChange} required/>
            <TextField label='Email' value={registerFormData.email} name='email' onChange={handleRegisterChange} required/>
            <TextField label='Phone Number' value={registerFormData.phone} name='phone' onChange={handleRegisterChange} required/>
            { registerFormData.email ? (
              <Button onClick={sendEmailOtp} disabled={otpCooldown > 0}>
                {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : "Send OTP"}
              </Button>
            ) : null}
          {isOtpSent? ( <TextField label="Enter OTP" value={registerFormData.otp} name='otp' onChange={handleRegisterChange}required/> ): null }
          <PasswordField label="Password" value={registerFormData.password} name="password" onChange={handleRegisterChange} required/>
          <PasswordField label="Confirm Password" value={registerFormData.confirm_password} name="confirm_password" onChange={handleRegisterChange} required/>
          <Button type='submit' disabled={!registerFormData.otp}>Regsiter</Button>
        </form>
      ):(
        <form onSubmit={handleLogin}>
            <h2>Login With Us</h2>
            <TextField label='Email' value={loginFormData.email} name='email' onChange={handleLoginChange} required/>
            <PasswordField label="Password" value={loginFormData.password} name="password" onChange={handleLoginChange} required/>
          <Button type='submit' disabled={!loginFormData.otp}>Regsiter</Button>
        </form>
      )}
    </>
  );
};
