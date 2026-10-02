import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import { useState } from 'react';
import { apiRequest, clo, hitToastr, TableDataFormProps } from "@amitkk/basic/utils/my-utils/admin-utils";
import RichTextEditor from '@amitkk/components/admin/ckeditor-input';
import ImageUpload from '@amitkk/components/admin/file-input';
import StatusSelect from '@amitkk/components/admin/status-input';
import MediaImage from '@amitkk/components/admin/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { extractMediaId } from '@amitkk/basic/utils/my-utils/shared-utils';
import { useFormHandler, useSetForm } from 'hooks/useFormHandler';
import type { SingleAuthorProps } from '../types';
import type { MediaProps } from '@amitkk/basic/types/media';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: SingleAuthorProps = {
    _id: '',
    name: '',
    status: true,
    content: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    media_id: '',
  };
  const [formData, setFormData] = React.useState<SingleAuthorProps>(initialFormData);

  const handleChange = useFormHandler(setFormData);
  const setValue = useSetForm(setFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };  

  const [content, setContent] = useState("");
  const handleEditorChange = (name: string, value: string) => { setContent(value); };
  const [image, setImage] = useState<File | null>(null);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `blog/author?function=get_single_author&id=${selectedDataId}`);
  
          setFormData({
            _id: res?.data?._id || "",
            name: res?.data?.name || "",
            content: res?.data?.content || "",
            status: res?.data?.status ?? true,
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
            media_id: res?.data?.media_id || null,
          });

          setContent(res?.data?.content || ""); 
        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_author");
      formDataToSend.append("name", formData.name);
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("content", content);
      formDataToSend.append("path", "author");
      const mediaId = extractMediaId(formData.media_id);
      if (mediaId) { formDataToSend.append("media_id", mediaId); }

      formDataToSend.append("_id", selectedDataId as string);
      if (image) { formDataToSend.append("image", image); }

      const res = await apiRequest("POST", `blog/author`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        setImage(null);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Author' : 'Update Author';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label="Author Name" value={formData.name} name="name" onChange={handleChange} required/>
        <StatusSelect value={formData.status} onChange={(value) => setValue("status", value)}/>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <MediaImage media={formData.media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
          <ImageUpload name="image" label="Upload Image" required={!selectedDataId} onChange={(name, file) => { setImage(file); }}/>
        </div>
        <RichTextEditor label="Author Bio" name="content" value={content} onChange={handleEditorChange} required={!selectedDataId} />
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}