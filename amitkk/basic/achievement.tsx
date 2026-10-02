"use client";

import { useCallback } from "react";
import { AdminTableLayout } from "@amitkk/basic/utils/layouts/AdminTableLayout";
import { apiRequest, clo } from "@amitkk/basic/utils/my-utils/admin-utils";
import { AdminDataTable, GroupedAchievement } from "@amitkk/basic/admin/achievement/admin-achievement-table";
import DataModal from "@amitkk/basic/admin/achievement/achievement-modal";
import { useAdminPage } from "hooks/useAdminPage";
import { useAdminModal } from "hooks/useAdminModal";

export function AdminAchievements() {
  const admin = useAdminPage<GroupedAchievement>({ listEndpoint: "basic/pages", listFunction: "get_filtered_achievements" });
  const modal = useAdminModal();

  const { setData } = admin;
  const { handleClose, handleOpen, setExtraData } = modal;

  const refreshSingle = useCallback(async (module: string, module_id: string) => {
    if (!module || !module_id) return;

    try {
      const res = await apiRequest("POST", "basic/basic", {
        function: "get_single_achievement",
        module,
        module_id,
      });

      const achievements = res?.data;

      if (!Array.isArray(achievements)) {
        clo("Invalid data received:", achievements);
        return;
      }

      const newGroup = {
        module: module.toString(),
        module_id: module_id.toString(),
        achievements,
      };

      setData((prevData = []) => {
        const exists = prevData.some(
          (i) => String(i.module) === String(newGroup.module) && String(i.module_id) === String(newGroup.module_id)
        );

        return exists
          ? prevData.map((i) =>
              String(i.module) === String(newGroup.module) && String(i.module_id) === String(newGroup.module_id) 
                ? { ...i, ...newGroup } 
                : i
            )
          : [...prevData, newGroup];
      });

      handleClose();
    } catch (error) {
      clo(error);
    }
  }, [setData, handleClose]);
    
  const handleUpdate = async (module: string, module_id: string) => {
    await refreshSingle(module, module_id);
  };

  // --- THE FIX: Bind the modal open sequence to the table actions ---
  const enhancedAdmin = {
    ...admin,
    handleAddNew: () => {
      // Clear out selected references so it knows it is a clean "Create" operation
      setExtraData({ selectedModule: "", selectedModuleId: "" });
      handleOpen();
    }
  };

  const FILTER_CONFIG = [
    { name: "SearchFilter", grid: "col-span-5" },
    { name: "ModuleFilter", grid: "col-span-2" },
    { name: "ModuleIdFilter", grid: "col-span-3" },
    { name: "StatusFilter", grid: "col-span-2" },
  ] as const;

  const head = [
    { id: "module", label: "Module" },
    { id: "moduleId", label: "Module Id" },
    { id: "values", label: "Values" },
    { id: "", label: "" },
  ];

  return (
    <AdminTableLayout admin={enhancedAdmin} title="Achievements" addButtonLabel="New Achievement" filters={FILTER_CONFIG} head={head}
      rows={(admin.data || []).map((i) => (
        <AdminDataTable key={`${i.module}_${i.module_id}`} row={i} onEdit={(row) => { handleOpen(); setExtraData({ selectedModule: row.module, selectedModuleId: row.module_id }); }}/>
      ))}>
      <DataModal open={modal.open} handleClose={modal.handleClose} selectedModule={modal.extraData?.selectedModule} selectedModuleId={modal.extraData?.selectedModuleId} onUpdate={handleUpdate}/>
    </AdminTableLayout>
  );
}

export default AdminAchievements;