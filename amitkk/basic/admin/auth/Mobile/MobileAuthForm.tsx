import React, {useState } from 'react';
import { hitToastr, apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { useAuth } from 'contexts/AuthContext';
import { TextField } from '@amitkk/components/basic/TextField';
import { Button } from '@amitkk/components/button/button';

export interface DataProps {
  role: string;
  attachUser?: boolean;
  saveUser?: boolean;
  handleUpdate: () => void;
}

type AutProps = DataProps & {
  handleClose: () => void;
  handleUpdate: () => void;
};

export default function MobileAuthForm({ role="User", handleClose, attachUser= false, saveUser = true, handleUpdate }: AutProps) {
  const { login } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  const handlePhoneSubmit = async () => {
    if (!/^\d{10}$/.test(phone)) { hitToastr('error', 'Please enter a valid 10-digit phone number.'); return; }

    try {
      const res = await apiRequest("POST", `basic/auth`, { 
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
      const res = await apiRequest("POST", `basic/auth`, {
        function:'register_or_login_via_mobile',
        name: name,
        role: role,
        phone: phone,
        email: email,
        otp: otp,
      });

      if( res?.data ){
        login(res?.data); 
        hitToastr('success', "Welcome Aboard");
      }
    } catch (error) { clo( error ); }
  };

  return (
    <>
      <div>
        <h2>Register / Login With Us</h2>
        <TextField label='Phone Number' value={phone} onChange={e => setPhone(e.target.value)} required/>
        {!isOtpSent ? (
          <Button onClick={handlePhoneSubmit} disabled={!/^\d{10}$/.test(phone)}>Send OTP</Button>
        ) : (
          <>
            <TextField label='Enter OTP' value={otp} onChange={e => setOtp(e.target.value)} />
            <Button onClick={handleRegisterOrLogin} disabled={!otp}>Verify OTP</Button>
          </>
        )}
      </div>
    </>
  );
};
