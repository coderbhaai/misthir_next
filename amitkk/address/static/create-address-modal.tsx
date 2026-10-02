import * as React from 'react';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { apiRequest, clo, TableDataFormProps } from '@amitkk/basic/utils/my-utils/admin-utils';
import { useAuth } from 'contexts/AuthContext';
import { useCallback, useEffect, useState } from 'react';
import SelectAddressTab from './SelectAddressTab';
import AddressForm from './AddressForm';
import { AddressProps } from '@amitkk/address/types';
import { Tabs, TabsList, TabsTrigger } from '@amitkk/components/ui/tabs';

type DataFormProps = TableDataFormProps & {
  email: string;
  phone: string;
  handleUpdate: (addressId: string) => Promise<void> | void;
};

export default function CreateUpdateAddressModal({ 
  open, 
  handleClose, 
  selectedDataId,
  handleUpdate 
}: DataFormProps) { 
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (selectedDataId) {
      setActiveTab(2);
    } else {
      setActiveTab(0);
    }
  }, [selectedDataId, open]);

  const [addressOptions, setAddressOptions] = useState<AddressProps[]>([]);
  
  const fetchData = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res = await apiRequest("POST", "address/address", { 
        function: "get_my_addresses"
      });
      setAddressOptions(res?.data ?? []);
    } catch (error) { clo(error); }
  }, [isLoggedIn, open]);
  
  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => setActiveTab(newValue);
  const title = selectedDataId ? "Edit Address" : ["Create Address", "Select Address"][activeTab] || "Manage Address";

  const onAddressSubmit = (addressId: string) => {
    handleUpdate(addressId);
    handleClose();
  };

  return (
    <CustomModal open={open} handleClose={handleClose} title={title}>
      <div className="border-b border-border mb-6">
        <Tabs value={String(activeTab)} onValueChange={(val) => handleTabChange({} as React.SyntheticEvent, Number(val))}>
          <TabsList className="bg-transparent h-auto p-0 gap-2 border-b-0">
            {!selectedDataId && ( <TabsTrigger value="0">Create Address</TabsTrigger> )}
            {!selectedDataId && Boolean(addressOptions.length) && ( <TabsTrigger value="1">Select Address</TabsTrigger> )}
            {selectedDataId && ( <TabsTrigger value="2" disabled={!selectedDataId}>Edit Address</TabsTrigger> )}
          </TabsList>
        </Tabs>
      </div>

      {activeTab === 0 && ( <AddressForm selectedAddressId={""} onSubmit={onAddressSubmit}/> )}
      {activeTab === 1 && ( <SelectAddressTab addressOptions={addressOptions} onSelect={onAddressSubmit}/> )}
      {activeTab === 2 && selectedDataId && ( <AddressForm selectedAddressId={selectedDataId} onSubmit={onAddressSubmit}/> )}
    </CustomModal>
  );
}