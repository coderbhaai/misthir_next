import * as React from 'react';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps  } from "@amitkk/basic/utils/my-utils/admin-utils";
import AddressForm from './AddressForm';
import { useAuth } from 'contexts/AuthContext';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
  open: boolean;
  handleClose: () => void; 
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const { user } = useAuth();
  const title = selectedDataId ? "Edit Address" : "Create Address";



  return (
    <CustomModal open={open} handleClose={handleClose} title={title}>
      <AddressForm selectedAddressId={undefined} user_id={user?._id} onSubmit={handleUpdate}/> 
    </CustomModal>
  );
}
