"use client";

import { useState } from "react";
import { Button, Typography, Box } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface ImageUploadProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string | null;
  onChange: (name: string, file: File | null) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ name, label, required = false, error, onChange }) => {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    if (file) {
      setPreview(URL.createObjectURL(file));
      onChange(name, file);
    } else {
      setPreview(null);
      onChange(name, null);
    }
  };

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {label && (
        <Typography variant="body1">{label} {required && "*"}</Typography>
      )}

      <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} id={name} name={name} />
      <label htmlFor={name}><Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>Upload Image</Button></label>

      {preview && (
        <Box component="img" src={preview} alt="Preview" sx={{ width: 100, height: 100, objectFit: "cover", borderRadius: 2, border: "1px solid #ccc" }}/>
      )}
      {error && <Typography color="error" variant="caption">{error}</Typography>}
    </Box>
  );
};

export default ImageUpload;
