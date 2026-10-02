// components/SeoHead.tsx
import Head from "next/head";

export interface SeoMetaProps {
  title?: string;
  description?: string;
  robots?: string;
  canonical?: string;
  ogType?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noIndex?: boolean;
  path?: string;
  schema?: Record<string, any>;
}

interface SeoProps {
  meta?: SeoMetaProps;
}

export default function SeoHead({ meta }: SeoProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.amitkk.ae";
  
  let path = meta?.path || "/";
  path = path.split("?")[0].split("#")[0];
  if (path !== "/" && path.endsWith("/")) { path = path.slice(0, -1); }
  const defaultCanonical = `${baseUrl}${path}`;

  const title = meta?.title || "AMITKK";
  const description = meta?.description || "AMITKK";
  const robots = meta?.robots || (meta?.noIndex ? "noindex,nofollow" : "index,follow");
  const canonicalUrl = meta?.canonical || defaultCanonical;

  const ogType = meta?.ogType || "website";
  const ogImage = meta?.ogImage ? `${baseUrl}${meta.ogImage}` : `${baseUrl}/images/logo.svg`;

  const twitterCard = meta?.twitterCard || "summary_large_image";
  const twitterImage = meta?.twitterImage ? `${baseUrl}${meta.twitterImage}` : ogImage;

  const jsonLdSchema = meta?.schema || null;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />
      <link rel="icon" href="/images/icons/static/favicon.png" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="format-detection" content="telephone=no" />
      
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="AMITKK" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:secure_url" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={twitterImage} />

      {jsonLdSchema && ( <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}/> )}
      <script dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-5SJVF6S5');`,
          }}/>
    </Head>
  );
}