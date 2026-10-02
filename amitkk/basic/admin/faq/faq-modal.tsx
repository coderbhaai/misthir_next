import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import { DataProps } from "@amitkk/basic/admin/faq/admin-faq-table";
import StatusDisplay from '@amitkk/components/admin/status-display-input';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { useFormHandler } from 'hooks/useFormHandler';
import ModuleSelector from '@amitkk/components/admin/ModuleSelector';
import RichTextEditor from '@amitkk/components/admin/ckeditor-input';

type DataFormProps = TableDataFormProps & {
  module:string;
  module_id:string;
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate, module, module_id }: DataFormProps) {
  const initialFormData: DataProps = {
    _id: '',
    module: module,
    module_id: module_id,
    question: '',
    answer: '',
    status: true,
    displayOrder:0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  React.useEffect(() => {
    if (module || module_id) {
      setFormData((prev) => ({ ...prev, module: module || "", module_id: module_id || "" }));
    }
  }, [module, module_id]);

  const handleModuleChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "module") { 
        updated.module_id = "";
      }
      return updated;
    });
  };
  
  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  const handleChange = useFormHandler(setFormData);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("POST", `basic/page`, {
                      function: "get_single_faq",
                      id: selectedDataId
                    });

          setFormData({
            module: res?.data?.module || '',
            module_id: res?.data?.module_id?._id || '',
            question: res?.data?.question || '',
            answer: res?.data?.answer || '',
            status: res?.data?.status ?? true,
            displayOrder: res?.data?.displayOrder ?? 0,
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
            _id: res?.data?._id || '',
          });

        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_faq");
      if (selectedDataId) { formDataToSend.append("_id", selectedDataId as string); }
      formDataToSend.append("module", formData.module);
      formDataToSend.append("module_id", formData.module_id);
      formDataToSend.append("question", formData.question);
      formDataToSend.append("answer", formData.answer);
      formDataToSend.append("displayOrder", String(formData.displayOrder));

      const res = await apiRequest("POST", `basic/page`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const handleEditorChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const title = !selectedDataId ? 'Add FAQ' : 'Update FAQ';
  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ModuleSelector formData={formData} onFieldChange={handleModuleChange}/>
          <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={(value) => setFormData((prev) => ({...prev, status: value}))} onDisplayOrderChange={(value) => setFormData((prev) => ({...prev, displayOrder: value}))}/>
          <TextField label='Question' value={formData.question} name='question' onChange={handleChange} required/>
          <RichTextEditor label="Answer" name="answer" value={formData.answer} onChange={handleEditorChange} required/>
          <StickyFormFooter title={title}/>
        </form>
    </CustomModal>
  );
}
