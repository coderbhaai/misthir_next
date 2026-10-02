"use client"
import React from "react";
import { useState, useEffect } from "react";
import router, { useRouter } from 'next/navigation';
import dynamic from "next/dynamic";
import { apiRequest, clo, hitToastr, handleMultiSelectChange } from "@amitkk/basic/utils/my-utils/admin-utils";
import { SingleBlogPageProps } from "../types";
import KeywordPanel from "@amitkk/seo/admin/keyword/keyword-panel";
import { extractMediaId } from "@amitkk/basic/utils/my-utils/shared-utils";
import type { MediaProps } from "@amitkk/basic/types/media";
import { OptionProps } from "@amitkk/basic/types/generic";
import { TextField } from "@amitkk/components/basic/TextField";
import { Button } from "@amitkk/components/button/button";
import { useFormHandler } from "hooks/useFormHandler";
import FancySubmitButtonOne from "@amitkk/components/button/FancySubmitButtonOne";
import MediaImage from "@amitkk/components/admin/table-image";
import ImageUpload from "@amitkk/components/admin/file-input";
import GenericSelect from "@amitkk/components/admin/generic-select";
import MultiSelectDropdown from "@amitkk/components/admin/multiselect-dropdown";
import MetaInput from "@amitkk/components/admin/meta-input";

const RichTextEditor = dynamic(() => import("@amitkk/components/admin/ckeditor-input"), { 
  ssr: false, loading: () => <p>Loading editor...</p>,
});

interface DataProps extends SingleBlogPageProps{
    media: string | MediaProps;
    title: string;
    description: string;
}

interface DataFormProps {
    dataId?: string;
}  

export const BlogForm: React.FC<DataFormProps> = ({ dataId = '' }) => {
    const [formData, setFormData] = React.useState<DataProps>({
        name: '',
        url: '',
        status: true,
        media: '',
        media_id: '',
        author_id: '',
        category: [],
        tag: [],
        content: '',
        createdAt: new Date(),
        updatedAt: new Date(),
        _id: '',
        meta_id: '', title: '', description: '',
    });
    const handleChange = useFormHandler(setFormData);

    const router = useRouter();

    const [content, setContent] = useState("");
    const [author_options, setAuthorOptions] = useState<OptionProps[]>([]);

    const [image, setImage] = useState<File | null>(null);    
    const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
    const [category, setCategory] = useState<OptionProps[]>([]);

    const [selectedTag, setSelectedTag] = useState<string[]>([]);
    const [tag, setTag] = useState<OptionProps[]>([]);

    React.useEffect(() => {
        const init_data = async () => {
            try {
                const res = await apiRequest("GET", `blog/blogs?function=get_options_for_blog`);
                setCategory(res?.data?.categories ?? []);
                setTag(res?.data?.tags ?? []);
                setAuthorOptions(res?.data?.authors ?? []);
          } catch (error) { clo( error ); }
        };
        init_data(); 
    }, []);

    const handleEditorChange = (name: string, value: string) => { setContent(value); };

    useEffect(() => {
        if (dataId) {
            const fetchSingleEntry = async () => {
                try {
                    const res = await apiRequest("GET", `blog/blogs?function=get_single_blog&id=${dataId}`);
                    
                    if (res?.data) {
                        const metas = res?.data.metas || [];

                        // const categories = metas.filter((m: any) => m.blogmeta_id?.type === 'category')?.map((m: any) => m.blogmeta_id);
                        // const tags = metas.filter((m: any) => m.blogmeta_id?.type === 'tag')?.map((m: any) => m.blogmeta_id);

                        // const categoryIds = categories?.map((i: any) => i._id);
                        // const categoryNames = categories?.map((i: any) => i.name);

                        // const tagIds = tags?.map((i: any) => i._id);
                        // const tagNames = tags?.map((i: any) => i.name);

                        setFormData({
                            name: res?.data.name,
                            url: res?.data.url,
                            media: res?.data.media_id,
                            status: res?.data.status,
                            media_id: res?.data.media_id?._id,
                            author_id: res?.data.author_id?._id || '',
                            content: res?.data.content,
                            createdAt: res?.data.createdAt,
                            updatedAt: res?.data.updatedAt,
                            _id: res?.data.id,
                            meta_id: res?.data.meta_id?._id || '',
                            title: res?.data.meta_id?.title || '',
                            description: res?.data.meta_id?.description || '',
                        });

                        setContent(res?.data.content);
                    }
                } catch (error) { clo( error ); }
            }
            fetchSingleEntry();
        }
    }, [dataId]);
      
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("function", "create_update_blog");
            formDataToSend.append("_id", formData._id);
            formDataToSend.append("name", formData.name);
            formDataToSend.append("url", formData.url);
            formDataToSend.append("author_id", formData.author_id as string);
            formDataToSend.append("status", String(formData.status));
            formDataToSend.append("content", content);
            const blogmeta = [...selectedCategory, ...selectedTag];
            
            formDataToSend.append("meta_id", formData.meta_id as string || "");
            formDataToSend.append("title", formData.title);
            formDataToSend.append("description", formData.description);

            formDataToSend.append("blogmeta", JSON.stringify(blogmeta));
            formDataToSend.append("path", "blog");

            const mediaId = extractMediaId(formData.media_id);
            if (mediaId) { formDataToSend.append("media_id", mediaId); }

            if (image) { formDataToSend.append("image", image); }

            const res = await apiRequest("POST", `blog/blogs`, formDataToSend);
            
            hitToastr('success', res?.message);
            if( !dataId && res?.data ){ router.replace('/admin/blogs'); }
        } catch (error) { clo( error ); }
    };

    const title = !dataId ? 'Add Blog' : 'Update Blog';
    
    return(
        <>
            <div className="py: 3">
                <h1 className="text-xl font-bold">{title}</h1>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "10px" }}>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <TextField label="Blog Name" value={formData.name} name="name" onChange={handleChange} required />
                    <TextField label="Blog URL" value={formData.url} name="url" onChange={handleChange} required />
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", gridColumn: "span 1" }}>
                        <MediaImage media={formData.media as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
                        <ImageUpload name="image" required onChange={(name, file) => { setImage(file); }}/>
                    </div>
                    <GenericSelect label="Author" name="author_id" value={formData.author_id?.toString() ?? ""} options={author_options} onChange={(val) => setFormData({ ...formData, author_id: val as string })}/>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <MultiSelectDropdown label="Category" options={category} selected={selectedCategory} onChange={(e) => handleMultiSelectChange(e, setSelectedCategory)}/>
                    <MultiSelectDropdown label="Tags" options={tag} selected={selectedTag} onChange={(e) => handleMultiSelectChange(e, setSelectedTag)}/>
                </div>

                <MetaInput title={formData.title} description={formData.description} onChange={handleChange}/>

                <RichTextEditor label="Blog Content" name="content" value={content} onChange={handleEditorChange} required />
                <div>
                    {dataId && (
                        <KeywordPanel module="Blog" module_id={dataId}/>
                    )}

                    <FancySubmitButtonOne text={title}/>
                </div>
            </form>

            <a href="/admin/blog" className="text-sm font-medium text-blue-600 hover:underline">Back to All Blogs</a>
        </>
    )
}

export default BlogForm;