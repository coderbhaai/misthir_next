"use client"
import React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Button, Checkbox, Chip, FormControl, InputLabel, ListItemText, MenuItem, TextField, Typography } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import router, { useRouter } from 'next/navigation';
import dynamic from "next/dynamic";
import ImageUpload from "@amitkk/basic/components/static/file-input";
import MetaInput from "@amitkk/basic/components/static/meta-input";
import MultiSelectDropdown from "@amitkk/basic/components/static/multiselect-dropdown";
import MediaImage from "@amitkk/basic/components/static/table-image";
import { apiRequest, clo, hitToastr, handleMultiSelectChange } from "@amitkk/basic/utils/utils";
import { MediaProps } from "@amitkk/basic/types/page";
import { SingleBlogPageProps } from "../types/blog";
import GenericSelect from "@amitkk/basic/components/static/generic-select";

const CkEditor = dynamic(() => import("@amitkk/basic/components/static/ckeditor-input"), { 
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

    const router = useRouter();

    useEffect(() => {
        if (dataId) {
            const fetchSingleEntry = async () => {
                try {
                    const res = await apiRequest("get", `blog/blogs?function=get_single_blog&id=${dataId}`);
                    
                    if (res?.data) {
                        const metas = res?.data.metas || [];

                        const categories = metas.filter((m: any) => m.blogmeta_id?.type === 'category')?.map((m: any) => m.blogmeta_id);
                        const tags = metas.filter((m: any) => m.blogmeta_id?.type === 'tag')?.map((m: any) => m.blogmeta_id);

                        const categoryIds = categories?.map((i: any) => i._id);
                        const categoryNames = categories?.map((i: any) => i.name);

                        const tagIds = tags?.map((i: any) => i._id);
                        const tagNames = tags?.map((i: any) => i.name);

                        setFormData({
                            name: res?.data.name,
                            url: res?.data.url,
                            media: res?.data.media_id,
                            media_id: res?.data.media_id?._id,
                            author_id: res?.data.author_id?._id || '',
                            category: categoryNames,
                            tag: tagNames,
                            content: res?.data.content,
                            createdAt: res?.data.createdAt,
                            updatedAt: res?.data.updatedAt,
                            _id: res?.data.id,
                            meta_id: res?.data.meta_id?._id || '',
                            title: res?.data.meta_id?.title || '',
                            description: res?.data.meta_id?.description || '',
                        });

                        setContent(res?.data.content);
                        setSelectedCategory(categoryIds);
                        setSelectedTag(tagIds);                        
                    }
                } catch (error) { clo( error ); }
            }
            fetchSingleEntry();
        }
    }, [dataId]);

    const [media_id, setMedia_id] = useState("");
    const [content, setContent] = useState("");
    const [contentError, setContentError] = useState<string | null>(null);
    const [author_id, setAuthor_id] = useState("");
    const [author_options, setAuthorOptions] = React.useState<{_id: string; name: string}[]>([]);

    const [image, setImage] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);
    
    const [selectedCategory, setSelectedCategory] = React.useState<string[]>([]);
    const [category, setCategory] = React.useState<{_id: string; name: string}[]>([]);

    const [selectedTag, setSelectedTag] = React.useState<string[]>([]);
    const [tag, setTag] = React.useState<{_id: string; name: string}[]>([]);

    React.useEffect(() => {
        const fetchCategory = async () => {
          try {
            const res_1 = await apiRequest("get", `blog/blogmeta?function=get_category`);
            setCategory(res_1.data ?? []);
          } catch (error) { clo( error ); }
        };
        fetchCategory();    
    
        const fetchTags = async () => {
          try {
            const res_2 = await apiRequest("get", `blog/blogmeta?function=get_tag`);
            setTag(res_2.data ?? []);
          } catch (error) { clo( error ); }
        };
        fetchTags();

        const fetchAuthors = async () => {
            try {
                const res_3 = await apiRequest("get", `blog/author?function=get_all_author`);
                setAuthorOptions(res_3.data ?? []);
            } catch (error) { clo( error ); }
          };
          fetchAuthors();
    }, []);

    const handleEditorChange = (name: string, value: string) => { setContent(value); };
      
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setContentError(!content ? "Content is required." : null);
        if (!content.trim() ) { hitToastr("error", "Content is required!"); return; }

        try {
            const formDataToSend = new FormData();
            formDataToSend.append("function", "create_update_blog");
            formDataToSend.append("_id", formData._id);
            formDataToSend.append("name", formData.name);
            formDataToSend.append("url", formData.url);
            formDataToSend.append("author_id", formData.author_id as string);
            formDataToSend.append("content", content);
            const blogmeta = [...selectedCategory, ...selectedTag];
            
            formDataToSend.append("meta_id", formData.meta_id as string || "");
            formDataToSend.append("title", formData.title);
            formDataToSend.append("description", formData.description);

            formDataToSend.append("blogmeta", JSON.stringify(blogmeta));
            formDataToSend.append("path", "blog");

            const mediaIdToSend = formData.media_id && typeof formData.media_id === "object" && "_id" in formData.media_id 
                    ? String((formData.media_id as MediaProps)._id) : typeof formData.media_id === "string" && formData.media_id !== "null" ? formData.media_id : "";
            formDataToSend.append("media_id", mediaIdToSend);

            if (image) { formDataToSend.append("image", image); }

            const result = await apiRequest("post", `blog/blogs`, formDataToSend);
            hitToastr('success', 'Entry Done');

            router.replace('/admin/blogs');
            
        } catch (error) { clo( error ); }
    };

    const handleAuthorChange = (e: SelectChangeEvent) => {
        const { value } = e.target;
    
        setFormData((prevData) => ({
          ...prevData,
          author_id: value,
        }));
    };

    const handleChange = (e: SelectChangeEvent | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value === "true" ? true : value === "false" ? false : value,
        }));
    };

    const title = !dataId ? 'Add Blog' : 'Update Blog';
    
    return(
        <>
            <Box display="flex" alignItems="center" mb={5} sx={{ padding: "1em" }}>
                <Typography variant="h4" flexGrow={1}>{title}</Typography>
            </Box>
            <form onSubmit={handleSubmit} style={{ padding: "10px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, width: "100%" }}>
                        <TextField label="Blog Name" variant="outlined" value={formData.name} name="name" fullWidth onChange={handleChange} required sx={{ gridColumn: "span 1" }}  />
                        <TextField label="Blog URL" variant="outlined" value={formData.url} name="url" fullWidth onChange={handleChange} required sx={{ gridColumn: "span 1" }}  />
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", gridColumn: "span 1" }}>
                            <MediaImage media={formData.media as MediaProps} style={{ marginRight: "10px", width: "120px", height: "70px" }}/>
                            <ImageUpload name="image" required error={imageError} onChange={(name, file) => { setImage(file); }}/>
                        </div>
                        <GenericSelect label="State" name="author_id" value={formData.author_id?.toString() ?? ""} options={author_options} onChange={(val) => setFormData({ ...formData, author_id: val as string })}/>
                    </Box>

                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, width: "100%" }}>
                        <MultiSelectDropdown label="Category" options={category} selected={selectedCategory} onChange={(e) => handleMultiSelectChange(e, setSelectedCategory)}/>
                        <MultiSelectDropdown label="Tags" options={tag} selected={selectedTag} onChange={(e) => handleMultiSelectChange(e, setSelectedTag)}/>                        
                    </Box>

                    <MetaInput title={formData.title} description={formData.description} onChange={handleChange}/>

                    <CkEditor label="Blog Content" name="content" value={content} onChange={handleEditorChange} required error={contentError} />
                    <Button type="submit" variant="contained" color="primary">{title}</Button>
                </Box>
            </form>
        </>
    )
}

export default BlogForm;