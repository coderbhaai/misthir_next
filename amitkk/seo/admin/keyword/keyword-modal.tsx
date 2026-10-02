"use client";

import * as React from 'react';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { KeywordFormItem } from '@amitkk/seo/types/keyword';
import { Checkbox } from '@amitkk/components/basic/checkbox';
import { Button } from '@amitkk/components/button/button';
import { TextField } from '@amitkk/components/basic/TextField';
import ModuleSelector from '@amitkk/components/admin/ModuleSelector';

type DataProps = {
  module: string;
  module_id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type DataFormProps = TableDataFormProps & DataProps & {
  onUpdate: () => void;
};

export default function KeywordModal({ open, handleClose, onUpdate, module: initialModule, module_id: initialModuleId }: DataFormProps) {
  const [formData, setFormData] = React.useState({
    module: initialModule || "",
    module_id: initialModuleId || "",
  });

  React.useEffect(() => {
    setFormData({ module: initialModule || "", module_id: initialModuleId || "" });
  }, [initialModule, initialModuleId]);

  const handleModuleChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "module") { updated.module_id = ""; }
      return updated;
    });
  };

  const [keywords, setKeywords] = React.useState<KeywordFormItem[]>([]);

  React.useEffect(() => {
    if (!open || !formData.module || !formData.module_id) return;

    const fetchKeywords = async () => {
      try {
        const res = await apiRequest("POST", `/basic/keyword`, {
          function: "get_single_keyword",
          module: formData.module,
          module_id: formData.module_id
        });
        setKeywords(res?.data || []);
      } catch (e) { clo(e); }
    };
    fetchKeywords();
  }, [open, formData.module, formData.module_id]);
  
  const addRow = () => { setKeywords(prev => [ ...prev, { keyword: "", primary: prev.length === 0 } ]); };
  const removeRow = (index: number) => { setKeywords(prev => prev.filter((_, i) => i !== index)); };
  const updateRow = (index: number, key: keyof KeywordFormItem, value: any) => {
    setKeywords(prev =>
      prev.map((item, i) => {
        if (i !== index) { return key === "primary" && value ? { ...item, primary: false } : item; }
        return { ...item, [key]: value };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.module || !formData.module_id) {
      hitToastr('error', 'Please select both Module Category and Name.');
      return;
    }

    try {
      const res = await apiRequest("POST", `basic/keyword`, {
        function: 'create_update_keyword',
        module: formData.module,
        module_id: formData.module_id,
        keywords: JSON.stringify(keywords),
      });

      if (res?.data) {
        onUpdate();
        hitToastr('success', res?.message);
      }
    } catch (error) { clo(error); }
  };

  const title = 'Add / Update Keyword';

  return (
    <CustomModal open={open} handleClose={handleClose} title={title}>
      <form onSubmit={handleSubmit} className="p-1">
        <ModuleSelector formData={formData} onFieldChange={handleModuleChange}/>

        <div className="border-t pt-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Keywords Assignment</h3>
          
          {keywords.map((item, index) => (
            <div key={index} className="flex items-center gap-2 my-3">
              <Checkbox checked={item.primary} onCheckedChange={(v) => updateRow(index, "primary", Boolean(v))}/>
              <TextField value={item.keyword} onChange={(e) => updateRow(index, "keyword", e.target.value)} placeholder="Keyword" className="flex-1"/>
              <img src="/images/icons/static/delete.svg" onClick={() => removeRow(index)} className="w-5 h-5 cursor-pointer"/>
            </div>
          ))}
          
          <Button onClick={addRow} type="button" className="my-5">Add Keyword</Button>
        </div>
        
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}