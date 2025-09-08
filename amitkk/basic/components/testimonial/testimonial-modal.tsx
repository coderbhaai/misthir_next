import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type {DataProps} from './admin-testimonial-table';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/utils';
import CkEditor from '@amitkk/basic/components/static/ckeditor-input';
import ImageUpload from '@amitkk/basic/components/static/file-input';
import StatusDisplay from '@amitkk/basic/components/static/status-display-input';
import MediaImage from '@amitkk/basic/components/static/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { MediaProps } from '@amitkk/basic/types/page';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
  module:string;
  module_id:string;
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate, module, module_id }: DataFormProps) {
  const [module_options, setModuleOptions] = React.useState<{_id: string; name: string}[]>([]);
  const [contentError, setContentError] = React.useState<string | null>(null);
  const [image, setImage] = React.useState<File | null>(null);
  const [imageError, setImageError] = React.useState<string | null>(null); 

  const initialFormData: DataProps = {
    function: "create_update_testimonial",
    module: module,
    module_id: module_id,
    name: '',
    role: '',
    content: '',
    media: '',
    media_id: '',
    displayOrder: 0,
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _id: '',
    selectedDataId: '',
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

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
      if (formData.module) {
        const fetchData = async () => {
          try {
            let route = '';
            
            if ( formData.module === "Blog") {
              route       = `blog/blogs?function=get_blogs_module`;
            }

            if ( formData.module === "Page") {
              route       = `basic/page?function=get_page_module`;
            }

            if ( formData.module === "Product") {
              route       = `product/product?function=get_product_module`;
            }
  
            const res = await apiRequest("get", route);
            setModuleOptions(res?.data ?? []);  
          } catch (error) { clo( error ); }
        };
        fetchData();
      }
    }, [formData.module]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
  
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "status" ? value === "true" : value,
    }));
  };

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("get", `basic/page?function=get_single_testimonial&id=${selectedDataId}`);

          setFormData({
            function: "create_update_testimonial",
            module: res?.data?.module || '',
            module_id: res?.data?.module_id?._id || '',
            name: res?.data?.name || '',
            role: res?.data?.role || '',
            content: res?.data?.content || '',
            media: res?.data?.media_id,
            media_id: res?.data?.media_id,
            displayOrder: res?.data?.displayOrder || '',
            status: res?.data?.status ?? true,
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
            _id: res?.data?._id || '',
            selectedDataId: res?.data?._id || '',
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
      formDataToSend.append("name", formData.name);
      formDataToSend.append("role", formData.role);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("path", "testimonial");
      const mediaIdToSend = formData.media_id && typeof formData.media_id === "object" && "_id" in formData.media_id 
              ? String((formData.media_id as MediaProps)._id) : typeof formData.media_id === "string" && formData.media_id !== "null" ? formData.media_id : "";
      formDataToSend.append("media_id", mediaIdToSend);

      formDataToSend.append("_id", selectedDataId as string);
      if (image) { formDataToSend.append("image", image); }

      const res = await apiRequest("post", `basic/page`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
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
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
              <FormControl sx={{ width: "100%"}}>
                <InputLabel id="module-label">Module <span style={{ color: "red" }}>*</span></InputLabel>
                <Select labelId="module-label" id="module" name="module" value={formData.module} onChange={handleChange}>
                  <MenuItem value="Blog">Blog</MenuItem>
                  <MenuItem value="Product">Product</MenuItem>
                  <MenuItem value="Page">Page</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ width: "100%"}}>
                <InputLabel id="status-label">Module Name<span style={{ color: "red" }}>*</span></InputLabel>
                <Select labelId="status-label" id="status" name="module_id" value={module_options?.some(opt => opt._id === formData.module_id) ? formData.module_id : ""} onChange={handleChange}>
                  {module_options?.length > 0 && module_options.map(({ _id, name }) => (
                    <MenuItem key={_id} value={_id}>{name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField label='Name' variant='outlined' value={formData.name} name='name' fullWidth onChange={handleChange} required/>
              <TextField label='Role' variant='outlined' value={formData.role} name='role' fullWidth onChange={handleChange} required/>
              <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={handleChange} onDisplayOrderChange={handleChange}/>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", gridColumn: "span 1" }}>
                  <MediaImage media={formData.media as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
                  <ImageUpload name="image" required error={imageError} onChange={(name, file) => { setImage(file); }}/>
              </div>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, width: "100%" }}>
            </Box>
            <CkEditor name="content" value={formData.content} onChange={handleEditorChange} required error={contentError} />
            <Button type='submit' variant='contained' color='primary'>{title}</Button>
          </Box>
        </form>
    </CustomModal>
  );
}
