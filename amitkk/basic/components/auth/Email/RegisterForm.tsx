import React, {useEffect, useState } from 'react';
import {TextField, Button, Box, Typography} from '@mui/material';
import { hitToastr, apiRequest, clo, useForm } from '@amitkk/basic/utils/utils';
import { DataProps } from '@amitkk/basic/components/auth/Email/EmailRegisterModal';
import { useAuth } from 'contexts/AuthContext';

type AuthProps = DataProps & {
  handleClose: () => void;
};

type RegisterProps = {
  function?: string;
  name: string;
  email: string;
  phone: string;
  otp?: string;
  role?: string;
  password?: string;
  confirm_password?: string;
};

export default function RegisterForm({ role="User", handleClose, attachUser= false, saveUser = true, onUpdate }: AuthProps) {
  const { login } = useAuth();
  const { formData, setFormData, handleChange } = useForm<RegisterProps>({
    function : 'register_via_email',
    name: '',
    email: '',
    phone: '',
    otp: '',
    password: '',
    confirm_password: '',
    role,
  });

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
    const email = formData.email?.toString().trim();
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

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if( !formData.name || !formData.email || !formData.phone || !formData.otp || !formData.password || !formData.confirm_password ){
      hitToastr('success', "Fields are Missing"); return;
    }

    try {
      const res = await apiRequest("post", `basic/auth`, formData);      
      
      if( res?.data ){
        login( res?.data );
        handleClose();
        hitToastr('success', res.message);
      }

    } catch (error) { clo( error ); }
  };

  return (
      <form onSubmit={submit}>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
          <TextField label='Name' variant='outlined' value={formData.name} name='name' fullWidth onChange={handleChange} required/>
          <TextField label='Email' variant='outlined' value={formData.email} name='email' fullWidth onChange={handleChange} required/>
          <TextField label='Phone Number' variant='outlined' value={formData.phone} name='phone' fullWidth onChange={handleChange} required/>
          { formData.email ? (
            <Button variant="contained" color="primary" sx={{ mt: 2 }} onClick={sendEmailOtp} disabled={otpCooldown > 0}>
              {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : "Send OTP"}
            </Button>
          ) : null}
          {isOtpSent? ( <TextField label="Enter OTP" variant="outlined" value={formData.otp} name='otp' fullWidth onChange={handleChange}  sx={{ mt: 2 }} required/> ): null }
          <TextField type="password" label='Password' variant='outlined' value={formData.password} name='password' fullWidth onChange={handleChange} required/>
          <TextField type="password" label='Confirm Password' variant='outlined' value={formData.confirm_password} name='confirm_password' fullWidth onChange={handleChange} required/>
          <Button type='submit' variant='contained' color='primary' disabled={!formData.otp}>Regsiter</Button>
        </Box>
      </form>
  );
};
