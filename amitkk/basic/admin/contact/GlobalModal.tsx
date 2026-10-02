import CustomModal from "@amitkk/basic/static/CustomModal";
import { useGlobalModal } from "contexts/GlobalModalContext";
import { MODAL_COMPONENTS, ModalType } from "contexts/modalRegistry";

const titleMap: Record<ModalType, string> = {
  contact: "Connect With Us",
  lead: "Connect With Us",
};

export default function GlobalModal() {
  const { modal, closeModal } = useGlobalModal();

  if (!modal.type || !(modal.type in MODAL_COMPONENTS)) return null;

  const modalConfig = MODAL_COMPONENTS[modal.type as ModalType];
  if (!modalConfig) return null;

  const Component = modalConfig.component;

  return (
    <CustomModal open={true} handleClose={closeModal} title={titleMap[modal.type as ModalType]}>
      <Component {...modal.props} sourceUrl={modal.sourceUrl} handleClose={closeModal} />
    </CustomModal>
  );
}