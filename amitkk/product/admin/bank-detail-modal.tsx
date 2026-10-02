import * as React from 'react';
import type {DataProps} from '@amitkk/product/admin/admin-bank-detail-table';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { useFormHandler } from 'hooks/useFormHandler';
import { apiRequest, clo, hitToastr, TableDataFormProps } from '@amitkk/basic/utils/my-utils/admin-utils';
import { TextField } from '@amitkk/components/basic/TextField';
import SingleUserDropdown from '@amitkk/basic/admin/spatie/SingleUserDropdown';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    _id: '',
    user_id: '',
    account: '',
    ifsc: '',
    bank: '',
    branch: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  const [formData, setFormData] = React.useState<DataProps>(initialFormData);

  const handleCloseModal = () => {
    setFormData(initialFormData);
    handleClose();
  };
  
  const handleChange = useFormHandler(setFormData);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `payment/document?function=get_single_bank_detail&id=${selectedDataId}`);
  
          setFormData({
            _id: res?.data?._id || "",
            user_id: res?.data?.user_id?._id || "",
            account: res?.data?.account || "",
            ifsc: res?.data?.ifsc || "",
            bank: res?.data?.bank ?? true,
            branch: res?.data?.branch || null,
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
    const updatedData: DataProps = {...formData, updatedAt: new Date(), _id: selectedDataId as string};

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "create_update_bank_detail");
      formDataToSend.append("_id", selectedDataId as string);
      formDataToSend.append("account", formData.account);
      formDataToSend.append("ifsc", formData.ifsc);
      formDataToSend.append("bank", formData.bank);
      formDataToSend.append("branch", formData.branch);
      formDataToSend.append("user_id", formData.user_id as string);

      const res = await apiRequest("POST", `payment/document`, formDataToSend);

      if( res?.data ){
        setFormData(initialFormData);
        await handleUpdate();
        hitToastr('success', res?.message);
      }
    } catch (error) { clo( error ); }
  };

  const title = !selectedDataId ? 'Add Bank Detail' : 'Update Bank Detail';

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <SingleUserDropdown value={formData.user_id} onChange={(val) => handleChange("user_id", val)}/>
        <TextField label="Account" value={formData.account} name="account" onChange={handleChange} required/>
        <TextField label="IFSC" value={formData.ifsc} name="ifsc" onChange={handleChange} required/>
        <TextField label="Bank" value={formData.bank} name="bank" onChange={handleChange} required/>
        <TextField label="Branch" value={formData.branch} name="branch" onChange={handleChange} required/>
        <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}