import { Button } from '@amitkk/components/button/button';
import { useGlobalModal } from "contexts/GlobalModalContext";

interface FinalCallProps {
  heading: string;
  text: string;
  module_id?: string;
}

export default function FinalCall({ heading, text, module_id = "" }: FinalCallProps) {
  const { openGlobalModal } = useGlobalModal();

  return (
    <div className="flex items-center justify-center text-center py-6 md:py-12">
      <div className="container py-5 md:py-12">
          <h3 className="text-center">{heading}</h3>
          <p>{text}</p>
          <div className="flex justify-center">
            <Button onClick={() => openGlobalModal("lead", { module_id }) }>Book Free Consultation</Button>
          </div>
      </div>
    </div>
  );
}