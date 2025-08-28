import { Box, SelectChangeEvent } from "@mui/material";
import StatusSelect from "./status-input";
import DisplayOrder from "./display-order-input";

interface CombinedFieldProps {
  statusValue: boolean | null;
  displayOrderValue?: number;
  onStatusChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => void;
  onDisplayOrderChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => void;
  statusError?: boolean;
  displayOrderError?: boolean;
}

const StatusDisplay: React.FC<CombinedFieldProps> = ({
  statusValue,
  displayOrderValue,
  onStatusChange,
  onDisplayOrderChange,
  statusError,
  displayOrderError,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%' }}>
      <StatusSelect value={statusValue} onChange={onStatusChange} error={statusError}/>
      <DisplayOrder value={displayOrderValue} onChange={onDisplayOrderChange} error={displayOrderError}/>
    </Box>
  );
};

export default StatusDisplay;