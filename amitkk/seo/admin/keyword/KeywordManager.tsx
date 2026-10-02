"use client";

import KeywordModal
from "@amitkk/seo/admin/keyword/keyword-modal";

interface Props {
  module: string;

  modal: {
    open: boolean;

    selectedDataId: string;

    handleClose: () => void;

    handleUpdate: () => Promise<void>;
  };
}

export default function KeywordManager({
  module,
  modal,
}: Props) {

  return (
    <KeywordModal
      open={modal.open}
      handleClose={modal.handleClose}
      onUpdate={modal.handleUpdate}
      selectedDataId={null}
      module={module}
      module_id={modal.selectedDataId}
    />
  );
}