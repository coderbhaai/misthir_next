"use client";

import { Typography } from "@mui/material";
import { Editor } from "@tinymce/tinymce-react";

interface CkEditorProps {
  name: string;
  value?: string;
  required?: boolean;
  error?: string | null;
  onChange: (name: string, value: string) => void;
}

const CkEditor: React.FC<CkEditorProps> = ({ name, value, error, onChange }) => {
  return (
    <div className="w-full">
      {error && <Typography color="error" variant="caption">{error}</Typography>}
      <Editor
        apiKey="j351fapr77gabh0a6m4jirkdoog77h2hafpxext02zwk590q"
        initialValue={value || ""}
        init={{
          height: 400,
          menubar: true,
          plugins:
            "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount",
          toolbar:
            "undo redo | formatselect | bold italic blockquote | alignleft aligncenter alignright alignjustify | " +
            "bullist numlist outdent indent | link image media table | " +
            "removeformat | help",
          content_style: "body { font-family:Arial, sans-serif; font-size:14px }",
        }}
        onEditorChange={(content) => onChange(name, content)}
      />
    </div>
  );
};

export default CkEditor;