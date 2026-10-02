import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import type {DataProps} from '@amitkk/basic/admin/client/admin-client-table';
import { useState } from 'react';
import { apiRequest, clo, hitToastr, TableDataFormProps } from "@amitkk/basic/utils/my-utils/admin-utils";
import RichTextEditor from '@amitkk/components/admin/ckeditor-input';
import ImageUpload from '@amitkk/components/admin/file-input';
import MediaImage from '@amitkk/components/admin/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import type { MediaProps } from '@amitkk/basic/types/media';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { extractMediaId } from '@amitkk/basic/utils/my-utils/shared-utils';
import { useFormHandler } from 'hooks/useFormHandler';
import StatusDisplay from '@amitkk/components/admin/status-display-input';
import OpenSelect from '@amitkk/components/basic/OpenSelect';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    _id: '',
    name: '',
    email: '',
    phone: '',
    brand: '',
    role: '',
    status: true,
    content: '',
    displayOrder: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    media_id: '',
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };  

  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const handleEditorChange = (name: string, value: string) => {
    setContent(value);
  };
  
  const handleChange = useFormHandler(setFormData);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `basic/basic?function=get_single_client&id=${selectedDataId}`);
  
          setFormData({
            _id: res?.data?._id || "",
            name: res?.data?.name || "",
            email: res?.data?.email || "",
            phone: res?.data?.phone || "",
            brand: res?.data?.brand || "",
            role: res?.data?.role || "",
            content: res?.data?.content || "",
            status: res?.data?.status ?? true,
            displayOrder: res?.data?.displayOrder ?? '',
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

    if (!selectedDataId && !image) { hitToastr("error", "Image is required."); return; }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_client");
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email ?? "");
      formDataToSend.append("phone", formData.phone ?? "");
      formDataToSend.append("brand", formData.brand ?? "");
      formDataToSend.append("role", formData.role);
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("content", content);
      formDataToSend.append("path", "client");

      const mediaId = extractMediaId(formData.media_id);
      if (mediaId) { formDataToSend.append("media_id", mediaId); }

      formDataToSend.append("_id", selectedDataId as string);
      if (image) { formDataToSend.append("image", image); }

      const res = await apiRequest("POST", `basic/basic`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        setImage(null);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Client' : 'Update Client';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label="Client Name" value={formData.name} name="name" onChange={handleChange} required/>
        <TextField label="Client Email" value={formData.email} name="email" onChange={handleChange}/>
        <TextField label="Client Phone" value={formData.phone} name="phone" onChange={handleChange}/>
        <TextField label="Brand" value={formData.brand} name="brand" onChange={handleChange}/>
        <OpenSelect name={String(formData.role)} label="Role" value={formData.role} onChange={(value) => setFormData((prev) => ({...prev, role: value}))}
        options={[ 
          { label: "All Roles", value: "" },
          { label: "Owner", value: "Owner" },
          { label: "Founder", value: "Founder" },
          { label: "Co-Founder", value: "Co-Founder" },
          { label: "Manager", value: "Manager" },
          { label: "IT HEad", value: "IT HEad" },
        ]}/>
        <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={(value) => setFormData((prev) => ({...prev, status: value}))} onDisplayOrderChange={(value) => setFormData((prev) => ({...prev, displayOrder: value}))}/>
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