import { SelectChangeEvent, TextField, Box } from "@mui/material";

interface DataProps {
  title: String;
  description: String;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => void;
}

const MetaInput: React.FC<DataProps> = ({ title, description, onChange }) => {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: 2, width: "100%", mt: 2, mb: 2 }}>
      <TextField label="Meta Title" variant="outlined" value={title} name="title" fullWidth onChange={onChange} required/>
      <TextField label="Meta Description" variant="outlined" value={description} name="description" fullWidth onChange={onChange} required multiline rows={2}/>
    </Box>
  );
};

export default MetaInput;