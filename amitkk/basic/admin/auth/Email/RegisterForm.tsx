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

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if( !formData.name || !formData.email || !formData.phone || !formData.otp || !formData.password || !formData.confirm_password ){
      hitToastr('success', "Fields are Missing"); return;
    }

    try {
      const res = await apiRequest("POST", `basic/auth`, formData);      
      
      if( res?.data ){
        login( res?.data );
        handleClose();
        hitToastr('success', res.message);
      }

    } catch (error) { clo( error ); }
  };

  return (
      <form onSubmit={submit} className="space-y-4">
          <TextField label='Name' value={formData.name} name='name' onChange={handleChange} required/>
          <TextField label='Email' value={formData.email} name='email' onChange={handleChange} required/>
          <TextField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required/>
          { formData.email ? (
            <Button onClick={sendEmailOtp} disabled={otpCooldown > 0} type="button">
              {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : "Send OTP"}
            </Button>
          ) : null}
          {isOtpSent? ( <TextField label="Enter OTP" value={formData.otp} name='otp' onChange={handleChange}required/> ): null }
          <PasswordField label="Password" value={formData.password} name="password" onChange={handleChange} required/>
          <PasswordField label="Confirm Password" value={formData.confirm_password} name="confirm_password" onChange={handleChange} required/>
          <Button type='submit' disabled={!formData.otp}>Regsiter</Button>
      </form>
  );
};
