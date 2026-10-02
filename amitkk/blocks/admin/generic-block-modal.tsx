// DataModal.tsx (Corrected)
import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import { useState } from 'react';
import RichTextEditor from '@amitkk/components/admin/ckeditor-input';
import ImageUpload from '@amitkk/components/admin/file-input';
import MediaImage from '@amitkk/components/admin/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { modules } from '@amitkk/basic/utils/config';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { hitToastr, clo, apiRequest, fetchModuleData, TableDataFormProps } from '@amitkk/basic/utils/my-utils/admin-utils';
import { block_count } from '@amitkk/basic/utils/my-utils/client-utils';
import { extractMediaId } from '@amitkk/basic/utils/my-utils/shared-utils';
import { useFormHandler, useSetForm } from 'hooks/useFormHandler';
import type { OptionProps } from '@amitkk/basic/types/generic';
import type { MediaProps } from '@amitkk/basic/types/media';
import type { SingleGenericBlockProps } from '@amitkk/blocks/types';
import StatusSelect from '@amitkk/components/admin/status-input';
import OpenSelect from '@amitkk/components/basic/OpenSelect';
import GenericSelect from '@amitkk/components/admin/generic-select';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: SingleGenericBlockProps = {
    _id: '',
    module: '',
    module_id: '',
    block_id: 0,
    heading: '',
    url: '',
    status: true,
    displayOrder: null,
    content: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    media_id: '',
    mobile_media_id: '',
  };
  const [formData, setFormData] = React.useState<SingleGenericBlockProps>(initialFormData);
  const handleChange = useFormHandler(setFormData);
  const setValue = useSetForm(setFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    setContent("");
    setImage(null);
    setMobileImage(null);
    handleClose();
  };  

  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [module_options, setModuleOptions] = React.useState<OptionProps[]>([]);

  const handleEditorChange = (name: string, value: string) => {
    setContent(value);
  };

  React.useEffect(() => {
    if (formData.module) {
      const fetchData = async () => {
        try {
          const module_data = await fetchModuleData(formData.module);
          setModuleOptions(module_data);
        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [formData.module]);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `block/genericBlock?function=get_single_generic_block&id=${selectedDataId}`);
 
          setFormData({
            _id: res?.data?._id || "",
            module: res?.data?.module || "",
            module_id: res?.data?.module_id?._id || "",
            block_id: res?.data?.block_id || "",
            heading: res?.data?.heading || "",
            url: res?.data?.url || "",
            content: res?.data?.content || "",
            status: res?.data?.status ?? true,
            displayOrder: res?.data?.displayOrder || "",
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
            media_id: res?.data?.media_id || null,
            mobile_media_id: res?.data?.mobile_media_id || null,
          });

          setContent(res?.data?.content || ""); 
        } catch (error) { clo( error ); }
      };
      fetchData();
    } else if (open && !selectedDataId) {
      setFormData(initialFormData);
      setContent("");
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_generic_block");
      formDataToSend.append("module", formData.module);
      formDataToSend.append("module_id", formData.module_id as string);
      formDataToSend.append("block_id", formData.block_id?.toString() || "0");
      formDataToSend.append("heading", formData.heading || '');
      formDataToSend.append("url", formData.url || '');
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("displayOrder", formData.displayOrder?.toString() || "0");
      formDataToSend.append("content", content);
      formDataToSend.append("path", "block");

      const mediaId = extractMediaId(formData.media_id);
      if (mediaId) { formDataToSend.append("media_id", mediaId); }

      const mobileMediaIdToSend = formData.mobile_media_id && typeof formData.mobile_media_id === "object" && "_id" in formData.mobile_media_id 
        ? String((formData.mobile_media_id as MediaProps)._id) : typeof formData.mobile_media_id === "string" && formData.mobile_media_id !== "null" ? formData.mobile_media_id : "";
      formDataToSend.append("mobile_media_id", mobileMediaIdToSend);

      if (selectedDataId) {
        formDataToSend.append("_id", String(selectedDataId));
      }
      if (image) { formDataToSend.append("image", image); }
      if (mobileImage) { formDataToSend.append("mobileImage", mobileImage); }

      const res = await apiRequest("POST", `block/genericBlock`, formDataToSend);

      if( res?.data ){
        hitToastr('success', res?.message);
        await handleUpdate();
        handleCloseModal();
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Block' : 'Update Block';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <OpenSelect name="block_id" label="Block" value={formData.block_id?.toString() ?? ""} onChange={(value) => setValue("block_id", Number(value))} options={Array.from({ length: block_count }, (_, i) => ({label: `${i + 1}`, value: `${i + 1}` }))}/>
        <OpenSelect name="module" label="Module" value={formData.module} options={modules.map((item) => ({label: item, value: item}))} onChange={(value) => setValue("module", value)}/>
        <GenericSelect label="Select Module" name="module_id" value={formData.module_id?.toString() ?? ""} options={module_options} onChange={(val) => setFormData({ ...formData, module_id: val as string })}/>
        <TextField label="Heading" value={formData.heading} name="heading" onChange={handleChange}/>
        <TextField label="URL" value={formData.url} name="url" onChange={handleChange}/>
        <StatusSelect value={formData.status} onChange={(value) => setValue("status", value)}/>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <MediaImage media={formData.media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
          <ImageUpload name="image" label="Upload Image" required={!selectedDataId} onChange={(name, file) => { setImage(file); }}/>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <MediaImage media={formData.mobile_media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
          <ImageUpload name="mobileImage" label="Upload Mobile Image" required={!selectedDataId} onChange={(name, file) => { setMobileImage(file); }}/>
        </div>
        <RichTextEditor label="Content" name="content" value={formData.content} onChange={handleEditorChange} required={!selectedDataId} />
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}