import * as React from "react";
import { useState } from "react";
import { TextField } from "@amitkk/components/basic/TextField";
import type { DataProps } from "@amitkk/basic/admin/review/admin-review-table";
import CustomModal from "@amitkk/basic/static/CustomModal";
import { TableDataFormProps, apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import StatusDisplay from '@amitkk/components/admin/status-display-input';
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { MediaHubProps } from "@amitkk/basic/types/media";
import { useFormHandler } from "hooks/useFormHandler";
import OpenSelect from "@amitkk/components/basic/OpenSelect";

type DataFormProps = TableDataFormProps & {
  handleUpdate: () => Promise<void>;
};

export default function DataModal({ open, handleClose, selectedDataId, handleUpdate }: DataFormProps) {
  const initialFormData: DataProps = {
    _id: "",
    module: "",
    module_id: "",
    user_id: "",
    rating: 0,
    review: "",
    status: true,
    displayOrder: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [formData, setFormData] = React.useState<DataProps>(initialFormData);
  const [mediaHub, setMediaHub] = useState<MediaHubProps[]>([]);
  const handleCloseModal = () => {
    setFormData(initialFormData);
    setMediaHub([]);
    handleClose();
  };

  const handleChange = useFormHandler(setFormData);

  React.useEffect(() => {
    if (open && selectedDataId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("GET", `basic/review?function=get_single_review&id=${selectedDataId}`);

          setFormData({
            _id: res?.data._id || "",
            module: res?.data.module || "",
            module_id: res?.data.module_id || "",
            user_id: res?.data.user_id || "",
            rating: res?.data.rating || 0,
            review: res?.data.review || "",
            status: res?.data.status ?? true,
            displayOrder: res?.data.displayOrder || 0,
            createdAt: res?.data.createdAt || new Date(),
            updatedAt: new Date(),
          });

          setMediaHub(res?.data?.mediaHub || []);
        } catch (error) { clo(error); }
      };

      fetchData();
    }
  }, [open, selectedDataId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("function", "update_review");
      formDataToSend.append("module", formData.module);
      formDataToSend.append("module_id", String(formData.module_id));
      formDataToSend.append("user_id", String(formData.user_id));
      formDataToSend.append("review", formData.review);
      formDataToSend.append("rating", String(formData.rating ?? 0));

      const res = await apiRequest("POST", `basic/review`, formData);

      if (res?.data) {
        setFormData(initialFormData);
        setMediaHub([]);
        await handleUpdate();
        hitToastr("success", res?.message);
      }
    } catch (error) { clo(error); }
  };

  const title = !selectedDataId ? "Add Review" : "Update Review";

  const starOptions = [
    { label: "1", value: 1 },
    { label: "2", value: 2 },
    { label: "3", value: 3 },
    { label: "4", value: 4 },
    { label: "5", value: 5 },
  ];

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <OpenSelect<number> name="rating" label="Rating" required value={formData.rating || ""} placeholder="Select rating" options={starOptions} onChange={(value) => setFormData((prev) => ({ ...prev, rating: value }))}/>
        <TextField label="Review" value={formData.review} name="review" onChange={handleChange} required/>
        <StatusDisplay statusValue={formData.status} displayOrderValue={formData.displayOrder} onStatusChange={(value) => setFormData((prev) => ({...prev, status: value}))} onDisplayOrderChange={(value) => setFormData((prev) => ({...prev, displayOrder: value}))}/>
        <div className="flex flex-wrap">
          {mediaHub?.map((item, i) => {
            const media = typeof item.media_id === "object" ? item.media_id : null;

            return (
              <div key={item._id.toString()} className="m-1 flex h-[100px] w-[100px] overflow-hidden rounded-md border border-gray-300">
                {media?.path && (
                  <img src={media.path} alt={media.alt || `image-${i}`} className="h-full w-full object-cover"/>
                )}
              </div>
            );
          })}
        </div>
        <StickyFormFooter title={title} />
      </form>
    </CustomModal>
  );
}