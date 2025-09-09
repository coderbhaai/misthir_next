import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { OptionProps } from '@amitkk/basic/types/page';

type GenericSelectInputProps = {
  label: string;
  name: string;
  value: OptionProps | null;
  options: OptionProps[];
  required?: boolean;
  onChange: (data: { id?: string; new?: string }) => void;
};


const GenericSelectInput: React.FC<GenericSelectInputProps> = ({
  label,
  value,
  options,
  required = false,
  onChange,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const [selectedOption, setSelectedOption] = useState<OptionProps | null>(null);

  useEffect(() => {
    if (value && typeof value === 'object') {
      setSelectedOption(value);
      setInputValue(value.name);
    } else {
      setSelectedOption(null);
      setInputValue('');
    }
  }, [value]);

  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
      value={selectedOption}
      inputValue={inputValue}
      onChange={(_, newValue) => {
        if (typeof newValue === 'string') {
          setSelectedOption(null);
          onChange({ new: newValue });
        } else if (newValue && typeof newValue === 'object') {
          setSelectedOption(newValue);
          setInputValue(newValue.name);
          onChange({ id: newValue._id });
        } else {
          setSelectedOption(null);
          onChange({ new: '' });
        }
      }}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);

        const matchedOption = options.find(opt => opt.name === newInputValue);
        if (matchedOption) {
          setSelectedOption(matchedOption);
          onChange({ id: matchedOption._id });
        } else {
          setSelectedOption(null);
          onChange({ new: newInputValue });
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={`${label}${required ? ' *' : ''}`}
          variant="outlined"
          fullWidth
        />
      )}
    />
  );
};

export default GenericSelectInput;
