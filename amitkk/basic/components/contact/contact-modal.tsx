import * as React from 'react';
import Box from '@mui/material/Box';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { DataProps } from "@amitkk/basic/components/contact/admin-contact-table";
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/utils';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { FormControl, InputLabel, MenuItem } from '@mui/material';

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    function : 'create_update_contact',
    name: '',
    email: '',
    phone: '',
    status: '',
    user_remarks: '',
    admin_remarks: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    _id: '',
    selectedDataId,
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
  
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("get", `basic/basic?function=get_single_contact&id=${selectedDataId}`);
  
          setFormData({
            function: 'create_update_contact',
            name: res?.data?.name || "",
            email: res?.data?.email || "",
            phone: res?.data?.phone || "",
            user_remarks: res?.data?.user_remarks || "",
            admin_remarks: res?.data?.admin_remarks || "",
            status: res?.data?.status ?? '',
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
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

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_contact");
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email ?? "");
      formDataToSend.append("phone", formData.phone ?? "");
      formDataToSend.append("user_remarks", formData.user_remarks ?? "");
      formDataToSend.append("admin_remarks", formData.admin_remarks ?? "");
      formDataToSend.append("status", formData.status);
      formDataToSend.append("_id", selectedDataId as string);

      const res = await apiRequest("post", `basic/basic`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Contact' : 'Update Contact';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} style={{ maxHeight: "90vh", overflowY: "auto" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
          <TextField label="Name" variant="outlined" value={formData.name} name="name" fullWidth onChange={handleChange} required/>
          <TextField label="Email" variant="outlined" value={formData.email} name="email" fullWidth onChange={handleChange} required/>
          <TextField label="Phone" variant="outlined" value={formData.phone} name="phone" fullWidth onChange={handleChange} required/>
          <FormControl sx={{ width: "100%" }}>
            <InputLabel id="status-label">Status <span style={{ color: "red" }}>*</span></InputLabel>
            <Select labelId="status-label" id="status" name="status" value={formData.status} onChange={handleChange}>
              <MenuItem value="Requested">Requested</MenuItem>
              <MenuItem value="Closed">Closed</MenuItem>
              <MenuItem value="Postponed">Postponed</MenuItem>
              <MenuItem value="Fake">Fake</MenuItem>
            </Select>
          </FormControl>
          <TextField label="User Remarks" variant="outlined" value={formData.user_remarks} name="user_remarks" fullWidth onChange={handleChange} required multiline rows={2}/>
          <TextField label="Admin Remarks" variant="outlined" value={formData.admin_remarks} name="admin_remarks" fullWidth onChange={handleChange} multiline rows={2}/>
          <Button type="submit" variant="contained" color="primary">{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}