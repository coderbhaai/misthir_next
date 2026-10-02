import React, { useEffect } from "react";
import { useForm, apiRequest, hitToastr, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { SingleCommentProps } from "@amitkk/basic/types/shared";
import { useAuth } from "contexts/AuthContext";
import { TextField } from "@amitkk/components/basic/TextField";
import { Button } from '@amitkk/components/button/button';
import { Textarea } from "@amitkk/components/basic/textarea";


export default function CommentForm({ module, module_id, }: { module: string; module_id: string; }){
  const { isLoggedIn, user } = useAuth();
  const { formData, setFormData, handleChange } = useForm<SingleCommentProps>({
    _id: '',
    name: '',
    email: '',
    content: '',
    status: true,
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
      const res = await apiRequest("POST", `basic/comment`, formData);



      setFormData({
        // function: 'create_update_comment',
        _id: res?.data?._id,
        name: res?.data?.name,
        email: res?.data?.email,
        content: res?.data?.content,
        status: res?.data?.status,
        module: res?.data?.module,
        module_id: res?.data?.module_id,
      });
      
      hitToastr('success', res.message);
      setFormData(prev => ({ ...prev, content: '' }));

    } catch (error) { clo( error ); }
  };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex">
              <TextField label='Name' value={formData.name} name='name' onChange={handleChange} required/>
              <TextField label='Email' value={formData.email} name='email' onChange={handleChange} required/>
            </div>
            <Textarea label="Your Comments" value={formData.content} name="content" onChange={handleChange} required rows={2}/>
            <Button type='submit'>Add Comment</Button>
          </div>
        </form>
    );
}