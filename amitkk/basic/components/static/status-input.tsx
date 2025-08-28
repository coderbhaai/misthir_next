import { FormControl, InputLabel, Select, MenuItem, FormHelperText, SelectChangeEvent } from "@mui/material";

interface DataProps {
  value: boolean | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => void;
  error?: boolean;
}

const StatusSelect: React.FC<DataProps> = ({ value, onChange, error }) => {
  return (
    <FormControl sx={{ width: "100%" }} error={error}>
      <InputLabel id="status-label">Status <span style={{ color: "red" }}>*</span></InputLabel>
      <Select labelId="status-label" id="status" name="status" value={String(value)} onChange={onChange}>
        <MenuItem value="true">Active</MenuItem>
        <MenuItem value="false">Not Active</MenuItem>
      </Select>
      {error && <FormHelperText>Status is required</FormHelperText>}
    </FormControl>
  );
};

export default StatusSelect;