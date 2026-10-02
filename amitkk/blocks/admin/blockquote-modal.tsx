import * as React from 'react';
import { DataProps } from "@amitkk/blocks/admin/admin-blockquote-table";
import { useState } from 'react';
import { apiRequest, clo, fetchModuleData, hitToastr, ModuleData, TableDataFormProps } from "@amitkk/basic/utils/my-utils/admin-utils";
import RichTextEditor from '@amitkk/components/admin/ckeditor-input';
import ImageUpload from '@amitkk/components/admin/file-input';
import StatusSelect from '@amitkk/components/admin/status-input';
import MediaImage from '@amitkk/components/admin/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import type { MediaProps } from '@amitkk/basic/types/media';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { extractMediaId } from '@amitkk/basic/utils/my-utils/shared-utils';
import { TextField } from '@amitkk/components/basic/TextField';
import { useFormHandler, useSetForm } from 'hooks/useFormHandler';
import ModuleSelector from '@amitkk/components/admin/ModuleSelector';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    _id: '',
    module: '',
    module_id: '',
    heading: '',
    content: '',
    bg_colour: '',
    status: true,
    displayOrder: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    media_id: '',
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);
  const handleChange = useFormHandler(setFormData);
  const setValue = useSetForm(setFormData);
  const handleModuleChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "module") { updated.module_id = ""; }
      return updated;
    });
  };

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };  

  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const handleEditorChange = (name: string, value: string) => {
    setContent(value);
  };

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `block/blockquote?function=get_single_blockquote&id=${selectedDataId}`);
  
          setFormData({
            _id: res?.data?._id || "",
            module: res?.data?.module || "",
            module_id: res?.data?.module_id?._id || "",
            heading: res?.data?.heading || "",
            content: res?.data?.content || "",
            bg_colour: res?.data?.bg_colour || "",
            status: res?.data?.status ?? true,
            displayOrder: res?.data?.displayOrder || "",
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
      formDataToSend.append("function", "create_update_blockquote");
      formDataToSend.append("module", formData.module);
      formDataToSend.append("module_id", formData.module_id as string);
      formDataToSend.append("heading", formData.heading || '');
      formDataToSend.append("bg_colour", formData.bg_colour || '');
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("displayOrder", formData.displayOrder?.toString() || "0");
      formDataToSend.append("content", content);
      formDataToSend.append("path", "block");

      const mediaId = extractMediaId(formData.media_id);
      if (mediaId) { formDataToSend.append("media_id", mediaId); }

      formDataToSend.append("_id", selectedDataId as string);
      if (image) { formDataToSend.append("image", image); }

      const res = await apiRequest("POST", `block/blockquote`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        setImage(null);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add BlockQuote' : 'Update BlockQuote';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <ModuleSelector formData={formData} onFieldChange={handleModuleChange}/>
        <TextField label="Heading" value={formData.heading} name="heading" onChange={handleChange}/>
        <TextField label="BG Colour" value={formData.bg_colour} name="bg_colour" onChange={handleChange}/>
        <StatusSelect value={formData.status} onChange={(value) => setValue("status", value)}/>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <MediaImage media={formData.media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
          <ImageUpload name="image" label="Upload Image" required={!selectedDataId} onChange={(name, file) => { setImage(file); }}/>
        </div>
        <RichTextEditor label="Content" name="content" value={formData.content} onChange={handleEditorChange} required={!selectedDataId} />
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}