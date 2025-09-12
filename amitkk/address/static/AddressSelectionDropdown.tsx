import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { fullAddress } from '../utils/addressUtils';
import EditIcon from '@mui/icons-material/Edit';

type AddressSelectionDropdownProps = {
  addressOptions: any[];
  selectedAddressId?: string;
  onSelect: (addressId: string) => void;
  onEdit?: (addressId: string) => void;
  label?: string;
};

export default function AddressSelectionDropdown({
  addressOptions,
  selectedAddressId = '',
  onSelect,
  onEdit,
  label = 'Select Address',
}: AddressSelectionDropdownProps) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onSelect(event.target.value);
  };

  // ✅ Ensure value is valid
  const isValid = addressOptions.some((a) => a._id === selectedAddressId);
  const safeValue = isValid ? selectedAddressId : '';

  const selectedAddress = addressOptions?.find((a) => a._id === safeValue);

  return (
    <Box sx={{ width: '100%', my: 2 }}>
      <FormControl fullWidth variant="outlined">
        <InputLabel id={`${label}-select-label`}>{label}</InputLabel>
        <Select
          labelId={`${label}-select-label`}
          id={`${label}-select`}
          value={safeValue}
          label={label}
          onChange={handleChange}
        >
          {/* Fallback option */}
          <MenuItem value="">
            <em>Select address</em>
          </MenuItem>
          {addressOptions?.map((i: any) => (
            <MenuItem key={i._id} value={i._id}>
              {fullAddress(i)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedAddress && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            border: '1px solid #ccc',
            borderRadius: 1,
            position: 'relative',
          }}
        >
          <Typography variant="body2">
            {fullAddress(selectedAddress)}
          </Typography>
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8 }}
            onClick={() => onEdit?.(selectedAddress._id as string)}
          >
            <EditIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
