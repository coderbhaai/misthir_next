"use client";

import { useEffect, useState } from "react";
import { useGlobalModal } from "contexts/GlobalModalContext";
import { MODAL_COMPONENTS, ModalType } from "contexts/modalRegistry";
import CustomModal from "@amitkk/basic/static/CustomModal";
import { useMenu } from "contexts/MenuContext";

export default function GlobalModalRenderer() {
  const { modal, closeModal } = useGlobalModal();
  const [cachedType, setCachedType] = useState<ModalType | null>(null);
  const [cachedProps, setCachedProps] = useState<any>(null);
  const [cachedSourceUrl, setCachedSourceUrl] = useState<string | undefined>(undefined);

  const isOpen = !!modal.type;

  useEffect(() => {
    if (modal.type && modal.type in MODAL_COMPONENTS) {
      setCachedType(modal.type as ModalType);
      setCachedProps(modal.props);
      setCachedSourceUrl(modal.sourceUrl);
    }
  }, [modal.type, modal.props, modal.sourceUrl]);
  const currentType = (modal.type || cachedType) as ModalType | null;
  
  if (!currentType || !(currentType in MODAL_COMPONENTS)) {
    return null;
  }
  
  const modalConfig = MODAL_COMPONENTS[currentType];
  const Component = modalConfig.component;
  
  const finalProps = modal.type ? modal.props : cachedProps;
  const finalSourceUrl = modal.type ? modal.sourceUrl : cachedSourceUrl;

  return (
    <CustomModal open={isOpen} handleClose={closeModal} title={modalConfig.title}>
      <Component {...finalProps} sourceUrl={finalSourceUrl} handleClose={closeModal}/>
    </CustomModal>
  );
}