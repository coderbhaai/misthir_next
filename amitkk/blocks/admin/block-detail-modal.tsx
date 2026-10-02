import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import { useState, useEffect, useRef, useCallback } from 'react';
import RichTextEditor from '@amitkk/components/admin/ckeditor-input';
import ImageUpload from '@amitkk/components/admin/file-input';
import StatusSelect from '@amitkk/components/admin/status-input';
import MediaImage from '@amitkk/components/admin/table-image';
import CustomModal from '@amitkk/basic/static/CustomModal';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { apiRequest, fetchModuleData, clo, hitToastr } from '@amitkk/basic/utils/my-utils/admin-utils';
import { block_count } from '@amitkk/basic/utils/my-utils/client-utils';
import { extractMediaId } from '@amitkk/basic/utils/my-utils/shared-utils';
import { BlockDetailProps } from '@amitkk/basic/types/blocks';
import type { OptionProps } from '@amitkk/basic/types/generic';
import type { MediaProps } from '@amitkk/basic/types/media';
import { useFormHandler, useSetForm } from 'hooks/useFormHandler';
import OpenSelect from '@amitkk/components/basic/OpenSelect';
import GenericSelect from '@amitkk/components/admin/generic-select';

type DataFormProps = {
  handleClose: () => void;
  selectedData: {
    _id?: string;
    module: string;
    module_id: string | { _id: string };
    block_id: number | null;
  };
  handleUpdate: (updatedData: BlockDetailProps) => void;
};

// Memoized Rich Text Editor to prevent parent re-renders (like typing in text fields) 
// from resetting or freezing the editor instance and cursor position.
const MemoizedRichTextEditor = React.memo(({ 
  label, 
  name, 
  defaultValue, 
  onChange 
}: { 
  label: string; 
  name: string; 
  defaultValue: string; 
  onChange: (val: string) => void; 
}) => {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  return (
    <RichTextEditor 
      label={label} 
      name={name} 
      value={value} 
      onChange={(_, val) => {
        setValue(val);
        onChange(val);
      }} 
      error={null} 
    />
  );
}, (prev, next) => prev.defaultValue === next.defaultValue && prev.label === next.label);

