import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

type MultiImageUploadProps = {
  name: string;
  label?: string;
  required?: boolean;
  onChange: (name: string, files: File[]) => void;
};

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  name,
  label = "Upload Images",
  required = false,
  onChange,
}) => {
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const previewUrls = files?.map((file) => URL.createObjectURL(file));

    setPreviews(previewUrls);
    onChange(name, files);
  };

  return (
    <Box>
      <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ display: "none" }} id={name} name={name} />
      <label htmlFor={name}><Button variant="contained" component="span" startIcon={<CloudUploadIcon />}>Upload Image</Button></label>

      {previews.length > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 2, mt: 2 }}>
          {previews?.map((src, index) => (
            <img key={index} src={src} style={{ objectFit: "cover", maxWidth: "60px", borderRadius: 2 }}/>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MultiImageUpload;
