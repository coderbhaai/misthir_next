"use client";

import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import ModuleSelector from '@amitkk/components/admin/ModuleSelector';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { SingleModuleContentProps } from '@amitkk/basic/types';
import dynamic from 'next/dynamic';
import { useFormHandler } from 'hooks/useFormHandler';
import StatusDisplay from '@amitkk/components/admin/status-display-input';

const RichTextEditor = dynamic(() => import("@amitkk/components/admin/ckeditor-input"), {  
  ssr: false, loading: () => <p>Loading editor...</p>,
});

interface DataProps extends SingleModuleContentProps {
}

type DataFormProps = TableDataFormProps & {
  module: string;
  module_id: string;
  onUpdate: () => void;
};

const EMPTY_FORM_FIELDS = {
  _id: '',
  heading: "",
  content: "",
  status: true,
  displayOrder: null,
};

export default function ContentModal({ open, handleClose, onUpdate, selectedDataId, module: initialModule, module_id: initialModuleId }: DataFormProps) {
  const [isSuccessReset, setIsSuccessReset] = React.useState(false);

  const [formData, setFormData] = React.useState<DataProps>({
    ...EMPTY_FORM_FIELDS,
    module: initialModule || '',
    module_id: initialModuleId || '',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  React.useEffect(() => {
    if (open) {
      setIsSuccessReset(false);

      if (!selectedDataId) {
        setFormData({
          ...EMPTY_FORM_FIELDS,
          module: initialModule || '',
          module_id: initialModuleId || '',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }, [open, selectedDataId, initialModule, initialModuleId]);

  const handleModuleChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "module") { 
        updated.module_id = "";
      }
      return updated;
    });
  };
  
  React.useEffect(() => {
    if (open && selectedDataId && !isSuccessReset) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `basic/keyword?function=get_single_module_content&id=${selectedDataId}`);
          
          if (isSuccessReset) return;

          setFormData({
            _id: res?.data?._id || '',
            module: res?.data?.module || '',
            module_id: res?.data?.module_id || '',
            heading: res?.data?.heading || '',
            content: res?.data?.content || '',
            status: res?.data?.status ?? true,
            displayOrder: res?.data?.displayOrder ?? null,
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
          });
        } catch (error) { clo(error); }
      };
      fetchData();
    }
  }, [open, selectedDataId, isSuccessReset]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      
      if (!formData.module || !formData.module_id) {
        hitToastr('error', 'Please select both Module Category and Name.');
        return;
      }

      try {
          const formDataToSend = new FormData();
          formDataToSend.append("function", "create_update_module_content");
          formDataToSend.append("_id", formData._id);
          formDataToSend.append("module", formData.module);
          formDataToSend.append("module_id", formData.module_id);
          formDataToSend.append("heading", formData.heading);
          formDataToSend.append("status", String(formData.status));
          formDataToSend.append("displayOrder", String(formData.displayOrder ?? ''));
          formDataToSend.append("content", formData.content);
          
          const res = await apiRequest("POST", `basic/keyword`, formDataToSend);

          if (res?.data) {
            setIsSuccessReset(true);
            setFormData({
              ...EMPTY_FORM_FIELDS,
              module: initialModule || '',
              module_id: initialModuleId || '',
              createdAt: new Date(),
              updatedAt: new Date(),
            });

            onUpdate();
            hitToastr('success', res?.message);
            handleClose();
          }
      } catch (error) { clo(error); }
  };

  const handleEditorChange = (name: string, value: string) => { 
    setFormData(prev => ({ ...prev, content: value })); 
  };
  
  const handleChange = useFormHandler(setFormData);

  const title = !selectedDataId ? 'Add Content' : 'Update Content';
  
  return (
    <CustomModal open={open} handleClose={handleClose} title={title}>
      <form onSubmit={handleSubmit} className="p-1 flex flex-col gap-5">
        <ModuleSelector formData={formData} onFieldChange={handleModuleChange}/>
        <TextField label="Heading" value={formData.heading} name="heading" onChange={handleChange} required/>
        <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={(value) => setFormData((prev) => ({...prev, status: value}))} onDisplayOrderChange={(value) => setFormData((prev) => ({...prev, displayOrder: value}))}/>
        <RichTextEditor label="Content" name="content" value={formData.content} onChange={handleEditorChange} required/>
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}