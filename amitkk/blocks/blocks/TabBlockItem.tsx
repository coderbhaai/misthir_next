"use client";

import { useState } from "react";
import { TabBlockProps } from "../types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@amitkk/components/ui/tabs";

interface TabBlockItemProps {
  data: TabBlockProps[];
}

export default function TabBlockItem({data}: TabBlockItemProps) {
  if (!data || data.length === 0) { return null; }

  const [active, setActive] = useState(String(data[0]?._id || 0));

  return (
    <div className="container py-6 md:py-12">
      <Tabs value={active} onValueChange={setActive}>
        <TabsList className="w-full justify-start overflow-x-auto">
          {data.map((tab, index) => (
            <TabsTrigger key={String(tab._id) || index} value={String(tab._id || index)}>{tab.menu || `Tab ${index + 1}`}</TabsTrigger>
          ))}
        </TabsList>

        {data.map((tab, index) => (
          <TabsContent key={String(tab._id) || index} value={String(tab._id || index)}>
            <div className="mt-4 rounded-xl border bg-muted/30 p-4">
              <div dangerouslySetInnerHTML={{__html: tab.content || ""}}/>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}