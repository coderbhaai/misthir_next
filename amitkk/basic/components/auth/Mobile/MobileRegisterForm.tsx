import React from 'react';
import MobileAuthForm from '@amitkk/basic/components/auth/Mobile/MobileAuthForm';

interface MobileRegisterFormProps {
  role?: string;
  attachUser?: boolean;
  saveUser?: boolean;
  handleClose: () => void;
  onUpdate: () => void;
}

const MobileRegisterForm: React.FC<MobileRegisterFormProps> = ({ role="User", handleClose, attachUser= false, saveUser = true, onUpdate }) => {
  return (
    <MobileAuthForm role = { role } handleClose={onUpdate} attachUser saveUser onUpdate={onUpdate}/>
  );
};

export default MobileRegisterForm;
