import * as React from 'react';
import { TextField } from '@amitkk/components/basic/TextField';
import { apiRequest, clo, hitToastr, TableDataFormProps } from "@amitkk/basic/utils/my-utils/admin-utils";
import CustomModal from '@amitkk/basic/static/CustomModal';
import { ShortCodeProps } from '@amitkk/basic/types';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { useFormHandler } from 'hooks/useFormHandler';
import StatusSelect from '@amitkk/components/admin/status-input';
import ModuleCheckboxList from '@amitkk/components/admin/ModuleCheckboxList';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: ShortCodeProps & { selectedModuleIds: string[]; } = {
    _id: "",
    call_id: null,
    module: "",
    status: true,
    details: [],
    selectedModuleIds: [],
  };

  const [formData, setFormData] = React.useState(initialFormData);  

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };
  
  const handleChange = useFormHandler(setFormData);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `basic/shortCode/shortcode?function=get_single_short_code&id=${selectedDataId}`);

          const details = res?.data?.details || [];

          setFormData({
            _id: res?.data?._id,
            call_id: res?.data?.call_id,
            module: res?.data?.module,
            status: res?.data?.status ?? true,
            details,
            selectedModuleIds: details.map(
              (d: any) => String(d.module_id?._id || d.module_id)
            ),
          });
        } catch (error) { clo( error ); }
      };
      fetchData();
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
       const details = Array.isArray(formData.selectedModuleIds) ? formData.selectedModuleIds.map((id) => ({ module: formData.module, module_id: id })) : [];

      const payload = {
        function: "create_update_short_code",
        _id: selectedDataId,
        call_id: formData.call_id,
        module: formData.module,
        status: formData.status,
        details,
      };

      const res = await apiRequest("POST", "basic/shortCode/shortcode", payload);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Short Code' : 'Update Chort Code';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <TextField label="Call ID" type="number" value={String(formData.call_id)} name="call_id" onChange={handleChange} required/>
          <StatusSelect value={formData.status} onChange={(value) => handleChange("status", value)}/>

          <ModuleCheckboxList value={{ module: formData.module, module_ids: formData.selectedModuleIds }} onChange={({ module, module_ids }) => setFormData((prev) => ({ ...prev, module, selectedModuleIds: module_ids })) }/>
          
          <StickyFormFooter title={title}/>
        </div>
      </form>
    </CustomModal>
  );
}