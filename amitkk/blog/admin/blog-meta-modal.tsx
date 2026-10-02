import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import type {DataProps} from './admin-blog-meta-table';
import StatusSelect from '@amitkk/components/admin/status-input';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { useFormHandler, useSetForm } from 'hooks/useFormHandler';
import OpenSelect from '@amitkk/components/basic/OpenSelect';
import MetaInput from '@amitkk/components/admin/meta-input';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    _id: '',
    type: '',
    name: '',
    url: '',
    status: true,
    displayOrder: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    meta_id: '', title: '', description: '',
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);
  const handleChange = useFormHandler(setFormData);
  const setValue = useSetForm(setFormData);
  
  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `blog/blogmeta?function=get_single_blog_meta&id=${selectedDataId}`);

          setFormData({
            _id: res?.data?._id || '',
            type: res?.data?.type || '',
            name: res?.data?.name || '',
            url: res?.data?.url || '',
            status: res?.data?.status ?? true,
            displayOrder: res?.data?.displayOrder ?? null,
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
            meta_id: res?.data?.meta_id?._id,
            title: res?.data?.meta_id?.title || '',
            description: res?.data?.meta_id?.description || '',
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
      formDataToSend.append("function", "create_update_blog_meta");
      formDataToSend.append("_id", selectedDataId as string);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("url", formData.url);
      formDataToSend.append("displayOrder", String(formData.displayOrder));
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("meta_id", formData.meta_id as string || "");
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);

      const res = await apiRequest("POST", `blog/blogmeta`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Blog Meta' : 'Update Blog Meta';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <OpenSelect<boolean | string> name="type" label="Type" value={formData.type} onChange={(value) => setValue("type", String(value))} options={[ { label: "Select Type", value: "" }, { label: "Category", value: "category" }, { label: "Tag", value: "tag" } ]}/>
        <TextField label='Name' value={formData.name} name='name' onChange={handleChange} required/>
        <TextField label='URL' value={formData.url} name='url' onChange={handleChange} required/>
        <StatusSelect value={formData.status} onChange={(value) => setValue("status", value)}/>
        <MetaInput title={formData.title} description={formData.description} onChange={handleChange} fullWidth={true}/>
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}
