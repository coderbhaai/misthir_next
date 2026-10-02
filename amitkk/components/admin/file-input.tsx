"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@amitkk/components/button/button";

interface ImageUploadProps {
  name: string;
  label?: string;
  required?: boolean;
  error?: string | null;
  onChange: (
    name: string,
    file: File | null
  ) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({name, label, required = false, error, onChange}) => {
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
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-medium">{label} {required && ( <span className="ml-1 text-red-500">*</span> )}</label>
      )}

      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id={name} name={name}/>

      <label htmlFor={name}>
        <Button type="button" variant="outline" asChild>
          <span><UploadCloud className="mr-2 h-4 w-4" />Upload Image</span>
        </Button>
      </label>

      {preview && ( <img src={preview} alt="Preview" className="h-[100px] w-[100px] rounded-md border object-cover"/> )}

      {error && ( <p className="text-sm text-red-500">{error}</p> )}
    </div>
  );
};

export default ImageUpload;