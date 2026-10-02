import * as React from 'react';
import { apiRequest, clo, hitToastr, ModuleData, TableDataFormProps } from "@amitkk/basic/utils/my-utils/admin-utils";
import RichTextEditor from '@amitkk/components/admin/ckeditor-input';
import StatusDisplay from '@amitkk/components/admin/status-display-input';
import CustomModal from '@amitkk/basic/static/CustomModal';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { SingleTestimonialProps } from '@amitkk/basic/types';
import { useFormHandler } from 'hooks/useFormHandler';
import { extractMediaId } from '@amitkk/basic/utils/my-utils/shared-utils';
import { MediaProps } from '@amitkk/basic/types/media';
import SingleClientDropdown from '@amitkk/basic/admin/client/SingleClientDropdown';
import ModuleSelector from '@amitkk/components/admin/ModuleSelector';
import MediaImage from '@amitkk/components/admin/table-image';
import ImageUpload from '@amitkk/components/admin/file-input';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
  module:string;
  module_id:string;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate, module, module_id }: DataFormProps) {
  const [image, setImage] = React.useState<File | null>(null);

  const initialFormData: SingleTestimonialProps = {
    _id: '',
    module: module,
    module_id: module_id,
    client_id: '',
    media_id: '',
    content: '',
    displayOrder: null,
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const [formData, setFormData] = React.useState<SingleTestimonialProps>(initialFormData);
  const handleChange = useFormHandler(setFormData);

  const handleModuleChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "module") { updated.module_id = ""; }
      return updated;
    });
  };

  React.useEffect(() => {
      if (module || module_id) {
        setFormData((prev) => ({ ...prev, module: module || "", module_id: module_id || "" }));
      }
    }, [module, module_id]);
    
  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("POST", `basic/page`, {
            function: "get_single_testimonial",
            id: selectedDataId
          });

          setFormData({
            _id: res?.data?._id || '',
            module: res?.data?.module || '',
            module_id: res?.data?.module_id?._id || '',
            media_id: res?.data?.media_id || null,
            content: res?.data?.content || '',
            client_id: res?.data?.client_id?._id,
            displayOrder: res?.data?.displayOrder || '',
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
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_testimonial");
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("displayOrder", formData.displayOrder?.toString() || "0");
      formDataToSend.append("module", formData.module);
      formDataToSend.append("module_id", formData.module_id);
      formDataToSend.append("client_id", formData.client_id as string);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("path", "testimonial");
      const mediaId = extractMediaId(formData.media_id);
      if (mediaId) { formDataToSend.append("media_id", mediaId); }

      formDataToSend.append("_id", selectedDataId as string);
      if (image) { formDataToSend.append("image", image); }

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

  const title = !selectedDataId ? 'Add Testimonial' : 'Update Testimonial';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ModuleSelector formData={formData} onFieldChange={handleModuleChange}/>
          <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={(value) => setFormData((prev) => ({...prev, status: value}))} onDisplayOrderChange={(value) => setFormData((prev) => ({...prev, displayOrder: value}))}/>
          <SingleClientDropdown value={formData.client_id as string} onChange={(value) => setFormData((prev) => ({...prev, client_id: value}))} required={true}/>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MediaImage media={formData.media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
            <ImageUpload name="image" label="Upload Image" required={!selectedDataId} onChange={(name, file) => { setImage(file); }}/>
          </div>
          <RichTextEditor label="Testimonial" name="content" value={formData.content} onChange={handleEditorChange} required />
          <StickyFormFooter title={title}/>
        </form>
    </CustomModal>
  );
}
