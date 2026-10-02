import React from 'react';
import MobileAuthForm from '@amitkk/basic/admin/auth/Mobile/MobileAuthForm';

interface MobileRegisterFormProps {
  role?: string;
  attachUser?: boolean;
  saveUser?: boolean;
  handleClose: () => void;
  handleUpdate: () => void;
}

const MobileRegisterForm: React.FC<MobileRegisterFormProps> = ({ role="User", handleClose, attachUser= false, saveUser = true, handleUpdate }) => {
  return (
    <MobileAuthForm role = { role } handleClose={handleUpdate} attachUser saveUser handleUpdate={handleUpdate}/>
  );
};

export default MobileRegisterForm;
