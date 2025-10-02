import React, {useState } from 'react';
import {TextField, Button, Box, Typography} from '@mui/material';
import { hitToastr, apiRequest, clo } from '@amitkk/basic/utils/utils';
import { DataProps } from '@amitkk/basic/components/auth/Mobile/MobileRegisterModal';
import { useAuth } from 'contexts/AuthContext';

type AutProps = DataProps & {
  handleClose: () => void;
};

export default function MobileAuthForm({ role="User", handleClose, attachUser= false, saveUser = true, onUpdate }: AutProps) {
  const { login } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handleChange = (setter: (value: string) => void) => {
    return (e: React.ChangeEvent<HTMLInputElement>) => setter(e.target.value);
  };

  const handlePhoneSubmit = async () => {
    if (!/^\d{10}$/.test(phone)) { hitToastr('error', 'Please enter a valid 10-digit phone number.'); return; }

    try {
      const res = await apiRequest("post", `basic/auth`, { 
        function: 'generate_phone_otp',
        type:'phone',
        email:null,
        phone: phone
      });

      if( res?.data ){
        setIsOtpSent(true);
      }

    } catch (error) { clo( error ); }
  };

  const handleRegisterOrLogin = async () => {
    if (!otp) { hitToastr('error', 'Please enter the OTP.'); return; }

    try {
      const res = await apiRequest("post", `basic/auth`, {
        function:'register_or_login_via_mobile',
        name: name,
        role: role,
        phone: phone,
        email: email,
        otp: otp,
      });

      if( res?.data ){
        login(res?.data?.token, res?.data); 
        hitToastr('success', "Welcome Aboard");
      }
    } catch (error) { clo( error ); }
  };

  return (
    <>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
        <Typography variant='h4' align='center' gutterBottom>Register / Login With Us</Typography>
        <TextField label='Phone Number' variant='outlined' fullWidth value={phone} onChange={e => setPhone(e.target.value)} sx={{mb: 2}} required/>
        {!isOtpSent ? (
          <Button variant='contained' color='primary' fullWidth onClick={handlePhoneSubmit} disabled={!/^\d{10}$/.test(phone)}>Send OTP</Button>
        ) : (
          <>
            <TextField label='Enter OTP' variant='outlined' fullWidth value={otp} onChange={e => setOtp(e.target.value)} sx={{mb: 2}} />
            <Button variant='contained' color='primary' fullWidth onClick={handleRegisterOrLogin} disabled={!otp}>Verify OTP</Button>
          </>
        )}
      </Box>
    </>
  );
};
