"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Checkbox, ListItemText } from "@mui/material";

import type { DataProps } from "./admin-submenu-table";
import ImageUpload from "@amitkk/basic/components/static/file-input";
import StatusSelect from "@amitkk/basic/components/static/status-input";
import MediaImage from "@amitkk/basic/components/static/table-image";
import CustomModal from "@amitkk/basic/static/CustomModal";
import { TableDataFormProps, apiRequest, clo, hitToastr } from "@amitkk/basic/utils/utils";
import { MediaProps } from "@amitkk/basic/types/page";

type DataFormProps = TableDataFormProps & {
  onUpdate: (updatedData: DataProps) => void;
  menus: { _id: string; name: string }[]; 
  permissions: { _id: string; name: string }[]; 
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate, menus, permissions }: DataFormProps) {
  const initialFormData: DataProps = {
    function: "create_update_submenu",
    name: "",
    url: "",
    media_id: "",
    permission_id: "",
    selectedMenu: [],
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    _id: "",
    selectedDataId,
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    setImage(null);
    handleClose();
  };

  const [selectedMenu, setSelectedMenu] = React.useState<string[]>([]);

  const [image, setImage] = React.useState<File | null>(null);
  const [imageError, setImageError] = React.useState<string | null>(null);

  const handleMenuChange = (event: SelectChangeEvent<string[]>) => {
    const { value } = event.target;
    setFormData((prev) => ({
      ...prev,
      selectedMenu: (typeof value === "string" ? value.split(",") : value).map(String),
    }));
  };

  const handleChange = ( e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "status" ? value === "true" : value,
    }));
  };
  
  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchSingle = async () => {
        try {
          const res = await apiRequest(
            "get",
            `basic/spatie?function=get_single_submenu&id=${selectedDataId}`
          );

          const menuIds = res?.data?.menu_ids?.map(String) ?? [];

          setFormData({
            function: "create_update_submenu",
            name: res?.data?.name || "",
            url: res?.data?.url || "",
            media_id: res?.data?.media_id || "",
            permission_id: res?.data?.permission_id || "",
            selectedMenu: menuIds,
            status: res?.data?.status ?? true,
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
            _id: res?.data?._id || "",
            selectedDataId: res?.data?._id || "",
          });
        } catch (error) { clo(error); }
      };
      fetchSingle();
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_submenu");
      formDataToSend.append("name", formData.name);
      formDataToSend.append("menu", JSON.stringify(formData.selectedMenu ?? []));
      formDataToSend.append("url", formData.url);
      formDataToSend.append("permission_id", formData.permission_id);
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("path", "spatie");

      const mediaIdToSend =
        formData.media_id && typeof formData.media_id === "object" && "_id" in formData.media_id
          ? String((formData.media_id as MediaProps)._id)
          : typeof formData.media_id === "string" && formData.media_id !== "null"
          ? formData.media_id
          : "";
      formDataToSend.append("media_id", mediaIdToSend);

      formDataToSend.append("_id", selectedDataId as string);
      if (image) {
        formDataToSend.append("image", image);
      }

      const res = await apiRequest("post", `basic/spatie`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        onUpdate(res?.data)
        setImage(null);
        setSelectedMenu([]);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo(error); }
  };

  const title = !selectedDataId ? 'Add SubMenu' : 'Update SubMenu';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
          <TextField label="Submenu Name" variant="outlined" value={formData.name} name="name" fullWidth onChange={handleChange} required/>
          <TextField label="Submenu URL" variant="outlined" value={formData.url} name="url" fullWidth onChange={handleChange} required/>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MediaImage media={formData.media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
            <ImageUpload name="image" label="Upload Image" required={!selectedDataId} error={imageError} onChange={(name, file) => { setImage(file); }}/>
          </div>
          <StatusSelect value={formData.status} onChange={handleChange} />
          <FormControl sx={{ width: "100%" }}>
            <InputLabel id="submenu-permission-select-label" sx={{ background: "#fff" }}>Permission</InputLabel>
            <Select labelId="submenu-permission-select-label" id="submenu-permission-select" name="permission_id" value={formData.permission_id} onChange={handleChange}
              renderValue={(selected) => {
                const permissionSelected = permissions.find((r) => r._id === selected);
                return permissionSelected ? permissionSelected.name : "";
              }}
            >
              {permissions?.map((i, index) => (
                <MenuItem key={index} value={i._id}><Checkbox checked={formData.permission_id === i._id} /><ListItemText primary={i.name} /></MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ width: "100%" }}>
            <InputLabel id="permission-select-label" sx={{ background: "#fff" }}>Menus</InputLabel>
            <Select multiple value={formData.selectedMenu || []} onChange={handleMenuChange}
              renderValue={(selected) => (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {selected.map((id, index) => {
                    const submenu = menus.find((r) => String(r._id) === String(id));
                    return <Chip key={index} label={submenu?.name} />;
                  })}
                </Box>
              )}
            >
              {menus?.map((i, index) => (
                <MenuItem key={index} value={String(i._id)}>
                  <Checkbox checked={(formData.selectedMenu || []).includes(String(i._id))}/>
                  <ListItemText primary={i.name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button type="submit" variant="contained" color="primary">{title}</Button>
        </Box>
      </form>
    </CustomModal>
  );
}
