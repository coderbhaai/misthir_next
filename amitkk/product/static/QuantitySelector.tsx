import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

type QuantitySelectorProps = {
  value: number;
  minQuantity?: number;
  onChange: (quantity: number) => void;
};

const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  minQuantity = 1,
  onChange,
}) => {
  const increment = () => onChange(value + 1);
  const decrement = () => onChange(Math.max(minQuantity, value - 1));

  return (
    <Box display="flex" alignItems="center" sx={{ border: '1px solid #ccc', borderRadius: 2 }}>
      <IconButton onClick={decrement} size="small" disabled={value <= minQuantity}>
        <RemoveIcon />
      </IconButton>

      <Typography sx={{ px: 2, minWidth: 30, textAlign: 'center' }}>{value}</Typography>

      <IconButton onClick={increment} size="small">
        <AddIcon />
      </IconButton>
    </Box>
  );
};

export default QuantitySelector;
