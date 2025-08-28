import React, { useState } from 'react';
import CustomModal from '@amitkk/basic/static/CustomModal';
import ContactForm from '@amitkk/basic/components/contact/ContactForm';
import { ContactProps } from '@amitkk/basic/types/page';

type ContactModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  return (
    <CustomModal open={isOpen} handleClose={onClose} title="Connect With Us">
      <ContactForm handleClose={onClose} />
    </CustomModal>
  );
};
