import dynamic from "next/dynamic";
import { GetServerSideProps } from "next";
import { ComponentType, useMemo } from "react";
import componentMaps from "@amitkk/componentMaps";
import { groupBlockContent, serverApiRequest } from "@amitkk/basic/utils/my-utils/client-utils";
import SingleBlog from "@amitkk/blog/static/single-blog";
import LeadButton from "@amitkk/basic/admin/lead/LeadButton";
import SingleProductPage from "@amitkk/product/static/SingleProductPage";

const MODULE_COMPONENT_MAP: Record<string, ComponentType<any>> = {};

export default function DynamicPage(props: any) {
  const { moduleType, componentKey, slug, data, lang = 'en' } = props;
  
  const activeComponentKey = componentKey || slug;
  const componentEntry = componentMaps.internalComponentMap?.[activeComponentKey] || componentMaps.internalComponentMap?.[slug];
  
  const CustomPage = useMemo(() => {
    if (componentEntry?.loader) {
      return dynamic(componentEntry.loader, {
        loading: () => <div className="flex items-center justify-center min-h-[50vh]">Loading...</div>,
      }) as ComponentType<any>;
    }
    return null;
  }, [componentEntry]);
  
  const resolvedModule = moduleType || props?.data?.modelName || "Blog";
  const resolvedModuleId = data?._id || data?.page_id?._id || data?.product?._id;

  let pageContent = null;
  if (CustomPage) {
    pageContent = <CustomPage {...props} lang={lang} />;
  } else {
    const ModuleComponent = MODULE_COMPONENT_MAP[moduleType];
    if (ModuleComponent) {
      pageContent = <ModuleComponent data={props.data} relatedContent={props.relatedContent} groupedBlocks={props.groupedBlocks} groupedDetails={props.groupedDetails} lang={lang} />;
    } else if (resolvedModule === "Product" || props?.data?.skus) {
      pageContent = (
        <SingleProductPage product={props?.data?.product || props?.data} relatedContent={props?.relatedContent} reviews={props?.reviews || []}/>
      );
    } else {
      pageContent = <SingleBlog data={props?.data?.data || props?.data} relatedContent={props?.relatedContent} blogs={props?.data?.blogs} destinations={props?.data?.destinations} categories={props?.data?.categories} tags={props?.data?.tags} lang={lang} />;
    }
  }

  return (
    <>
      {pageContent}
      {resolvedModuleId && <LeadButton module={resolvedModule} module_id={resolvedModuleId} />}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, params, res }) => {
  try {
    const slugArray = params?.slug as string[];
    const slug = slugArray ? slugArray.join('/') : '';
    if (!slug) return { notFound: true };

    const apiRes = await serverApiRequest(req, "GET", `basic/routing?function=resolve_route&url=${encodeURIComponent(slug)}`);
    if (!apiRes) { return { notFound: true }; }

    if (apiRes.redirectUrl) {
      const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`;
      const normalizedRedirect = apiRes.redirectUrl.startsWith('/') ? apiRes.redirectUrl : `/${apiRes.redirectUrl}`;

      if (normalizedRedirect !== normalizedSlug) {
        return {
          redirect: {
            destination: encodeURI(normalizedRedirect),
            permanent: false,
          },
        };
      }
    }
    
    if (!apiRes.data) { return { notFound: true }; }

    const lang = apiRes.lang || 'en';
    const { groupedBlocks, groupedDetails } = await groupBlockContent(apiRes?.blockContent ?? null);
    
    const meta = {
      ...(apiRes?.seo || {}),
      schema: apiRes?.schema || null,
      path: `/${slug}`
    };

    // Extract product-specific fields if moduleType is Product
    const moduleType = apiRes.moduleType || apiRes.module || "Blog";
    let productProps = {};

    if (moduleType === "Product") {
      const productData = apiRes.data?.data || apiRes.data;
      const reviews = Array.isArray(apiRes.reviews) ? apiRes.reviews : [];
      const relatedContent = apiRes.relatedContent || { faq: [], testimonials: [], blogs: [], products: [] };
      
      productProps = {
        product: productData,
        reviews,
        relatedContent,
      };
    }
    
    return {
      props: {
        meta: meta || null,
        slug: slug,
        lang,
        moduleType,
        componentKey: apiRes.componentKey || apiRes.component_key || null,
        data: apiRes.data,
        relatedContent: apiRes.relatedContent || { faq: [], testimonials: [], comments: [], blogs: [], services: [], destinations: [] },
        groupedBlocks: groupedBlocks || null,
        groupedDetails: groupedDetails || null,
        ...productProps,
      },
    };
  } catch (error) {
    return { notFound: true };
  }
};