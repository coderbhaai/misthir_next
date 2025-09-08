import { Box, Button, SelectChangeEvent, TextField } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useForm, apiRequest, hitToastr, clo } from "@amitkk/basic/utils/utils";
import { CommentProps } from "@amitkk/blog/types/blog";
import { Types } from "mongoose";

export default function CommentForm({ module, module_id, }: { module: string; module_id: string | Types.ObjectId; }){
  const { formData, setFormData, handleChange } = useForm<CommentProps>({
    function : 'create_update_comment',
    _id: '',
    name: '',
    email: '',
    content: '',
    selectedDataId: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [loggedIn, setLoggedIn] = useState(false);
  const loadUser = useCallback(() => {
    if (typeof window !== "undefined") {
      if ( localStorage.getItem("authToken") ) {
        setLoggedIn(true);
      }
    }
  }, []);

  useEffect(() => {
    loadUser();
    // const handleAuthChange = () => loadUser();
  }, [loadUser]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const updatedData: CommentProps = {...formData, module:module, module_id:module_id as string, function: 'create_update_comment', updatedAt: new Date(), _id: formData.selectedDataId as string | Types.ObjectId };
    try {
      const res = await apiRequest("post", `basic/comment`, updatedData);

      setFormData({
        function: 'create_update_comment',
        _id: res?.data?._id,
        name: res?.data?.name,
        email: res?.data?.email,
        content: res?.data?.content,
        selectedDataId: res?.data?._id,
      });
      
      hitToastr('success', res.message);
    } catch (error) { clo( error ); }
  };

    return (
        <form onSubmit={handleSubmit}>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, width: '100%'}}>
            <Box sx={{display: 'flex', gap: 2, width: '100%'}}>
              <TextField label='Name' variant='outlined' value={formData.name} name='name' fullWidth onChange={handleChange} required/>
              <TextField label='Email' variant='outlined' value={formData.email} name='email' fullWidth onChange={handleChange} required/>
            </Box>
            <TextField label="Your Comments" variant="outlined" value={formData.content} name="description" fullWidth onChange={handleChange} required multiline rows={2}/>
            <Button type='submit' variant='contained' color='primary'>Add Comment</Button>
          </Box>
        </form>
    );
}