import React from 'react';
import MobileAuthForm from '@amitkk/basic/components/auth/MobileAuthForm';

interface RegisterFormProps {
  role?: string;
  attachUser?: boolean;
  saveUser?: boolean;
  handleClose: () => void;
  onUpdate: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ role="User", handleClose, attachUser= false, saveUser = true, onUpdate }) => {
  return (
    <MobileAuthForm role = { role } handleClose={onUpdate} attachUser saveUser onUpdate={onUpdate}/>
  );
};

export default RegisterForm;
