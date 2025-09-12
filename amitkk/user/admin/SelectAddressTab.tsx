import React, { useCallback, useEffect, useState } from 'react';
import { Box, Card, Typography, Checkbox, Button } from '@mui/material';
import { fullAddress } from '@amitkk/address/utils/addressUtils';
import { AddressProps } from '@amitkk/address/types/address';
import { apiRequest, clo } from '@amitkk/basic/utils/utils';
import { useAuth } from 'contexts/AuthContext';

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

  const { isLoggedIn, user } = useAuth();
  const [addressOptions, setAddressOptions] = useState<AddressProps[]>([]);
    const fetchData = useCallback(async () => {
        if( !isLoggedIn ){ return; }
        try {
            const res = await apiRequest("get", "address/address?function=get_my_addresses");
            setAddressOptions(res?.data ?? []);
        } catch (error) { clo( error ); }
    }, [isLoggedIn]);
  
    useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <Box sx={{ position: 'relative', pb: 8 }}>
      {addressOptions.length === 0 && (
        <Typography variant="body2" color="textSecondary">
          No saved addresses found.
        </Typography>
      )}

      {addressOptions.map((address) => {
        const addressId = address._id?.toString() || '';  // Ensure it's string

        return (
          <Card
            key={addressId}
            onClick={() => handleCardClick(addressId)}
            sx={{
              p: 2,
              mb: 2,
              cursor: 'pointer',
              border: selectedAddressId === addressId ? '2px solid #1976d2' : '1px solid #ccc',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Checkbox
              checked={selectedAddressId === addressId}
              onChange={() => handleCardClick(addressId)}
              sx={{ mr: 2 }}
            />
            <Box>
              <Typography variant="body1">{fullAddress(address)}</Typography>
            </Box>
          </Card>
        );
      })}

      {selectedAddressId && (
        <Box
          sx={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            width: '100%',
            backgroundColor: '#fff',
            borderTop: '1px solid #ccc',
            p: 2,
            textAlign: 'center',
          }}
        >
          <Button variant="contained" color="primary" onClick={handleSelectClick}>
            Select Address
          </Button>
        </Box>
      )}
    </Box>
  );
}
