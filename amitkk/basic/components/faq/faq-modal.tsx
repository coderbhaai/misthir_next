import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { DataProps } from "@amitkk/basic/components/faq/admin-faq-table";
import CkEditor from '@amitkk/basic/components/static/ckeditor-input';
import StatusDisplay from '@amitkk/basic/components/static/status-display-input';
import CustomModal from '@amitkk/basic/static/CustomModal';
import { TableDataFormProps, apiRequest, clo, hitToastr } from '@amitkk/basic/utils/utils';

type DataFormProps = TableDataFormProps & {
  module:string;
  module_id:string;
  onUpdate: (updatedData: DataProps) => void;
};

export default function DataModal({ open, handleClose, selectedDataId, onUpdate, module, module_id }: DataFormProps) {
  const [module_options, setModuleOptions] = React.useState<{_id: string; name: string}[]>([]);
  const [contentError, setContentError] = React.useState<string | null>(null);

  const initialFormData: DataProps = {
    function: "create_update_faq",
    module: module,
    module_id: module_id,
    question: '',
    answer: '',
    status: true,
    displayOrder:0,
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
    if (!formData.module) { return; }
    
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
  }, [formData.module]);

  const handleSelectChange = (event: SelectChangeEvent<unknown>, child: React.ReactNode) => {
    const { name, value } = event.target as { name: string; value: string };
    setFormData((prevData) => ({ ...prevData, [name]: value, }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: name === "status" ? value === "true" : value, }));
  };

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("get", `basic/page?function=get_single_faq&id=${selectedDataId}`);

          setFormData({
            function: 'create_update_faq',
            module: res?.data?.module || '',
            module_id: res?.data?.module_id?._id || '',
            question: res?.data?.question || '',
            answer: res?.data?.answer || '',
            status: res?.data?.status ?? true,
            displayOrder: res?.data?.displayOrder ?? 0,
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
    const updatedData: DataProps = {...formData, answer: formData.answer, updatedAt: new Date(), _id: selectedDataId as string};

    try {
      const res = await apiRequest("post", `basic/page`, updatedData);

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

  const title = !selectedDataId ? 'Add FAQ' : 'Update FAQ';
  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
        <form onSubmit={handleSubmit}>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
            <FormControl sx={{width: '100%'}}>
              <InputLabel id="type-simple-select-label">Module<span style={{ color: 'red' }}>*</span></InputLabel>
              <Select labelId="type-simple-select-label" id="type-simple-select" name="module" value={formData.module || ""} onChange={handleSelectChange} >
                <MenuItem value="Blog">Blog</MenuItem>
                <MenuItem value="Page">Page</MenuItem>
                <MenuItem value="Product">Product</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ width: "100%"}}>
              <InputLabel id="status-label">Module Name<span style={{ color: "red" }}>*</span></InputLabel>
              <Select labelId="status-label" id="status" name="module_id" value={module_options?.some(opt => opt._id.toString() === formData.module_id?.toString()) ? formData.module_id?.toString() : ""} onChange={handleChange}>
                {module_options?.length > 0 && module_options.map(({ _id, name }) => (
                  <MenuItem key={_id} value={_id}>{name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={handleChange} onDisplayOrderChange={handleChange}/>
            <TextField label='Question' variant='outlined' value={formData.question} name='question' fullWidth onChange={handleChange} required/>
            <CkEditor label="Answer" name="answer" value={formData.answer} onChange={handleEditorChange} required error={contentError} />
            <Button type='submit' variant='contained' color='primary'>{title}</Button>
          </Box>
        </form>
    </CustomModal>
  );
}
