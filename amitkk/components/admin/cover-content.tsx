"use client";

import { TextField } from "@amitkk/components/basic/TextField";
import ImageUpload from "./file-input";
import MediaImage from "./table-image";
import RichTextEditor from "@amitkk/components/admin/ckeditor-input";
import type { MediaProps } from "@amitkk/basic/types/media";

interface CoverContentEditorProps {
  cover_id: string | MediaProps | null;
  heading: string;
  content: string;
  content_required: boolean;
  coverImageError?: string | null;
  onChange: (name: string, value: any) => void;
}

const CoverContentEditor: React.FC<CoverContentEditorProps> = ({
  cover_id,
  heading,
  content,
  content_required,
  coverImageError,
  onChange,
}) => {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <MediaImage media={cover_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
          <ImageUpload name="cover_image" label="Cover Image" required={content_required} error={coverImageError} onChange={(name, file) => onChange(name, file)}/>
        </div>
      <TextField label="Heading" value={heading} name="heading" onChange={(e) => onChange(e.target.name, e.target.value)}/>
      <RichTextEditor label="Content" name="content" value={content} onChange={(name, value) => onChange(name, value ?? "")} required={content_required} />
    </div>
  );
};

export default CoverContentEditor;
