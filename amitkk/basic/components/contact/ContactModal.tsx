import React from 'react';
import CustomModal from '@amitkk/basic/static/CustomModal';
import ContactForm from '@amitkk/basic/components/contact/ContactForm';

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
