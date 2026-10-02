"use client"

import React, { useRef } from "react";
import { useState, useEffect, useCallback } from "react";
import router, { useRouter } from 'next/navigation';
import StatusSelect from "@amitkk/components/admin/status-input";
import { apiRequest, clo, fetchAllModules, hitToastr, ModuleData } from "@amitkk/basic/utils/my-utils/admin-utils";
import { modules } from "@amitkk/basic/utils/config";
import { extractMediaId } from "@amitkk/basic/utils/my-utils/shared-utils";
import { SinglePageProps } from "@amitkk/basic/types/page";
import type { MediaProps } from "@amitkk/basic/types/media";
import { TextField } from "@amitkk/components/basic/TextField";
import { Textarea } from "@amitkk/components/basic/textarea";
import { useFormHandler, useSetForm } from "hooks/useFormHandler";
import MediaPanel, { MediaPanelHandle } from "../media/media-panel";
import KeywordPanel from "@amitkk/seo/admin/keyword/keyword-panel";
import FancySubmitButtonOne from "@amitkk/components/button/FancySubmitButtonOne";
import dynamic from "next/dynamic";
import OpenSelect from "@amitkk/components/basic/OpenSelect";
import GenericSelect from "@amitkk/components/admin/generic-select";
import MediaImage from "@amitkk/components/admin/table-image";
import ImageUpload from "@amitkk/components/admin/file-input";
import MetaInput from "@amitkk/components/admin/meta-input";

const RichTextEditor = dynamic(() => import("@amitkk/components/admin/ckeditor-input"), { 
  ssr: false, loading: () => <p>Loading editor...</p>,
});

interface BlogFormProps {
    dataId?: string;
}

