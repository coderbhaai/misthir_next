import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import StatusSelect from '@amitkk/components/admin/status-input';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { Textarea } from '@amitkk/components/basic/textarea';
import { SingleCommentProps } from '@amitkk/basic/types/shared';
import { useFormHandler } from 'hooks/useFormHandler';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: SingleCommentProps = {
    module: '',
    module_id: '',
    name: '',
    email: '',
    content: '',
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _id: '',
  };
  const [formData, setFormData] = React.useState<SingleCommentProps>(initialFormData);
  
  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  const handleChange = useFormHandler(setFormData);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `/basic/comment?function=get_single_comment&id=${selectedDataId}`);

          setFormData({
            _id: res?.data?._id || '',
            module: res?.data?.module || '',
            module_id: res?.data?.module_id || '',
            name: res?.data?.name || '',
            email: res?.data?.email || '',
            content: res?.data?.content || '',
            status: res?.data?.status ?? true,
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
          });

        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedData: SingleCommentProps = {...formData, updatedAt: new Date(), _id: selectedDataId as string};

    try {
      // function: 'update_comment',
      const res = await apiRequest("POST", `/basic/comment`, updatedData);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Comment' : 'Update Comment';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <TextField label='Name' value={formData.name} name='name' onChange={handleChange} required/>
          <TextField label='Email' value={formData.email} name='email' onChange={handleChange} required/>
          <StatusSelect value={formData.status} onChange={(value) => handleChange("status", value)}/>
          <Textarea value={formData.content} rows={4} name='content' onChange={handleChange} required/>
          <StickyFormFooter title={title}/>
        </div>
      </form>
    </CustomModal>
  );
}
