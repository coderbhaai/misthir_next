"use client"

import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import ShareMe from "@amitkk/basic/static/ShareMe";
import CommentPanel from "@amitkk/basic/admin/comment/CommentPanel";
import AuthorCard from "@amitkk/basic/static/AuthorCard";
import type { SingleBlogPageProps } from "@amitkk/blog/types";
import SuggestBlogs from "@amitkk/blog/static/suggest-blog";
import DateFormat from "@amitkk/components/admin/date-format";
import ContentRenderer from "@amitkk/basic/static/ContentRenderer";
import { useCallback, useEffect, useState } from "react";
import type { RelatedContent } from "@amitkk/basic/types";

interface DataProps {
  blog: SingleBlogPageProps;
  relatedContent: RelatedContent;
}

interface BlogFormProps {
    selectedDataURL?: string;
}

export const PageForm: React.FC<BlogFormProps> = ({ selectedDataURL = '' }) => {
    const [blog, setBlog] = useState<SingleBlogPageProps>();
    const [relatedContent, setRelatedContent] = useState<RelatedContent>();

    const fetchSingleData = useCallback(async () => {
        if (!selectedDataURL) return;

        try {
            const res = await apiRequest("GET", `blog/blogs?function=get_single_blog_by_url&slug=${selectedDataURL}`);

            setBlog(res?.data || null);
            setRelatedContent(res?.relatedContent || { faq: [], testimonials: [], comments: [], blogs: [] });

        } catch (error) { clo( error ); }
    }, [selectedDataURL]);

    useEffect(() => { if (selectedDataURL) { fetchSingleData(); } }, [selectedDataURL]);

    if( !blog ){ return null; }

    const imagePath = (blog?.media_id as any)?.path || "/images/static/default.jpg";
    const imageAlt = (blog?.media_id as any)?.alt || "Inspiration Image";
    
    return(
        <>
        </>
    )
}

export default PageForm;