import React from 'react';
import CustomModal from '@amitkk/basic/static/CustomModal';
import BulkOrderForm from './BulkOrderForm';

type BulkModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product_id: string;
  sku_id?: string;
  seller_id?: string;
};

export default function BulkOrderModal({ isOpen, onClose, product_id, sku_id, seller_id }: BulkModalProps) {
  return (
    <CustomModal open={isOpen} handleClose={onClose} title="Connect For Bulk Order">
      <BulkOrderForm handleClose={onClose} product_id={product_id} sku_id={sku_id} seller_id={seller_id} />
    </CustomModal>
  );
};