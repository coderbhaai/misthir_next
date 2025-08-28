"use client";

import { useState } from "react";
import { Box, TextField, SelectChangeEvent } from "@mui/material";
import ImageUpload from "./file-input";
import MediaImage from "./table-image";
import { Types } from "mongoose";
import CkEditor from "@amitkk/basic/components/static/ckeditor-input";
import { MediaProps } from "@amitkk/basic/types/page";

interface CoverContentEditorProps {
  cover_id: string | Types.ObjectId | MediaProps | null;
  heading: string;
  content: string;
  content_required: boolean;
  coverImageError?: string | null;
  contentError?: string | null;
  onChange: (name: string, value: any) => void;
}

const CoverContentEditor: React.FC<CoverContentEditorProps> = ({
  cover_id,
  heading,
  content,
  content_required,
  coverImageError,
  contentError,
  onChange,
}) => {
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <MediaImage media={cover_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
          <ImageUpload name="cover_image" label="Cover Image" required={content_required} error={coverImageError} onChange={(name, file) => onChange(name, file)}/>
        </div>
      <TextField label="Heading" variant="outlined" value={heading} name="heading" onChange={(e) => onChange(e.target.name, e.target.value)} fullWidth />
      <CkEditor name="content" value={content} onChange={(name, value) => onChange(name, value ?? "")} required={content_required} error={contentError} />
    </Box>
  );
};

export default CoverContentEditor;
