import * as React from 'react';
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import KeywordModal from './keyword-modal';
import { useState } from 'react';
import KeywordList from './KeywordList';
import { KeywordFormItem } from '@amitkk/seo/types/keyword';
import { Button } from '@amitkk/components/button/button';

type DataProps = {
  module:string;
  module_id:string;
}

export default function KeywordPanel({ module, module_id }: DataProps) {
  if( !module_id ){ return null; }
  
  // KEYWORDS
    const [open, setOpen] = useState(false);
    const [updatedData, setUpdatedData] = useState<boolean | null>(null);
    const handleClose = () => {
        setOpen(false);
        setUpdatedData(null);
    };

    const updateData = async () => { 
        setUpdatedData(true);
        handleClose();
    };
    const modalProps = { open, handleClose, onUpdate: updateData, selectedDataId: null, module, module_id };
  // KEYWORDS

  const [keywords, setKeywords] = React.useState<KeywordFormItem[]>([]);

  React.useEffect(() => {
    const fetchKeywords = async () => {
      try {
        const res = await apiRequest("POST", `/basic/keyword`, {
          function: "get_single_keyword",
          module,
          module_id
        });
        setKeywords(res?.data || []);
      } catch (e) { clo(e); }
    };
    fetchKeywords();
  }, [open, module, module_id]);

  return (
    <div className="block w-full my-5">
      <KeywordList keywords={keywords}/>
      <Button type="button" color="primary" onClick={()=> setOpen(true)}>Keywords</Button>
      <KeywordModal {...modalProps} />
    </div>
  );
}
