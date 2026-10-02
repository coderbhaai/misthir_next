import * as React from "react";
import { useState,  useCallback } from "react";
import { apiRequest, TableDataFormPropsModule } from "@amitkk/basic/utils/my-utils/admin-utils";
import StatusSelect from "@amitkk/components/admin/status-input";
import CustomModal from "@amitkk/basic/static/CustomModal";
import StickyFormFooter from '@amitkk/components/ui/StickyFormFooter';
import { hitToastr, clo } from '@amitkk/basic/utils/my-utils/admin-utils';
import type { MediaProps } from "@amitkk/basic/types/media";
import { TextField } from "@amitkk/components/basic/TextField";
import ModuleSelector from "@amitkk/components/admin/ModuleSelector";
import MediaImage from "@amitkk/components/admin/table-image";
import ImageUpload from "@amitkk/components/admin/file-input";

type DataFormProps = TableDataFormPropsModule & {
  onUpdate: (module: string, module_id: string) => void;
};

const initialAchievement = {
  _id: "",
  name: "",
  value: null as number | null,
  status: true,
  displayOrder: null,
  media_id: "" as string | MediaProps,
  image: null as File | null,
};

export default function DataModal({ open, handleClose, selectedModule, selectedModuleId, onUpdate }: DataFormProps) {
  const [formData, setFormData] = useState({
    module: "",
    module_id: "",
  });

  const handleModuleChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "module") { updated.module_id = ""; }
      return updated;
    });
  };

  const [achievements, setAchievements] = useState([
    { ...initialAchievement },
    { ...initialAchievement },
    { ...initialAchievement },
    { ...initialAchievement },
  ]);

  const handleAchievementChange = useCallback(
    (index: number, field: keyof typeof initialAchievement, value: any) => {
      setAchievements((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
      });
    },
    []
  );

  const addAchievement = useCallback(() => {
    setAchievements((prev) => [...prev, { ...initialAchievement }]);
  }, []);

  const handleCloseModal = () => {
    setFormData({ module: "", module_id: "" });
    setAchievements([
      { ...initialAchievement },
      { ...initialAchievement },
      { ...initialAchievement },
      { ...initialAchievement },
    ]);
    handleClose();
  };

  React.useEffect(() => {
    if (open && selectedModule && selectedModuleId) {
      const fetchData = async () => {
        try {
          const res = await apiRequest("POST", `basic/basic`, {
            function: "get_single_achievement",
            module: selectedModule,
            module_id: selectedModuleId,
          });

          if (res?.data?.length) {
            const fetchedAchievements = res.data.map((a: any) => ({
              _id: a._id || "",
              name: a.name || "",
              value: a.value !== undefined && a.value !== null ? Number(a.value) : null,
              status: a.status ?? true,
              displayOrder: a.displayOrder || 0,
              media_id: a.media_id || "",
              image: null,
            }));

            setFormData({
              module: selectedModule.toString(),
              module_id: selectedModuleId.toString(),
            });

            setAchievements(fetchedAchievements);
          }
        } catch (error) { clo(error) }
      };

      fetchData();
    }
  }, [open, selectedModule, selectedModuleId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formDataToSend = new FormData();

      formDataToSend.append("function", "create_update_achievement");
      formDataToSend.append("module", formData.module);
      formDataToSend.append("module_id", formData.module_id);

      achievements.forEach((a, index) => {
        formDataToSend.append(`achievements[${index}][_id]`, a._id || "");
        formDataToSend.append(`achievements[${index}][name]`, a.name || "");
        formDataToSend.append(`achievements[${index}][value]`, String(a.value ?? ""));
        formDataToSend.append(`achievements[${index}][status]`, String(a.status ?? false));
        formDataToSend.append(`achievements[${index}][displayOrder]`, String(a.displayOrder ?? 0));

        // ✅ FIXED HERE — correct key name and clean check
        if (a.media_id && typeof a.media_id === "object" && "_id" in a.media_id) {
          formDataToSend.append(`achievements[${index}][media_id]`, (a.media_id as any)._id);
        } else if (typeof a.media_id === "string" && a.media_id.trim() !== "") {
          formDataToSend.append(`achievements[${index}][media_id]`, a.media_id);
        }

        if (a.image instanceof File) {
          formDataToSend.append(`achievements[${index}][image]`, a.image);
        }
      });

      const res = await apiRequest("POST", `basic/basic`, formDataToSend);

      if (res?.data) {
        hitToastr("success", res.message);
        onUpdate(formData.module, formData.module_id as string);
        handleCloseModal();
      }
    } catch (error) {
      clo(error);
    }
  };

  const title = !selectedModuleId ? "Add Achievements" : "Update Achievements";

  return (
    <CustomModal open={open} handleClose={handleCloseModal} title={title}>
      <form onSubmit={handleSubmit} className="space-y-4">
          <ModuleSelector formData={formData} onFieldChange={handleModuleChange}/>
          {achievements.map((ach, index) => (
            <div key={index} className="space-y-4 rounded-lg border p-4">
              <TextField label="Name" value={ach.name} onChange={(e) => handleAchievementChange(index, "name", e.target.value)}/>
              <div className="row">
                <div className="md:col-span-6">
                  <TextField label="Value" type="number" value={ach.value ?? ""} onChange={(e) => handleAchievementChange(index, "value", Number(e.target.value))}/>
                </div>
                <div className="md:col-span-3">
                  <StatusSelect value={ach.status} onChange={(value) => handleAchievementChange(index, "status", value)}/>
                </div>
                <div className="md:col-span-3">
                  <TextField label="Display Order" type="number" value={ach.displayOrder} onChange={(e) => handleAchievementChange(index, "displayOrder", Number(e.target.value))}/>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <MediaImage media={ach.media_id as MediaProps} className="h-[70px] w-[120px] rounded-md"/>
                <ImageUpload name={`image_${index}`} label="Upload Image" onChange={(_, file) => handleAchievementChange(index, "image", file)}/>
              </div>
            </div>
          ))}

          <button type="button" onClick={addAchievement} className="text-sm font-medium text-blue-600 hover:underline">➕ Add More Achievements</button>
          <StickyFormFooter title={title}/>
      </form>
    </CustomModal>
  );
}
