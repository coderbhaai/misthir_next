"use client";

import { useState } from "react";
import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/my-utils/admin-utils";
import { Switch } from "@amitkk/components/basic/switch";

interface StatusSwitchProps {
  id: string | number;
  status: boolean;
  modelName: string;
  onStatusChange?: (id: string | number, newStatus: boolean) => void;
}

const StatusSwitch: React.FC<StatusSwitchProps> = ({ id, status, modelName, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(status);

  const handleToggle = async () => {
    setLoading(true);

    try {
      const newStatus = !checked;

      const res = await apiRequest("POST", `basic/page`, {
          function: "status_switch",
          _id: id,
          model: modelName,
          status: newStatus,
        }
      );

      setChecked(newStatus);
      onStatusChange?.(id, newStatus);
      hitToastr("success", res?.message);
    } catch (error) { clo(error); }
    setLoading(false);
  };

  return (
    <Switch checked={checked} onCheckedChange={handleToggle} disabled={loading}/>
  );
};

export default StatusSwitch;