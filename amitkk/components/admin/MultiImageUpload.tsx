"use client";

import React, {useState} from "react";
import { Upload } from "lucide-react";
import { Button } from "@amitkk/components/button/button";

type MultiImageUploadProps = {
  name: string;
  label?: string;
  required?: boolean;
  onChange: (
    name: string,
    files: File[]
  ) => void;
};

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({name, label = "Upload Images", required = false, onChange}) => {
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const previewUrls = files.map((file) => URL.createObjectURL(file));

    setPreviews(previewUrls);
    onChange(name, files);
  };

  return (
    <div>
      <input hidden multiple accept="image/*" id={name} name={name} type="file" required={required} onChange={handleFileChange}/>
      <label htmlFor={name}>
        <Button type="button" variant="outline" asChild>
          <span><Upload className="h-4 w-4 mr-2"/>{label}</span>
        </Button>
      </label>

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {previews.map(
            (src, index) => (
              <img key={index} src={src} alt={`preview-${index}`} className="w-[60px] h-[60px] object-cover rounded-md border"/>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default MultiImageUpload;