import { useState } from "react";
import { TextField } from "@amitkk/components/basic/TextField";
import { LinkSection } from "@amitkk/components/basic/LinkSection";

interface SitemapProps {
  _id: string;
  name: string;
  url: string;
}

export default function SiteMapPage({ data }: any) {
  const [search, setSearch] = useState("");

  const filterItems = (items?: SitemapProps[]) => {
    if (!items) return [];
    return items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
  };

  return (
    <section className="container mx-auto px-4 py-5 md:py-12">
      <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-center text-action">SITEMAP</h1>

      <div className="my-5 flex justify-center">
        <TextField placeholder="Search links..." value={search} onChange={(e) => setSearch(e.target.value)}/>
      </div>

      <LinkSection title="Portfolio" items={filterItems(data.portfolios)} getHref={(i: { url: any; }) =>  `/${i.url}`}/>
      <LinkSection title="Services" items={filterItems(data.services)} getHref={(i: { url: any; }) =>  `/${i.url}`}/>
      <LinkSection title="Technology" items={filterItems(data.technologies)} getHref={(i: { url: any; }) =>  `/${i.url}`}/>
      <LinkSection title="Service Type" items={filterItems(data.serviceTypes)} getHref={(i: { url: any; }) =>  `/${i.url}`}/>
      <LinkSection title="Technology Type" items={filterItems(data.technologyType)} getHref={(i: { url: any; }) =>  `/${i.url}`}/>
      <LinkSection title="Pages" items={filterItems(data.pages)} getHref={(i: { url: any; }) => i.url}/>
      <LinkSection title="Blogs" items={filterItems(data.blogs)} getHref={(i: { url: any; }) =>  `/${i.url}`}/>
    </section>
  );
}