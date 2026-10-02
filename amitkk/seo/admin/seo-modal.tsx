import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { Textarea } from '@amitkk/components/basic/textarea';
import { useFormHandler } from 'hooks/useFormHandler';
import { useFilterContext } from 'contexts/FilterContext';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const { filters } = useFilterContext?.() || { filters: {} };

  const initialFormData = {
    _id: '',
    title: '',
    description: '',
    url: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [formData, setFormData] = React.useState(initialFormData);
  const handleChange = useFormHandler(setFormData);
  
  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `basic/meta?function=get_single_meta&id=${selectedDataId}`);

          setFormData({
            _id: res?.data?._id || '',
            url: res?.data?.url || '',
            title: res?.data?.title || '',
            description: res?.data?.description || '',
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
          });
        } catch (error) { clo(error); }
      };
      fetchData();
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_meta");
      formDataToSend.append("_id", selectedDataId as string);
      formDataToSend.append("url", formData.url);
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);

      const res = await apiRequest("POST", `basic/meta`, formDataToSend);

      if (res?.data) {
        setFormData(initialFormData);
        await handleUpdate();
        hitToastr('success', res?.message);
      }
    } catch (error) { clo(error); }
  };

  const title = selectedDataId ? 'Update Meta' : 'Add Meta';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label='URL' value={formData.url} name='url' onChange={handleChange} required/>
        <TextField label='Title' value={formData.title} name='title' onChange={handleChange} required/>
        <Textarea label="Description" value={formData.description} name='description' onChange={handleChange} required rows={4} />
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}