export const PageForm: React.FC<BlogFormProps> = ({ dataId = '' }) => {
    const [formData, setFormData] = React.useState<SinglePageProps>({
        _id: '',
        module: '',
        name: '',
        url: '',
        media: '',
        media_id: '',
        page_id: '',
        content: '',
        status: true,
        schema_status: true,
        sitemap: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        meta_id: '', title: '', description: '',        
        faq_title: '',
        faq_text: '',
        blog_title: '',
        blog_text: '',
        contact_title: '',
        contact_text: '',
        achievement_title: '',
        achievement_text: '',
        testimonial_title: '',
        testimonial_text: '',
        mediaHub_title: '',
        mediaHub_text: '',
        service_title: "",
        service_text: "",
        technology_title: "",
        technology_text: "",
        portfolio_title: "",
        portfolio_text: "",
    });

    const handleChange = useFormHandler(setFormData);
    const setValue = useSetForm(setFormData);

    const router = useRouter();
    const [content, setContent] = useState("");
    const [image, setImage] = useState<File | null>(null);

    const handleEditorChange = (name: string, value: string) => {
        setContent(value);
    };

    // Module Options
        const [module_options, setModuleOptions] = useState<ModuleData[]>([]);
        const initData = useCallback(async () => {
            try {
                const module_data = await fetchAllModules();
                setModuleOptions(module_data);     
            } catch (error) { clo(error); }
        }, []);
        useEffect(() => { initData(); }, [initData]);
    // Module Options

    const fetchSingleData = useCallback(async () => {
        if (!dataId) return;

        try {
            const res = await apiRequest("GET", `basic/page?function=get_single_page&id=${dataId}`);

            if (res?.data) {
                setFormData({
                    ...formData,
                    _id: res?.data?.id || '',
                    module: res?.data?.module || 'Page',
                    module_id: res?.data?.module_id || 'Page',
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
                    page_id: res?.data?._id || '',
                    faq_title: res?.data?.details?.faq_title || '',
                    faq_text: res?.data?.details?.faq_text || '',
                    blog_title: res?.data?.details?.blog_title || '',
                    blog_text: res?.data?.details?.blog_text || '',
                    contact_title: res?.data?.details?.contact_title || '',
                    contact_text: res?.data?.details?.contact_text || '',
                    achievement_title: res?.data?.details?.achievement_title || '',
                    achievement_text: res?.data?.details?.achievement_text || '',
                    testimonial_title: res?.data?.details?.testimonial_title || '',
                    testimonial_text: res?.data?.details?.testimonial_text || '',
                    mediaHub_title: res?.data?.details?.mediaHub_title || '',
                    mediaHub_text: res?.data?.details?.mediaHub_text || '',
                    service_title: res?.data?.details?.service_title || '',
                    service_text: res?.data?.details?.service_text || '',
                    technology_title: res?.data?.details?.technology_title || '',
                    technology_text: res?.data?.details?.technology_text || '',
                    portfolio_title: res?.data?.details?.portfolio_title || '',
                    portfolio_text: res?.data?.details?.portfolio_text || '',
                });
                setContent(res?.data?.content);
            }
        } catch (error) { clo( error ); }
    }, [dataId]);

    useEffect(() => { if (dataId) { fetchSingleData(); } }, [dataId]);
      
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const formDataToSend = new FormData();
            formDataToSend.append("_id", formData._id);
            formDataToSend.append("function", "create_update_page");
            formDataToSend.append("module", formData.module);
            formDataToSend.append("meta_id", String(formData.meta_id));
            formDataToSend.append("page_id", String(formData.page_id));
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
            formDataToSend.append("achievement_title", formData.achievement_title);
            formDataToSend.append("achievement_text", formData.achievement_text);
            formDataToSend.append("testimonial_title", formData.testimonial_title);
            formDataToSend.append("testimonial_text", formData.testimonial_text);
            formDataToSend.append("mediaHub_title", formData.mediaHub_title);
            formDataToSend.append("mediaHub_text", formData.mediaHub_text);
            formDataToSend.append("service_title", formData.service_title);
            formDataToSend.append("service_text", formData.service_text);
            formDataToSend.append("technology_title", formData.technology_title);
            formDataToSend.append("technology_text", formData.technology_text);
            formDataToSend.append("portfolio_title", formData.portfolio_title);
            formDataToSend.append("portfolio_text", formData.portfolio_text);

            formDataToSend.append("path", "page");
            const mediaId = extractMediaId(formData.media_id);
            if (mediaId) { formDataToSend.append("media_id", mediaId); }
                 
            if (image) { formDataToSend.append("image", image); }

            const res = await apiRequest("POST", `basic/page`, formDataToSend);
            
            hitToastr('success', res?.message);
            if( !dataId && res?.data ){router.replace('/admin/pages'); }
            
        } catch (error) { clo( error ); }
    };

    const [selectedMediaIds, setSelectedMediaIds] = useState<any[]>([]);
    const handleSelect = (mediaIds: string[]) => { setSelectedMediaIds(mediaIds); };
    const mediaPanelRef = useRef<MediaPanelHandle>(null);

    const title = !dataId ? 'Add Page' : 'Update Page';

    return(
        <>
            <div className="py: 3">
                <h1 className="text-3xl font-bold">{dataId ? "Update Page" : "Add Page"}</h1>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: "10px" }}>
                <div className="row">
                    <div className="col-span-12 md:col-span-8">
                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <TextField label="Page Name" value={formData.name} name="name" onChange={handleChange} required />
                            <TextField label="URL" value={formData.url} name="url" onChange={handleChange} required />
                            <OpenSelect label="Module" name="module" value={formData.module} onChange={(value) => setFormData((prev) => ({...prev, module: value}))} options={modules.map((item) => ({label: item, value: item}))}/>
                            <GenericSelect label="Select Module" name="module_id" value={formData.module_id?.toString() ?? ""} options={module_options} onChange={(val) => setFormData({ ...formData, module_id: val as string })}/>
                            <StatusSelect value={formData.status} onChange={(value) => setValue("status", value)}/>
                            <OpenSelect label="Schema" name="schema_status" value={formData.schema_status} onChange={(value) => setFormData((prev) => ({...prev, schema_status: value}))} options={[ { label: "Active", value: true }, { label: "Not Active", value: false } ]}/>
                            <OpenSelect label="Sitemap" name="sitemap" value={formData.sitemap} onChange={(value) => setFormData((prev) => ({...prev, sitemap: value}))} options={[ { label: "Active", value: true }, { label: "Not Active", value: false } ]}/>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", gridColumn: "span 1" }}>
                                <MediaImage media={formData.media as MediaProps}/>
                                <ImageUpload name="image" required onChange={(name, file) => { setImage(file); }}/>
                            </div>
                        </div>
                        
                        <MetaInput title={formData.title} description={formData.description} onChange={handleChange} fullWidth={true}/>

                        <RichTextEditor label="Content" name="content" value={content} onChange={handleEditorChange} required />
                        <div className="flex flex-col my-5">
                            <FancySubmitButtonOne text={title}/>
                            <a href="/admin/pages" className="text-sm font-medium text-blue-600 hover:underline">Back to All Pages</a>
                        </div>

                    </div>
                    <div className="col-span-12 md:col-span-4 space-y-4 pl-3">
                        <TextField label="FAQ Title" value={formData.faq_title} name="faq_title" onChange={handleChange}/>
                        <Textarea label="FAQ Text" value={formData.faq_text} name="faq_text" onChange={handleChange} rows={4} />
                        <TextField label="Blog Title" value={formData.blog_title} name="blog_title" onChange={handleChange}/>
                        <Textarea label="Blog Text" value={formData.blog_text} name="blog_text" onChange={handleChange} rows={4} />
                        <TextField label="Testimonial Title" value={formData.testimonial_title} name="testimonial_title" onChange={handleChange}/>
                        <Textarea label="testimonial Text" value={formData.testimonial_text} name="testimonial_text" onChange={handleChange} rows={4} />
                        <TextField label="Contact Title" value={formData.contact_title} name="contact_title" onChange={handleChange}/>
                        <Textarea label="Contact Text" value={formData.contact_text} name="contact_text" onChange={handleChange} rows={4} />
                        <TextField label="Achievement Title" value={formData.achievement_title} name="achievement_title" onChange={handleChange}/>
                        <Textarea label="Achievement Text" value={formData.achievement_text} name="achievement_text" onChange={handleChange} rows={4} />
                        <TextField label="MediaHub Title" value={formData.mediaHub_title} name="mediaHub_title" onChange={handleChange}/>
                        <Textarea label="MediaHub Text" value={formData.mediaHub_text} name="mediaHub_text" onChange={handleChange} rows={4} />
                        <TextField label="Service Title" value={formData.service_title} name="service_title" onChange={handleChange}/>
                        <Textarea label="Service Text" value={formData.service_text} name="service_text" onChange={handleChange} rows={4} />
                        <TextField label="Technology Title" value={formData.technology_title} name="technology_title" onChange={handleChange}/>
                        <Textarea label="Technology Text" value={formData.technology_text} name="technology_text" onChange={handleChange} rows={4} />
                        <TextField label="Portfolio Title" value={formData.portfolio_title} name="portfolio_title" onChange={handleChange}/>
                        <Textarea label="Portfolio Text" value={formData.portfolio_text} name="portfolio_text" onChange={handleChange} rows={4} />
                    </div>
                </div>
            </form>

            {dataId && (
                <div className="row my-5">
                    {formData.module && (
                        <div className="col-span-12 md:col-span-12">
                            <KeywordPanel module={formData.module} module_id={dataId}/>
                        </div>
                    )}
                    <div className="col-span-12 md:col-span-12">
                        <MediaPanel ref={mediaPanelRef} module={formData.module} module_id={dataId} onSelect={handleSelect} selectedMediaIds={selectedMediaIds}/>
                    </div>
                </div>
            )}
        </>
    )
}

export default PageForm;