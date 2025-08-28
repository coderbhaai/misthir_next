import React from 'react';
import { Box, Chip, Checkbox, FormControl, InputLabel, ListItemText, MenuItem, Select, SelectChangeEvent, } from '@mui/material';

type Option = {
  _id: string;
  name: string;
};

interface MultiSelectDropdownProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (event: SelectChangeEvent<string[]>) => void;
}


const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
}) => {
  const labelId = `${label.toLowerCase().replace(/\s/g, '-')}-label`;

  return (
    <FormControl sx={{ width: '100%' }}>
      <InputLabel id={labelId} sx={{ background: '#fff' }}>{label}</InputLabel>
      <Select
        labelId={labelId}
        multiple
        value={selected}
        onChange={onChange}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected?.map((value) => {
              const found = options.find((opt) => opt._id === value);
              return <Chip key={value} label={found?.name || 'Unknown'} />;
            })}
          </Box>
        )}
      >
        {(options ?? []).length > 0 ? (  (options ?? [])?.map((opt: Option) => (
          <MenuItem key={opt._id} value={opt._id}><Checkbox checked={selected.includes(opt._id)} />
            <ListItemText primary={opt.name} />
          </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No options available</MenuItem>
        )}
      </Select>
    </FormControl>
  );
};

export default MultiSelectDropdown;