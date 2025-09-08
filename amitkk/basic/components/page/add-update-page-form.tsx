"use client"

import React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Button, Checkbox, Chip, FormControl, InputLabel, ListItemText, MenuItem, TextField, Typography } from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import router, { useRouter } from 'next/navigation';
import Grid from '@mui/material/Grid';
import dynamic from "next/dynamic";
import ImageUpload from "@amitkk/basic/components/static/file-input";
import MetaInput from "@amitkk/basic/components/static/meta-input";
import StatusSelect from "@amitkk/basic/components/static/status-input";
import MediaImage from "@amitkk/basic/components/static/table-image";
import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/utils";
import { MediaProps } from "@amitkk/basic/types/page";
const CkEditor = dynamic(() => import("@amitkk/basic/components/static/ckeditor-input"), { 
  ssr: false, loading: () => <p>Loading editor...</p>,
});

interface BlogFormProps {
    selectedDataId?: string;
}

export const PageForm: React.FC<BlogFormProps> = ({ selectedDataId = '' }) => {
    const [formData, setFormData] = React.useState<PageProps>({
        module: 'Page',
        name: '',
        url: '',
        media: '',
        media_id: '',
        page_detail_id: '',
        content: '',
        status: true,
        schema_status: true,
        sitemap: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _id: '',
        meta_id: '', title: '', description: '',        
        faq_title: '',
        faq_text: '',
        blog_title: '',
        blog_text: '',
        contact_title: '',
        contact_text: '',
        testimonial_title: '',
        testimonial_text: '',
    });

    const router = useRouter();

    const [media_id, setMedia_id] = useState("");
    const [content, setContent] = useState("");
    const [contentError, setContentError] = useState<string | null>(null);

    const [image, setImage] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string | null>(null);

    const handleEditorChange = (name: string, value: string) => {
        setContent(value);
    };

    const handleChange = (e: SelectChangeEvent | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value === "true" ? true : value === "false" ? false : value,
        }));
    };

    const fetchSingleData = useCallback(async () => {
        if (!selectedDataId) return;

        try {
            const res = await apiRequest("get", `basic/page?function=get_single_page&id=${selectedDataId}`);

            if (res?.data) {
                setFormData({
                    ...formData,
                    _id: res?.data?.id || '',
                    module: res?.data?.module || 'Page',
                    name: res?.data?.name || '',
                    url: res?.data?.url || '',
                    media: res?.data?.media_id,
                    media_id: res?.data?.media_id?._id,
                    content: res?.data?.content || '',
                    status: Boolean(res?.data?.status),
                    schema_status: Boolean(res?.data?.schema_status),
                    sitemap: Boolean(res?.data?.sitemap),
                    createdAt: new Date(res?.data?.createdAt),
                    updatedAt: new Date(res?.data?.updatedAt),
                    meta_id: res?.data?.meta_id?._id || '',
                    title: res?.data?.meta_id?.title || '',
                    description: res?.data?.meta_id?.description || '',
                    page_detail_id: res?.data?.details?._id || '',
                    faq_title: res?.data?.details?.faq_title || '',
                    faq_text: res?.data?.details?.faq_text || '',
                    blog_title: res?.data?.details?.blog_title || '',
                    blog_text: res?.data?.details?.blog_text || '',
                    contact_title: res?.data?.details?.contact_title || '',
                    contact_text: res?.data?.details?.contact_text || '',
                    testimonial_title: res?.data?.details?.testimonial_title || '',
                    testimonial_text: res?.data?.details?.testimonial_text || '',
                });
                setContent(res?.data?.content);
            }
        } catch (error) { clo( error ); }
    }, [selectedDataId]);

    useEffect(() => { if (selectedDataId) { fetchSingleData(); } }, [selectedDataId]);
      
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("_id", formData._id);
            formDataToSend.append("function", "create_update_page");
            formDataToSend.append("module", formData.module);
            formDataToSend.append("meta_id", String(formData.meta_id));
            formDataToSend.append("page_detail_id", String(formData.page_detail_id));
            formDataToSend.append("name", formData.name);
            formDataToSend.append("url", formData.url);
            formDataToSend.append("content", content);
            formDataToSend.append("status", String(formData.status));
            formDataToSend.append("schema_status", String(formData.schema_status));
            formDataToSend.append("sitemap", String(formData.sitemap));

            formDataToSend.append("title", formData.title);
            formDataToSend.append("description", formData.description);
            formDataToSend.append("faq_title", formData.faq_title);
            formDataToSend.append("faq_text", formData.faq_text);
            formDataToSend.append("blog_title", formData.blog_title);
            formDataToSend.append("blog_text", formData.blog_text);
            formDataToSend.append("contact_title", formData.contact_title);
            formDataToSend.append("contact_text", formData.contact_text);
            formDataToSend.append("testimonial_title", formData.testimonial_title);
            formDataToSend.append("testimonial_text", formData.testimonial_text);

            formDataToSend.append("path", "page");
           const mediaIdToSend = formData.media_id && typeof formData.media_id === "object" && "_id" in formData.media_id 
                   ? String((formData.media_id as MediaProps)._id) : typeof formData.media_id === "string" && formData.media_id !== "null" ? formData.media_id : "";
                 formDataToSend.append("media_id", mediaIdToSend);
                 
            if (image) { formDataToSend.append("image", image); }

            // for (let pair of formDataToSend.entries()) { console.log(pair[0], pair[1]); }

            const res = await apiRequest("post", `basic/page`, formDataToSend);
            hitToastr('success', 'Entry Done');

            router.replace('/admin/pages');
            
        } catch (error) { clo( error ); }
    };
    return(
        <>
            <Box display="flex" alignItems="center" mb={5} sx={{ padding: "1em" }}>
                <Typography variant="h4" flexGrow={1}>{selectedDataId ? "Update Page" : "Add Page"}</Typography>
            </Box>
            <form onSubmit={handleSubmit} style={{ padding: "10px" }}>
                <Grid container spacing={3}>
                    <Grid size={8}>
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2, width: "100%" }}>
                            <TextField label="Page Name" variant="outlined" value={formData.name} name="name" fullWidth onChange={handleChange} required sx={{ gridColumn: "span 1" }}  />
                            <TextField label="URL" variant="outlined" value={formData.url} name="url" fullWidth onChange={handleChange} required sx={{ gridColumn: "span 1" }}/>
                            <StatusSelect value={formData.status} onChange={handleChange}/>
                            <FormControl sx={{ width: "100%" }}>
                                <InputLabel id="schema_status-label">Schema *</InputLabel>
                                <Select labelId="schema_status-label" id="schema_status" name="schema_status" value={String(formData.status)} onChange={handleChange}>
                                    <MenuItem value="true">Active</MenuItem>
                                    <MenuItem value="false">Not Active</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl sx={{ width: "100%" }}>
                                <InputLabel id="sitemap-label">Sitemap *</InputLabel>
                                <Select labelId="sitemap-label" id="sitemap" name="sitemap" value={String(formData.sitemap)} onChange={handleChange}>
                                    <MenuItem value="true">Active</MenuItem>
                                    <MenuItem value="false">Not Active</MenuItem>
                                </Select>
                            </FormControl>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", gridColumn: "span 1" }}>
                                <MediaImage media={formData.media as MediaProps}/>
                                <ImageUpload name="image" required error={imageError} onChange={(name, file) => { setImage(file); }}/>
                            </div>
                        </Box>
                        <MetaInput title={formData.title} description={formData.description} onChange={handleChange}/>
                        <CkEditor label="Content" name="content" value={content} onChange={handleEditorChange} required error={contentError} />
                        <Button type="submit" variant="contained" color="primary" sx={{ mt: 5 }}>{selectedDataId ? "Update Page" : "Add Page"}</Button>
                    </Grid>
                    <Grid size={4}>
                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(1, 1fr)", gap: 2, width: "100%" }}>
                            <TextField label="FAQ Title" variant="outlined" value={formData.faq_title} name="faq_title" fullWidth onChange={handleChange}/>
                            <TextField label="FAQ Text" variant="outlined" value={formData.faq_text} name="faq_text" fullWidth onChange={handleChange} multiline rows={4} />
                            <TextField label="Blog Title" variant="outlined" value={formData.blog_title} name="blog_title" fullWidth onChange={handleChange}/>
                            <TextField label="Blog Text" variant="outlined" value={formData.blog_text} name="blog_text" fullWidth onChange={handleChange} multiline rows={4} />
                            <TextField label="Testimonial Title" variant="outlined" value={formData.testimonial_title} name="testimonial_title" fullWidth onChange={handleChange}/>
                            <TextField label="testimonial Text" variant="outlined" value={formData.testimonial_text} name="testimonial_text" fullWidth onChange={handleChange} multiline rows={4} />
                            <TextField label="Contact Title" variant="outlined" value={formData.contact_title} name="contact_title" fullWidth onChange={handleChange}/>
                            <TextField label="Contact Text" variant="outlined" value={formData.contact_text} name="contact_text" fullWidth onChange={handleChange} multiline rows={4} />
                        </Box>                        
                    </Grid>
                </Grid>
            </form>
        </>
    )
}

export default PageForm;