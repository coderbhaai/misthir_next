"use client";

import { Textarea } from "@amitkk/components/basic/textarea";
import React from "react";

interface MetaInputProps {
  title: string;
  description: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => void;
  // Added optional layout modifier prop
  fullWidth?: boolean;
}

const MetaInput: React.FC<MetaInputProps> = ({ title, description, onChange, fullWidth = false }) => {
  return (
    <div className="my-5 row">
      <div className={fullWidth ? "col-span-12 mb-5" : "col-span-12 md:col-span-4"}>
        <Textarea label="Meta Title" name="title" value={title} required onChange={onChange}/>
      </div>
      <div className={fullWidth ? "col-span-12" : "col-span-12 md:col-span-8"}>
        <Textarea label="Meta Description" name="description" value={description} required onChange={onChange}/>
      </div>
    </div>
  );
};

export default MetaInput;