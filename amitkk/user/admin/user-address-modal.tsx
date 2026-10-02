import * as React from 'react';
import type {DataProps} from '@amitkk/user/admin/user-address-table';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps  } from "@amitkk/basic/utils/my-utils/admin-utils";
import { useEffect, useState } from 'react';
import SelectAddressTab from './SelectAddressTab';
import AddressForm from './AddressForm';
import { Tabs, TabsList, TabsTrigger } from '@amitkk/components/ui/tabs';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
  userId: string | undefined;
  open: boolean;
  handleClose: () => void; 
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate, userId }: DataFormProps) { 
  const handleCloseModal = () => {
    handleClose();
  };

  const [activeTab, setActiveTab] = useState(0);
  useEffect(() => {
    if (selectedDataId) {
      setActiveTab(2);
    } else {
      setActiveTab(0);
    }
  }, [selectedDataId, open]);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => setActiveTab(newValue);
  const title = selectedDataId ? "Edit Address" : ["Create Address", "Select Address"][activeTab] || "Manage Address";

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <Tabs value={String(activeTab)} onValueChange={(val) => handleTabChange({} as React.SyntheticEvent, Number(val))} className="w-full">
        <TabsList className="border-b border-border w-full justify-start rounded-none bg-transparent h-auto p-0 space-x-6">
          {!selectedDataId && <TabsTrigger value="0" className="...">Create Address</TabsTrigger>}
          {!selectedDataId && <TabsTrigger value="1" className="...">Select Address</TabsTrigger>}
          <TabsTrigger value="2" disabled={!selectedDataId} className="...">Edit Address</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === 0 && ( <AddressForm selectedAddressId={undefined} userId={userId} onSubmit={onUpdate}/> )}
      {activeTab === 1 && ( <SelectAddressTab onSelect={(addressId: string) => { onUpdate({ _id: addressId } as DataProps); }}/> )}
      {activeTab === 2 && selectedDataId && ( <AddressForm selectedAddressId={selectedDataId} userId={userId} onSubmit={onUpdate}/> )}
    </CustomModal>
  );
}
