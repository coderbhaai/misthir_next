"use client";

import { Edit } from "lucide-react";
import { SingleModuleContentProps } from "@amitkk/basic/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@amitkk/components/basic/table";
import { Button } from "@amitkk/components/button/button";

interface ContentListProps {
  data?: SingleModuleContentProps[];
  onEdit: (id: string) => void;
}

const ContentList: React.FC<ContentListProps> = ({data = [], onEdit}) => {
  if (!data.length) {
    return (
      <p className="text-sm text-muted-foreground">No Content</p>
    );
  }

  return (
    <div className="my-3">
      <h3 className="text-base font-bold mb-4">
        Content
      </h3>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Heading</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Display Order</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((i) => (
            <TableRow key={i._id}>
              <TableCell>{i.heading}</TableCell>
              <TableCell>{i.status ? "Active" : "Inactive"}</TableCell>
              <TableCell>{i.displayOrder}</TableCell>
              <TableCell><Button variant="ghost" size="icon" onClick={() => onEdit(i._id)}><Edit className="h-4 w-4"/></Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContentList;