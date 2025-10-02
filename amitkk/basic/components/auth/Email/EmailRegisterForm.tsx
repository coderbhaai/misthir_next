import React from 'react';
import EmailAuthForm from '@amitkk/basic/components/auth/Email/EmailAuthForm';

interface EmailRegisterFormProps {
  role?: string;
  attachUser?: boolean;
  saveUser?: boolean;
  handleClose: () => void;
  onUpdate: () => void;
}

const EmailRegisterForm: React.FC<EmailRegisterFormProps> = ({ role="User", handleClose, attachUser= false, saveUser = true, onUpdate }) => {
  return (
    <EmailAuthForm role = { role } handleClose={onUpdate} attachUser saveUser onUpdate={onUpdate}/>
  );
};

export default EmailRegisterForm;
