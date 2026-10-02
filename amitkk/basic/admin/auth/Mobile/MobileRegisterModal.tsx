import React from 'react';
import CustomModal from '@amitkk/basic/static/CustomModal';
import MobileAuthForm from '@amitkk/basic/admin/auth/Mobile/MobileAuthForm';
import type { DataProps } from '@amitkk/basic/admin/auth/Mobile/MobileAuthForm';

type DataFormProps = DataProps & {
  open: boolean;
  title: string;
};

export default function MobileRegisterModal({ role="User", open, title, attachUser = false, saveUser= true, handleUpdate }: DataFormProps) {
  return (
    <CustomModal open={open} handleClose={handleUpdate} title={title}>
      <MobileAuthForm role={ role } handleClose={handleUpdate} attachUser saveUser handleUpdate={handleUpdate}/>
    </CustomModal>
  );
};
