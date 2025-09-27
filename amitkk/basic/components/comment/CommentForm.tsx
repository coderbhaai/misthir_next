import { Box, Button, SelectChangeEvent, TextField } from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { useForm, apiRequest, hitToastr, clo } from "@amitkk/basic/utils/utils";
import { CommentProps } from "@amitkk/blog/types/blog";
import { Types } from "mongoose";
import { useAuth } from "contexts/AuthContext";

export default function CommentForm({ module, module_id, }: { module: string; module_id: string | Types.ObjectId; }){
  const { isLoggedIn, user } = useAuth();
  const { formData, setFormData, handleChange } = useForm<CommentProps>({
    function : 'create_update_comment',
    _id: '',
    name: '',
    email: '',
    content: '',
    module,
    module_id: module_id as string,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData(prev => ({
        ...prev,
        name: user.name ?? '',
        email: user.email ?? '',
      }));
    }
  }, [isLoggedIn, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const res = await apiRequest("post", `basic/comment`, formData);

      setFormData({
        function: 'create_update_comment',
        _id: res?.data?._id,
        name: res?.data?.name,
        email: res?.data?.email,
        content: res?.data?.content,
        module: res?.data?.module,
        module_id: res?.data?.module_id,
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
            <TextField label="Your Comments" variant="outlined" value={formData.content} name="content" fullWidth onChange={handleChange} required multiline rows={2}/>
            <Button type='submit' variant='contained' color='primary'>Add Comment</Button>
          </Box>
        </form>
    );
}