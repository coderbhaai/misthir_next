import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import { useState } from 'react';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import type { MediaProps, SingleMediaProps } from '@amitkk/basic/types/media';
import { extractMediaId } from '@amitkk/basic/utils/my-utils/shared-utils';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { useFormHandler } from 'hooks/useFormHandler';
import MediaImage from '@amitkk/components/admin/table-image';
import ImageUpload from '@amitkk/components/admin/file-input';

type DataFormProps = TableDataFormProps & {
  handleUpdate: (updated: any) => void;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: SingleMediaProps = {
    alt: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    _id: '',
    user_id: '',
    media: '',
    media_id: ''
  };
  const [formData, setFormData] = React.useState<SingleMediaProps>(initialFormData);
  
  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  const [image, setImage] = useState<File | null>(null);
  
  const handleChange = useFormHandler(setFormData);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("POST", `basic/media`, {
                                  function: 'get_single_media',
                                  id :selectedDataId
                              });  
          setFormData({
            alt: res?.data?.alt || "",
            _id: res?.data?._id || "",
            user_id: res?.data?.user_id?._id || "",
            media: res?.data,
            media_id: res?.data?._id,
            updatedAt: res?.data?.updatedAt || new Date(),
            createdAt: res?.data?.createdAt || new Date(),
          });


        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [open, selectedDataId]);

  const handleMediaModalSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.stopPropagation();
    event.preventDefault();
    const updatedData: SingleMediaProps = {...formData, updatedAt: new Date(), _id: selectedDataId as string};

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_media");
      formDataToSend.append("alt", formData.alt);
      formDataToSend.append("path", "uploads");
      if( formData.user_id ){ formDataToSend.append("user_id", String(formData.user_id)); 
      }

      const mediaId = extractMediaId(formData.media_id);
      if (mediaId) { formDataToSend.append("media_id", mediaId); }
      if (formData._id){ formDataToSend.append("_id", String(formData._id)); }
      if (image) { formDataToSend.append("image", image); }
  
      const res = await apiRequest("POST", `basic/media`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        handleUpdate(res.data);
        setImage(null);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Media' : 'Update Media';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleMediaModalSubmit} className="space-y-4">
        <TextField label="Media Alt" value={formData.alt} name="alt" onChange={handleChange} required/>
        
        <div style={{ display: "flex", alignItems: "center", gap: "10px", gridColumn: "span 1" }}>
            <MediaImage media={formData.media as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
            <ImageUpload name="image" required onChange={(name, file) => { setImage(file); }}/>
        </div>
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}