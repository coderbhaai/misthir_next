import React, { useState } from 'react';
import CustomModal from '@amitkk/basic/static/CustomModal';
import MobileAuthForm from '@amitkk/basic/components/auth/MobileAuthForm';

export interface DataProps {
  role: string;
  attachUser?: boolean;
  saveUser?: boolean;
  onUpdate: () => void;
}

type DataFormProps = DataProps & {
  open: boolean;
  title: string;
};

export default function RegisterModal({ role="User", open, title, attachUser = false, saveUser= true, onUpdate }: DataFormProps) {
  return (
    <CustomModal open={open} handleClose={onUpdate} title={title}>
      <MobileAuthForm role = { role } handleClose={onUpdate} attachUser saveUser onUpdate={onUpdate}/>
    </CustomModal>
  );
};
