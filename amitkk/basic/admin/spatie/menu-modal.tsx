"use client";

import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import type { DataProps } from './admin-menu-table';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { apiRequest, clo, hitToastr, TableDataFormProps } from "@amitkk/basic/utils/my-utils/admin-utils";
import ImageUpload from '@amitkk/components/admin/file-input';
import StatusSelect from '@amitkk/components/admin/status-input';
import MediaImage from '@amitkk/components/admin/table-image';
import type { MediaProps } from '@amitkk/basic/types/media';
import OpenSelect from '@amitkk/components/basic/OpenSelect'; 
import { useFormHandler } from 'hooks/useFormHandler';
import CustomModal from '@amitkk/basic/static/CustomModal';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    _id: "",
    name: "",
    url: "",
    path: "",
    parent_id: null,
    displayOrder: null,
    status: true,
    media_id: null,
    permission_id: null, 
  };

  const [formData, setFormData] = React.useState<DataProps>(initialFormData);
  const handleChange = useFormHandler(setFormData);
  
  const [image, setImage] = useState<File | null>(null);
  const [parents, setParents] = useState<any[]>([]);
  const [permissionOptions, setPermissionOptions] = useState<{ _id: string; name: string }[]>([]);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    setImage(null);
    handleClose();
  };

  const initData = useCallback(async () => {
      try {
          const res = await apiRequest("GET", `basic/spatie?function=get_all_permissions`);
          setPermissionOptions(res?.data ?? []);
      } catch (error) { clo(error); }
  }, []);
  useEffect(() => { initData(); }, [initData]);

  React.useEffect(() => {
    if (!open) return;

    apiRequest("GET", "basic/menu?function=get_parent_menus")
      .then(res => setParents(res?.data ?? []))
      .catch(clo);
  }, [open]);

  React.useEffect(() => {
    if (!open || !selectedDataId) return;

    apiRequest("GET", `basic/menu?function=get_single_menu&id=${selectedDataId}`).then(res => {
      setFormData({
        _id:  res?.data?._id,
        name:  res?.data?.name,
        url:  res?.data?.url,
        path:  res?.data?.path,
        parent_id:  res?.data?.parent_id ?? null,
        displayOrder:  res?.data?.displayOrder ?? 0,
        status:  res?.data?.status,
        media_id:  res?.data?.media_id ?? null,
        permission_id:  res?.data?.permission_id ?? null,
      });
    }).catch(clo);

  }, [open, selectedDataId]);

  const parentOptions = useMemo(() => {
    const formatted = parents.map((p) => ({
      label: `${"—".repeat(p.depth)} ${p.name}`,
      value: p._id,
    }));
    return [{ label: "— Root —", value: "root" }, ...formatted];
  }, [parents]);

  const pOptions = useMemo(() => {
    const formatted = permissionOptions.map((p) => ({
      label: p.name,
      value: p._id,
    }));
    return [{ label: "None", value: "none" }, ...formatted];
  }, [permissionOptions]);

  // Helper function to extract current active selection ID safely for OpenSelect
  const currentPermissionValue = useMemo(() => {
    if (!formData.permission_id) return "none";
    if (typeof formData.permission_id === "string") return formData.permission_id;
    return formData.permission_id._id || "none";
  }, [formData.permission_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("function", "create_update_menu");
    fd.append("_id", String( selectedDataId ?? "" ));
    fd.append("name", formData.name);
    fd.append("url", formData.url || "");
    
    // FIXED: Safely query the exact inner properties or variable references to sanitize payload inputs cleanly
    let targetPermissionId = "";
    if (formData.permission_id) {
      if (typeof formData.permission_id === "string") {
        targetPermissionId = formData.permission_id === "none" ? "" : formData.permission_id;
      } else if (formData.permission_id._id) {
        targetPermissionId = formData.permission_id._id;
      }
    }
    fd.append("permission_id", targetPermissionId);
    
    fd.append("parent_id", formData.parent_id === "root" ? "" : (formData.parent_id ?? ""));
    fd.append("displayOrder", String(formData.displayOrder ?? 0));
    fd.append("status", String(formData.status));

    if (formData.media_id && typeof formData.media_id === "object") {
      fd.append("media_id", String( formData.media_id?._id ));
    }

    if (image) fd.append("image", image);

    const res = await apiRequest("POST", "basic/menu", fd);

    if (res?.data) {
      await handleUpdate();
      hitToastr("success", res.message);
      handleCloseModal();
    }
  };

  const title = selectedDataId ? "Update Menu" : "Add Menu";

   return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <TextField label="Menu Name" name="name" value={formData.name} onChange={handleChange} required/>
        <TextField label="Menu URL" name="url" value={formData.url || ""} onChange={handleChange}/>
        
        <OpenSelect name="parent_id"  label="Parent Menu"  showLabel={true}  value={formData.parent_id ?? "root"} options={parentOptions} onChange={(val: any) => setFormData((prev) => ({ ...prev, parent_id: val }))}/>
        <OpenSelect name="permission_id" label="Permission" showLabel={true} value={currentPermissionValue} options={pOptions} onChange={(val: any) => setFormData((prev) => ({ ...prev, permission_id: val === "none" ? null : permissionOptions.find(p => p._id === val) || val }))}/>

        <TextField type="number" label="Display Order" name="displayOrder" value={Number(formData.displayOrder)} onChange={handleChange}/>
        <StatusSelect value={formData.status} onChange={(value) => handleChange("status", value)}/>
        
        <MediaImage media={formData.media_id as MediaProps}/>
        <ImageUpload name="image" label="Upload Image" onChange={(n, f) => setImage(f)}/>
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}