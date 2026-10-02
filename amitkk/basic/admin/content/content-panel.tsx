"use client"

import * as React from 'react';
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { useState } from 'react';
import ContentList from './ContentList';
import { SingleModuleContentProps } from '@amitkk/basic/types';
import ContentModal from './content-modal';
import { Button } from '@amitkk/components/button/button';

type DataProps = {
  module:string;
  module_id:string;
}

export default function ContentPanel({ module, module_id }: DataProps) {
  if( !module_id ){ return null; }
  
  const [open, setOpen] = useState(false);
  const handleClose = () => {
      setOpen(false);
      setSelectedId(null);
  };

  const [data, setData] = React.useState<SingleModuleContentProps[]>([]);

  React.useEffect(() => {
    const init = async () => {
      try {
        const res = await apiRequest("POST", `basic/keyword`, {
          function: "get_module_content",
          module,
          module_id
        });

        setData(res?.data || []);
      } catch (e) { clo(e); }
    };
    init();
  }, [open, module, module_id]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const handleEdit = (id: string) => {
    setSelectedId(id);
    setOpen(true);
  };

  const updateData = async () => {
      handleClose();      
  };

  const modalProps = { open, handleClose, onUpdate: updateData, selectedDataId: selectedId, module, module_id };

  return (
    <>
      <ContentList data={data} onEdit={handleEdit}/>
      <Button type="button" color="primary" onClick={()=> setOpen(true)}>Content</Button>
      <ContentModal {...modalProps} />
    </>
  );
}
