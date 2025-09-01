import * as React from 'react';
import Box from '@mui/material/Box';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import type {DataProps} from '@amitkk/product/admin/admin-document-table';
import { useEffect, useState } from 'react';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/utils';
import CkEditor from '@amitkk/basic/components/static/ckeditor-input';
import ImageUpload from '@amitkk/basic/components/static/file-input';
import StatusSelect from '@amitkk/basic/components/static/status-input';
import MediaImage from '@amitkk/basic/components/static/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { MediaProps, OptionProps } from '@amitkk/basic/types/page';
import GenericSelect from '@amitkk/basic/components/static/generic-select';
import { FormControl, InputLabel, MenuItem, FormHelperText } from '@mui/material';
import { error } from 'console';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    function : 'create_update_document',
    user_id: '',
    name: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    media_id: '',
    _id: '',
    selectedDataId,
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);
  const [vendorOptions, setVendorOptions] = useState<OptionProps[]>([]);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };  

  const [media_id, setMedia_id] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: name === "status" ? value === "true" : value }));
  };

  const initData = React.useCallback(async () => {
      try {
          const res_1 = await apiRequest("get", `product/basic?function=get_user_by_role&role=Vendor`);
          setVendorOptions(res_1?.data ?? []);
      } catch (error) { clo( error ); }
    }, []);
  
    useEffect(() => { initData(); }, [initData]);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("get", `product/basic?function=get_single_document&id=${selectedDataId}`);
  
          setFormData({
            function: 'create_update_document',
            name: res?.data?.name || "",
            user_id: res?.data?.user_id?._id || "",
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
            media_id: res?.data?.media_id || null,
            _id: res?.data?._id || "",
            selectedDataId: res?.data?._id || "",
          });
        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedData: DataProps = {...formData, updatedAt: new Date(), _id: selectedDataId as string};
    setImageError(!image && !selectedDataId ? "Image is required." : null);
    if (!selectedDataId && !image) { hitToastr("error", "Image is required."); return; }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_document");
      formDataToSend.append("user_id", formData.user_id as string);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("path", "vendor");

      const mediaIdToSend = formData.media_id && typeof formData.media_id === "object" && "_id" in formData.media_id 
        ? String((formData.media_id as MediaProps)._id) : typeof formData.media_id === "string" && formData.media_id !== "null" ? formData.media_id : "";
      formDataToSend.append("media_id", mediaIdToSend);

      formDataToSend.append("_id", selectedDataId as string);
      if (image) { formDataToSend.append("image", image); }

      const res = await apiRequest("post", `product/basic`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        setImage(null);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Document' : 'Update Document';
  const nameOptions = [ 'Pan Card', 'Aadhar Card', "GST Certificate", "Shop Licennce" ]

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
          <GenericSelect label="Vendor" name="user_id" value={formData.user_id?.toString() ?? ""} options={vendorOptions} onChange={(val) => setFormData({ ...formData, user_id: val as string })}/>
          <FormControl sx={{ width: "100%" }}>
            <InputLabel id="name-label">Document Name <span style={{ color: "red" }}>*</span></InputLabel>
            <Select labelId={`name-label`} id="name" value={formData.name} name="name" onChange={handleChange}>
                {nameOptions.length > 0 ? (
                  nameOptions.map((i) => ( <MenuItem key={i} value={i}>{i}</MenuItem> ))
                ) : ( <MenuItem disabled>No Option available</MenuItem> )}
              </Select>
          </FormControl>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MediaImage media={formData.media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
            <ImageUpload name="image" label="Upload Image" required={!selectedDataId} error={imageError} onChange={(name, file) => { setImage(file); }}/>
          </div>
          <Button type="submit" variant="contained" color="primary">{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}