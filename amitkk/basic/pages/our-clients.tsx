import React from "react";
import Image from "next/image";
import { useSearchFilter } from "hooks/useSearchFilter";
import SearchInput from "@amitkk/basic/utils/filters/SearchInput";
import { ClientProps } from "@amitkk/basic/types";
  
export default function OurClients({ data }: any) {
  const { searchQuery, setSearchQuery, filteredData } = useSearchFilter(data, (item: ClientProps) => `${item.brand || ""}` );
 
  return (
    <div className="container py-5">
      <h1 className="text-center mt-5 font-bold mb-5">Our Clients</h1>

      <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="Search Clients..."/>
      
      <div className="row">
        {filteredData?.map?.((row) => {
          const imagePath = typeof row.media_id === "string" ? "/default.jpg" : (row.media_id as any)?.path || "/default.jpg";
          const imageAlt = typeof row.media_id === "string" ? row.name || "Inspiration Image" : (row.media_id as any)?.alt || "Inspiration Image";

          return (
            <div className="col-span-12 md:col-span-2 my-3" key={String(row._id)}>
              <Image src={imagePath} alt={imageAlt} width={250} height={180} className="object-contain mx-auto" style={{ height: "60px", width: "auto" }}/>
            </div>
          );
        })}
      </div>
    </div>      
  );
}