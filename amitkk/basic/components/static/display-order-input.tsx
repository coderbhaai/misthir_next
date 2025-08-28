import { TextField } from "@mui/material";

interface DataProps {
  value?: number | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: boolean;
}

const DisplayOrder: React.FC<DataProps> = ({ value, onChange, error }) => {
  return (
    <TextField
      type="number"
      label="Display Order"
      variant="outlined"
      name="displayOrder"
      fullWidth
      value={value === null ? "" : value ?? ""}
      onChange={onChange}
      error={error}
    />
  );
};

export default DisplayOrder;