import React, { useState } from 'react';
import { fullAddress } from '@amitkk/address/utils/addressUtils';
import { AddressProps } from '../types';
import { Checkbox } from '@amitkk/components/basic/checkbox';
import { Button } from '@amitkk/components/button/button';
import { Card } from '@amitkk/components/ui/card';

type SelectAddressTabProps = {
  addressOptions: AddressProps[];
  onSelect: (addressId: string) => void;
};

export default function SelectAddressTab({ addressOptions, onSelect }: SelectAddressTabProps) {
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const handleCardClick = (id: string) => { setSelectedAddressId(id); };

  const handleSelectClick = () => {
    if (selectedAddressId) {
      onSelect(selectedAddressId);
    }
  };

  return (
    <div className="relative pb-20">
      {addressOptions.length === 0 && ( <p className="text-sm text-muted-foreground">No saved addresses found.</p> )}

      <div className="space-y-4">
        {addressOptions.map((address) => {
          const addressId = address._id?.toString() || '';
          const isSelected = selectedAddressId === addressId;

          return (
            <Card key={addressId} onClick={() => handleCardClick(addressId)} className={`p-4 flex items-center cursor-pointer transition-colors border-2 ${isSelected ? "border-primary bg-accent/20" : "border-border hover:bg-accent/10"}`}>
              <Checkbox id={`address-${addressId}`} checked={isSelected} onCheckedChange={() => handleCardClick(addressId)} className="mr-4 pointer-events-none"/>
              <div>
                <p className="text-sm font-medium leading-none text-foreground">{fullAddress(address)}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedAddressId && (
        <div className="sticky bottom-0 left-0 w-full bg-background border-t border-border p-4 text-center mt-6 z-10">
          <Button variant="default" onClick={handleSelectClick} className="w-full sm:w-auto px-8">Select Address</Button>
        </div>
      )}
    </div>
  );
}