import { apiRequest, clo, hitToastr } from "@amitkk/basic/utils/utils";
import { Switch } from "@mui/material";
import { useState } from "react";

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
      
      const res = await apiRequest("post", `basic/page`, {
        'function' : "status_switch",
        'model' : modelName,
        'status' : newStatus,
        '_id' : id
      });
      setChecked(newStatus);
      onStatusChange?.(id, newStatus);

      hitToastr('success', res?.message);
    } catch (error) { clo( error ); }
    setLoading(false);
  };

  return <Switch checked={checked} onChange={handleToggle} disabled={loading} />;
};

export default StatusSwitch;
