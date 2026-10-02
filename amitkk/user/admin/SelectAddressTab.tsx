import React, { useCallback, useEffect, useState } from 'react';
import { fullAddress } from '@amitkk/address/utils/addressUtils';
import { useAuth } from 'contexts/AuthContext';
import { apiRequest, clo } from '@amitkk/basic/utils/my-utils/admin-utils';
import { Button } from '@amitkk/components/button/button';
import { Checkbox } from '@amitkk/components/basic/checkbox';
import { Card } from '@amitkk/components/ui/card';
import { AddressProps } from '@amitkk/address/types';

type SelectAddressTabProps = {
  onSelect: (addressId: string) => void;
};

export default function SelectAddressTab({ onSelect }: SelectAddressTabProps) {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const handleCardClick = (id: string) => {
    setSelectedAddressId(id);
  };

  const handleSelectClick = () => {
    if (selectedAddressId) {
      onSelect(selectedAddressId);
    }
  };

  const { isLoggedIn } = useAuth();
  const [addressOptions, setAddressOptions] = useState<AddressProps[]>([]);
  const fetchData = useCallback(async () => {
      if( !isLoggedIn ){ return; }
      try {
          const res = await apiRequest("GET", "address/address?function=get_my_addresses");
          setAddressOptions(res?.data ?? []);
      } catch (error) { clo( error ); }
  }, [isLoggedIn]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="relative py-5 space-y-4">
      {addressOptions.length === 0 && ( <p className="text-sm text-muted-foreground">No saved addresses found.</p> )}

      <div className="space-y-3">
        {addressOptions.map((address) => {
          const addressId = address._id?.toString() || "";
          const isSelected = selectedAddressId === addressId;

          return (
            <Card key={addressId} onClick={() => handleCardClick(addressId)} className={`p-4 cursor-pointer flex items-center transition-all shadow-none ${ isSelected ? "border-2 border-primary bg-primary/5" : "border border-border hover:bg-muted/50"}`}>
              <Checkbox checked={isSelected} onCheckedChange={() => handleCardClick(addressId)} className="mr-3"/>
              <p className="text-sm font-medium">{fullAddress(address)}</p>
            </Card>
          );
        })}
      </div>

      {selectedAddressId && (
        <div className="sticky bottom-0 left-0 w-full bg-background border-t border-border p-4 text-center shadow-md z-10">
          <Button onClick={handleSelectClick}>Select Address</Button>
        </div>
      )}
    </div>
  );
}
