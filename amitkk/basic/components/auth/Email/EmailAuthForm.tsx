import React, {useEffect, useState } from 'react';
import {TextField, Button, Box, Typography} from '@mui/material';
import { hitToastr, apiRequest, clo, useForm } from '@amitkk/basic/utils/utils';
import { DataProps } from '@amitkk/basic/components/auth/Email/EmailRegisterModal';
import { useAuth } from 'contexts/AuthContext';

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
  const { registerFormData, setRegisterFormData, handleRegisterChange } = useForm<EmailAuthProps>({
    function : 'create_update_comment',
    name: '',
    email: '',
    phone: '',
    otp: '',
    password: '',
    confirm_password: '',
    role,
  });

  const { loginFormData, setLoginFormData, handleLoginChange } = useForm<EmailAuthProps>({
    function : 'create_update_comment',
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
      const res = await apiRequest("post", "basic/auth", {
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
      const res = await apiRequest("post", `basic/auth`, registerFormData);      
      hitToastr('success', res.message);

      if( res?.data ){
        login(res?.data?.token, res?.data);
        // handleClose();
      }
    } catch (error) { clo( error ); }
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const res = await apiRequest("post", `basic/comment`, registerFormData);      
      hitToastr('success', res.message);

      if( res?.data ){
        login(res?.data?.token, res?.data);
        handleClose();
      }
    } catch (error) { clo( error ); }
  };

  return (
    <>
      { moduleSelected=="Register" ? (
        <form onSubmit={handleRegister}>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
            <Typography variant='h4' align='center' gutterBottom>Register With Us</Typography>
            <TextField label='Name' variant='outlined' value={registerFormData.name} name='name' fullWidth onChange={handleRegisterChange} required/>
            <TextField label='Email' variant='outlined' value={registerFormData.email} name='email' fullWidth onChange={handleRegisterChange} required/>
            <TextField label='Phone Number' variant='outlined' value={registerFormData.phone} name='phone' fullWidth onChange={handleRegisterChange} required/>
            { registerFormData.email ? (
              <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={sendEmailOtp} disabled={otpCooldown > 0}>
                {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : "Send OTP"}
              </Button>
            ) : null}
          {isOtpSent? ( <TextField label="Enter OTP" variant="outlined" value={registerFormData.otp} name='otp' fullWidth onChange={handleRegisterChange}  sx={{ mt: 2 }} required/> ): null }
          <TextField type="password" label='Password' variant='outlined' value={registerFormData.password} name='password' fullWidth onChange={handleRegisterChange} required/>
          <TextField type="password" label='Confirm Password' variant='outlined' value={registerFormData.confirm_password} name='confirm_password' fullWidth onChange={handleRegisterChange} required/>
          <Button type='submit' variant='contained' color='primary' disabled={!registerFormData.otp}>Regsiter</Button>
          </Box>
        </form>
      ):(
        <form onSubmit={handleLogin}>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
            <Typography variant='h4' align='center' gutterBottom>Login With Us</Typography>
            <TextField label='Email' variant='outlined' value={loginFormData.email} name='email' fullWidth onChange={handleChange} required/>
            <TextField type="password" label='Password' variant='outlined' value={loginFormData.password} name='password' fullWidth onChange={handleChange} required/>
          </Box>
          <Button type='submit' variant='contained' color='primary' disabled={!loginFormData.otp}>Regsiter</Button>
        </form>
      )}
    </>
  );
};
