import React, { useEffect, useState } from 'react';
import CustomModal from '@amitkk/basic/static/CustomModal';
import LeadForm from './LeadForm';

type DataFormProps ={
  onClose: () => void;
  open: boolean;
  module_id: string | null;
};

export default function LeadModal({ onClose, open, module_id }: DataFormProps) {
  return (
    <CustomModal open={open} handleClose={onClose} title="Connect Today">
      <LeadForm handleClose={onClose} module_id={module_id} />
    </CustomModal>
  );
};