export default function BlockDetailModal({ handleClose, selectedData, handleUpdate }: DataFormProps) {
  const initialFormData: BlockDetailProps = {
    _id: '',
    module: '',
    module_id: '',
    block_id: 0,
    media_id: null,
    mobile_media_id: null,
    heading: '',
    url: '',
    bg_colour: '',
    content_1: '',
    content_2: '',
    content_3: '',
    status: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [formData, setFormData] = useState<BlockDetailProps>(initialFormData);
  const [image, setImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [module_options, setModuleOptions] = useState<OptionProps[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(true);

  const content1Ref = useRef('');
  const content2Ref = useRef('');
  const content3Ref = useRef('');

  const handleChange = useFormHandler(setFormData);
  const setValue = useSetForm(setFormData);
  const isFetchedRef = useRef(false);

  const handleCloseModal = () => {
    isFetchedRef.current = false;
    handleClose();
  };

  useEffect(() => {
    if (formData.module) {
      let isMounted = true;
      const fetchModules = async () => {
        try {
          const module_data = await fetchModuleData(formData.module);
          if (isMounted) setModuleOptions(module_data);
        } catch (error) {
          clo(error);
        }
      };
      fetchModules();
      return () => { isMounted = false; };
    }
  }, [formData.module]);

  useEffect(() => {
    if (selectedData && !isFetchedRef.current) {
      isFetchedRef.current = true;
      
      const moduleId =
        typeof selectedData.module_id === "object" && selectedData.module_id !== null && "_id" in selectedData.module_id
          ? (selectedData.module_id as { _id: string })._id
          : selectedData.module_id;

      const baseModule = selectedData.module || "";
      const baseModuleId = moduleId?.toString() || "";
      const baseBlockId = selectedData.block_id || 0;

      setFormData(prev => ({
        ...prev,
        module: baseModule,
        module_id: baseModuleId,
        block_id: baseBlockId,
      }));

      const fetchBlockDetail = async () => {
        try {
          setLoadingDetails(true);
          const res = await apiRequest("POST", `block/genericBlock`, {
            function: 'get_single_block_detail',
            module: baseModule,
            module_id: baseModuleId,
            block_id: baseBlockId,
          });

          if (res?.data) {
            const data = res.data;
            content1Ref.current = data.content_1 ? String(data.content_1) : "";
            content2Ref.current = data.content_2 ? String(data.content_2) : "";
            content3Ref.current = data.content_3 ? String(data.content_3) : "";

            setFormData({
              _id: data._id ? String(data._id) : "",
              module: baseModule,
              module_id: baseModuleId,
              block_id: baseBlockId,
              heading: data.heading ? String(data.heading) : "",
              url: data.url ? String(data.url) : "",
              bg_colour: data.bg_colour ? String(data.bg_colour) : "",
              status: data.status ?? true,
              createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
              updatedAt: new Date(),
              media_id: data.media_id || null,
              mobile_media_id: data.mobile_media_id || null,
              content_1: content1Ref.current,
              content_2: content2Ref.current,
              content_3: content3Ref.current,
            });
          }
        } catch (error) {
          clo(error);
        } finally {
          setLoadingDetails(false);
        }
      };

      fetchBlockDetail();
    }
  }, [selectedData]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_block_detail");
      formDataToSend.append("module", formData.module || "");
      formDataToSend.append("module_id", String(formData.module_id || ""));
      formDataToSend.append("block_id", formData.block_id?.toString() || "0");
      formDataToSend.append("heading", formData.heading || '');
      formDataToSend.append("url", formData.url || '');
      formDataToSend.append("bg_colour", formData.bg_colour || '');
      formDataToSend.append("status", String(formData.status));
      formDataToSend.append("content_1", content1Ref.current || '');
      formDataToSend.append("content_2", content2Ref.current || '');
      formDataToSend.append("content_3", content3Ref.current || '');
      formDataToSend.append("path", "block");

      const mediaId = extractMediaId(formData.media_id);
      if (mediaId) {
        formDataToSend.append("media_id", String(mediaId));
      }

      const mobileMediaIdToSend = 
        formData.mobile_media_id && typeof formData.mobile_media_id === "object" && "_id" in formData.mobile_media_id 
          ? String((formData.mobile_media_id as MediaProps)._id) 
          : typeof formData.mobile_media_id === "string" && formData.mobile_media_id !== "null" 
            ? formData.mobile_media_id 
            : "";
      formDataToSend.append("mobile_media_id", mobileMediaIdToSend);

      if (image) { formDataToSend.append("image", image); }
      if (mobileImage) { formDataToSend.append("mobileImage", mobileImage); }

      const res = await apiRequest("POST", `block/genericBlock`, formDataToSend);

      if (res?.data) {
        hitToastr('success', res?.message || 'Updated successfully');
        handleUpdate(res.data);
        handleCloseModal();
      }
    } catch (error) {
      clo(error);
    } finally {
      setSubmitting(false);
    }
  };

  const title = 'Update Block Detail';

  const blockNumberOptions = React.useMemo(() => {
    return Array.from({ length: block_count }, (_, i) => {
      const num = i + 1;
      return {
        label: `Block ${num}`,
        value: num,
      };
    });
  }, []);

  const handleContent1Change = useCallback((val: string) => { content1Ref.current = val; }, []);
  const handleContent2Change = useCallback((val: string) => { content2Ref.current = val; }, []);
  const handleContent3Change = useCallback((val: string) => { content3Ref.current = val; }, []);

  return (
    <CustomModal open={true} handleClose={handleCloseModal} title={title}>
      {loadingDetails ? (
        <div className="p-12 text-center text-sm text-gray-500">Loading block details...</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <OpenSelect<number | ""> name="block_id" label="Block" required={true} showLabel={true} value={formData.block_id ?? ""} options={blockNumberOptions} onChange={(val) => setValue("block_id", val === "" ? null : val)}/>

          <GenericSelect label="Select Module" name="module_id" value={formData.module_id?.toString() ?? ""} options={module_options} onChange={(val) => setFormData({ ...formData, module_id: val as string })} required={true} readOnly={true} />
          <TextField label="Heading" value={formData.heading} name="heading" onChange={handleChange}/>
          <TextField label="URL" value={formData.url} name="url" onChange={handleChange}/>
          <TextField label="BG Colour" value={formData.bg_colour} name="bg_colour" onChange={handleChange}/>
          <StatusSelect value={formData.status} onChange={(value) => setValue("status", value)}/>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MediaImage media={formData.media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
            <ImageUpload name="image" label="Upload Image" onChange={(_, file) => { setImage(file); }}/>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <MediaImage media={formData.mobile_media_id as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
            <ImageUpload name="mobileImage" label="Upload Mobile Image" onChange={(_, file) => { setMobileImage(file); }}/>
          </div>
          
          <MemoizedRichTextEditor label="Content 1" name="content_1" defaultValue={content1Ref.current} onChange={handleContent1Change}/>
          <MemoizedRichTextEditor label="Content 2" name="content_2" defaultValue={content2Ref.current} onChange={handleContent2Change}/>
          <MemoizedRichTextEditor label="Content 3" name="content_3" defaultValue={content3Ref.current} onChange={handleContent3Change}/>

          <StickyFormFooter title={title} disabled={submitting}/>
        </form>
      )}
    </CustomModal>
  );
}