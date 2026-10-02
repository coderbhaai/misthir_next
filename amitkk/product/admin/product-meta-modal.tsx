import * as React from 'react';
import { useEffect, useState } from 'react';
import { apiRequest, clo, hasCircularParent, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/my-utils/admin-utils';
import CkEditor from '@amitkk/components/admin/ckeditor-input';
import ImageUpload from '@amitkk/components/admin/file-input';
import MediaImage from '@amitkk/components/admin/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import StatusDisplay from '@amitkk/components/admin/status-display-input';
import type {DataProps} from '@amitkk/product/admin/admin-product-meta-table';
import { useFormHandler, useSetForm } from 'hooks/useFormHandler';
import { TextField } from '@amitkk/components/basic/TextField';
import OpenSelect from '@amitkk/components/basic/OpenSelect';
import { MediaProps } from '@amitkk/basic/types/media';
import { OptionProps } from '@amitkk/basic/types/generic';
import GenericSelect from '@amitkk/components/admin/generic-select';
import MetaInput from '@amitkk/components/admin/meta-input';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    module: '',
    name: '',
    url: '',
    parent_id: '',
    content: '',
    highlight: false,
    status: true,
    displayOrder: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    media_id: '',
    _id: '',
    meta_id: '', title: '', description: '',
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };

  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState<string | null>(null);
  const handleEditorChange = (name: string, value: string) => { setContent(value); };

  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  
  const handleChange = useFormHandler(setFormData);
  const setValue = useSetForm(setFormData);

  const [parentOptions, setParentOptions] = useState<OptionProps[]>([]);
  const [meta, setMeta] = useState<DataProps[]>([]);
  useEffect(() => {
    if (open) {
      const loadParents = async () => {
        const res = await apiRequest("GET", "product/basic?function=get_product_meta_parents");
        
        let list = res?.data || [];
        setMeta(list);
        if (selectedDataId) {
          list = list.filter((item: any) => item._id !== selectedDataId);
        }
        setParentOptions(list);
      };

      loadParents();
    }
  }, [open, selectedDataId]);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `product/basic?function=get_single_product_meta&id=${selectedDataId}`);
  
          setFormData({
            module: res?.data?.module || "",
            name: res?.data?.name || "",
            url: res?.data?.url || "",
            content: res?.data?.content || "",
            highlight: res?.data?.highlight ?? false,
            status: res?.data?.status ?? true,
            displayOrder: res?.data?.displayOrder ?? 0,
            createdAt: res?.data?.createdAt || new Date(),
            updatedAt: new Date(),
            parent_id: res?.data?.parent_id || null,
            media_id: res?.data?.media_id || null,
            _id: res?.data?._id || "",
            meta_id: res?.data?.meta_id?._id,
            title: res?.data?.meta_id?.title || '',
            description: res?.data?.meta_id?.description || '',
          });

          setContent(res?.data?.content || ""); 
        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (formData.parent_id && selectedDataId ) {
      const circular = selectedDataId ? hasCircularParent(meta, selectedDataId, formData.parent_id) : false;
      if (circular) { hitToastr("error", "Circular relationship detected."); return; }
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_product_meta");
      formDataToSend.append("module", formData.module);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("url", formData.url);
      formDataToSend.append("highlight", String(formData.highlight));
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("displayOrder", formData.displayOrder?.toString() || "0");
      formDataToSend.append("content", content);
      formDataToSend.append("parent_id", formData.parent_id as string);
      formDataToSend.append("path", "product_meta");

      const mediaIdToSend = formData.media_id && typeof formData.media_id === "object" && "_id" in formData.media_id 
        ? String((formData.media_id as MediaProps)._id) : typeof formData.media_id === "string" && formData.media_id !== "null" ? formData.media_id : "";
      formDataToSend.append("media_id", mediaIdToSend);

      formDataToSend.append("title", formData.title?.toString() ?? "");
      formDataToSend.append("description", formData.description?.toString() ?? "");
      formDataToSend.append( "meta_id", typeof formData.meta_id === "string" ? formData.meta_id : formData.meta_id?.meta_id?.toString() ?? "" );

      formDataToSend.append("_id", selectedDataId as string);
      if (image) { formDataToSend.append("image", image); }

      const res = await apiRequest("POST", `product/basic`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        handleUpdate()
        setImage(null);
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Product Meta' : 'Update Product Meta';

  const options = [
    { label: "Type", value: "Type" },
    { label: "Category", value: "Category" },
    { label: "Tag", value: "Tag" }
  ];

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <OpenSelect label="Module" name="module" value={formData.module} onChange={(value) => setFormData((prev) => ({...prev, module: value}))} options={options}/>
        <GenericSelect label="Parent" name="parent_id" value={formData.parent_id?.toString() ?? ""} options={parentOptions} onChange={(val) => setFormData({ ...formData, parent_id: val as string })}/>
        <TextField label="Name" value={formData.name} name="name" onChange={handleChange} required/>
        <TextField label="URL" value={formData.url} name="url" onChange={handleChange} required/>
        <OpenSelect name={String(formData.highlight)} label="highlight" value={String(formData.highlight)} onChange={(value) => setValue("highlight", value === "true")} options={[ { label: "Active", value: "true" }, { label: "In Active", value: "false" } ]}/>
        <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={(value) => setFormData((prev) => ({...prev, status: value}))} onDisplayOrderChange={(value) => setFormData((prev) => ({...prev, displayOrder: value}))}/>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <MediaImage media={formData.media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
          <ImageUpload name="image" label="Upload Image" error={imageError} onChange={(name, file) => { setImage(file); }}/>
        </div>
        <MetaInput title={formData.title} description={formData.description} onChange={handleChange}/>
        <CkEditor name="content" value={formData.content} onChange={handleEditorChange} error={contentError} />
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}